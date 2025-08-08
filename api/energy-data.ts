import { VercelRequest, VercelResponse } from '@vercel/node'

// Consolidated energy data API handler to reduce serverless function count
// Combines multiple energy data endpoints into a single function

// Helper function for CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
}

// CO2 Emissions handler
async function handleCO2Emissions(req: VercelRequest, res: VercelResponse) {
  const { region = 'DK1', startDate, endDate } = req.query

  try {
    let url = `https://api.energidataservice.dk/dataset/CO2Emis?filter={"PriceArea":"${region}"}&sort=Minutes5UTC desc&limit=288`
    
    if (startDate && endDate) {
      url = `https://api.energidataservice.dk/dataset/CO2Emis?filter={"PriceArea":"${region}","Minutes5UTC":{"$gte":"${startDate}","$lte":"${endDate}"}}&sort=Minutes5UTC desc`
    }

    const response = await fetch(url)
    const data = await response.json()

    return res.status(200).json({
      records: data.records || [],
      metadata: {
        region,
        startDate,
        endDate,
        total: data.total || 0,
        unit: 'gCO2/kWh',
        fetchedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching CO2 emissions:', error)
    return res.status(500).json({ error: 'Failed to fetch CO2 emissions data' })
  }
}

// Energy Forecast handler
async function handleEnergyForecast(req: VercelRequest, res: VercelResponse) {
  const { region = 'DK1', type = 'all' } = req.query

  try {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const startDate = now.toISOString()
    const endDate = tomorrow.toISOString()

    // Fetch renewable energy forecast
    const renewableUrl = `https://api.energidataservice.dk/dataset/Forecasts_hour?filter={"PriceArea":"${region}","HourUTC":{"$gte":"${startDate}","$lte":"${endDate}"}}&sort=HourUTC asc`
    
    const response = await fetch(renewableUrl)
    const data = await response.json()

    return res.status(200).json({
      records: data.records || [],
      metadata: {
        region,
        type,
        period: {
          start: startDate,
          end: endDate
        },
        unit: 'MW',
        fetchedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching energy forecast:', error)
    return res.status(500).json({ error: 'Failed to fetch energy forecast' })
  }
}

// Monthly Production handler  
async function handleMonthlyProduction(req: VercelRequest, res: VercelResponse) {
  const { months = '12' } = req.query
  const monthsNum = parseInt(months as string) || 12

  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - monthsNum)
    
    const url = `https://api.energidataservice.dk/dataset/ProductionConsumptionSettlement?filter={"HourDK":{"$gte":"${startDate.toISOString()}","$lte":"${endDate.toISOString()}"}}&sort=HourDK desc`
    
    const response = await fetch(url)
    const data = await response.json()

    // Process and aggregate by month
    const monthlyData: { [key: string]: any } = {}
    
    if (data.records) {
      data.records.forEach((record: any) => {
        const date = new Date(record.HourDK)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalProduction: 0,
            totalConsumption: 0,
            solarPower: 0,
            windPower: 0,
            thermalPower: 0,
            hydroPower: 0,
            nuclearPower: 0,
            count: 0
          }
        }
        
        monthlyData[monthKey].totalProduction += record.GrossConsumptionMWh || 0
        monthlyData[monthKey].totalConsumption += record.TotalLoadMWh || 0
        monthlyData[monthKey].solarPower += record.SolarPowerMWh || 0
        monthlyData[monthKey].windPower += (record.OnshoreWindPowerMWh || 0) + (record.OffshoreWindPowerMWh || 0)
        monthlyData[monthKey].thermalPower += record.ThermalPowerMWh || 0
        monthlyData[monthKey].hydroPower += record.HydroPowerMWh || 0
        monthlyData[monthKey].count++
      })
    }

    const result = Object.values(monthlyData)
      .map(month => ({
        ...month,
        avgProduction: month.totalProduction / month.count,
        avgConsumption: month.totalConsumption / month.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return res.status(200).json({
      data: result,
      metadata: {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        months: monthsNum,
        unit: 'MWh',
        fetchedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching monthly production:', error)
    return res.status(500).json({ error: 'Failed to fetch monthly production data' })
  }
}

// Consumption Map handler
async function handleConsumptionMap(req: VercelRequest, res: VercelResponse) {
  const { date } = req.query
  
  try {
    // Use current date if not specified
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    // Fetch consumption data by region
    const url = `https://api.energidataservice.dk/dataset/ConsumptionIndustry?filter={"HourDK":{"$gte":"${targetDate}T00:00:00","$lte":"${targetDate}T23:59:59"}}&sort=HourDK desc`
    
    const response = await fetch(url)
    const data = await response.json()

    // Process data for map visualization
    const regionData: { [key: string]: number } = {}
    
    if (data.records) {
      data.records.forEach((record: any) => {
        const municipality = record.MunicipalityNo
        if (municipality) {
          if (!regionData[municipality]) {
            regionData[municipality] = 0
          }
          regionData[municipality] += record.ConsumptionkWh || 0
        }
      })
    }

    return res.status(200).json({
      data: regionData,
      metadata: {
        date: targetDate,
        unit: 'kWh',
        fetchedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching consumption map data:', error)
    return res.status(500).json({ error: 'Failed to fetch consumption map data' })
  }
}

// Main handler that routes to appropriate function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Route based on endpoint parameter
  const { endpoint } = req.query

  switch (endpoint) {
    case 'co2-emissions':
      return handleCO2Emissions(req, res)
    case 'energy-forecast':
      return handleEnergyForecast(req, res)
    case 'monthly-production':
      return handleMonthlyProduction(req, res)
    case 'consumption-map':
      return handleConsumptionMap(req, res)
    default:
      return res.status(400).json({ 
        error: 'Invalid endpoint',
        validEndpoints: [
          'co2-emissions',
          'energy-forecast',
          'monthly-production',
          'consumption-map'
        ]
      })
  }
}