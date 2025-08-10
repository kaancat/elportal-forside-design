import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
  Cell
} from 'recharts'
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Download,
  RefreshCw,
  Zap,
  DollarSign,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface ImprovedConsumptionDashboardProps {
  customerData: any
  onRefresh: () => void
  onConsumptionDataChange?: (data: {
    dateRange: DateRange
    dateFrom: string
    dateTo: string
    totalConsumption: number
    totalCost: number
    averagePrice: number
    data: any[]
    region?: string
  }) => void
}

type DateRange = 'yesterday' | '7d' | '30d' | '3m' | '12m' | '1y' | '5y'

interface ConsumptionData {
  data: any[]
  totalConsumption: number
  totalCost: number
  averageConsumption: number
  averagePrice: number
  peakConsumption: number
  peakDate: string
  comparisonData?: any[]
  isLoading: boolean
  error?: string
}

// Danish month names
const DANISH_MONTHS = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december'
]

// Chart colors
const CHART_COLORS = {
  consumption: '#3b82f6', // blue-500
  consumptionGradient: ['#60a5fa', '#2563eb'], // blue-400 to blue-600
  price: '#fb923c', // orange-400
  comparison: '#94a3b8', // slate-400 with 50% opacity
  low: '#22c55e', // green-500
  medium: '#fbbf24', // amber-400
  high: '#ef4444', // red-500
}

// Custom hook to detect mobile screen
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

export function ImprovedConsumptionDashboard({ customerData, onRefresh, onConsumptionDataChange }: ImprovedConsumptionDashboardProps) {
  const isMobile = useIsMobile()
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [customDateRange, setCustomDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined])
  const [consumptionData, setConsumptionData] = useState<ConsumptionData>({
    data: [],
    totalConsumption: 0,
    totalCost: 0,
    averageConsumption: 0,
    averagePrice: 0,
    peakConsumption: 0,
    peakDate: '',
    isLoading: false
  })
  const [showComparison, setShowComparison] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch consumption data when range changes
  useEffect(() => {
    if (customerData) {
      // Only fetch if we have a valid date range selection
      if (dateRange === 'custom' && (!customDateRange[0] || !customDateRange[1])) {
        // Don't fetch if custom is selected but dates aren't confirmed yet
        return
      }
      fetchConsumptionData()
    }
  }, [dateRange, customerData, showComparison]) // Don't include customDateRange to prevent live updates

  // Notify parent when consumption data changes
  useEffect(() => {
    if (onConsumptionDataChange && consumptionData.data.length > 0 && !consumptionData.isLoading) {
      const { dateFrom, dateTo } = calculateDateRange(dateRange)
      onConsumptionDataChange({
        dateRange,
        dateFrom,
        dateTo,
        totalConsumption: consumptionData.totalConsumption,
        totalCost: consumptionData.totalCost,
        averagePrice: consumptionData.averagePrice,
        data: consumptionData.data,
        region: customerData?.region || 'DK2'
      })
    }
  }, [consumptionData, dateRange, onConsumptionDataChange, customerData])


  const fetchConsumptionData = async () => {
    if (!customerData || (!customerData.authorizationId && !customerData.customerCVR)) {
      return
    }
    
    setConsumptionData(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      const { dateFrom, dateTo, aggregation } = calculateDateRange(dateRange)
      
      // Fetch consumption data
      const [consumptionResponse, priceResponse] = await Promise.all([
        fetch('/api/eloverblik?action=thirdparty-consumption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorizationId: customerData?.authorizationId,
            customerCVR: customerData?.customerCVR,
            meteringPointIds: customerData?.meteringPointIds,
            dateFrom,
            dateTo,
            aggregation
          })
        }),
        // Fetch real prices from EnergiDataService for the entire date range
        fetch(`/api/electricity-prices?date=${dateFrom}&endDate=${dateTo}&region=${customerData?.region || 'DK2'}`)
      ])
      
      if (!consumptionResponse.ok) {
        throw new Error(`Failed to fetch consumption data: ${consumptionResponse.status}`)
      }
      
      const consumptionResult = await consumptionResponse.json()
      const priceResult = priceResponse.ok ? await priceResponse.json() : { records: [] }
      
      console.log('Price API response:', {
        ok: priceResponse.ok,
        status: priceResponse.status,
        recordCount: priceResult?.records?.length || 0,
        samplePrices: priceResult?.records?.slice(0, 3)
      })
      
      // Fetch comparison data if enabled
      let comparisonData = null
      if (showComparison) {
        const lastYearFrom = adjustDateByYear(dateFrom, -1)
        const lastYearTo = adjustDateByYear(dateTo, -1)
        const compResponse = await fetch('/api/eloverblik?action=thirdparty-consumption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorizationId: customerData?.authorizationId,
            customerCVR: customerData?.customerCVR,
            meteringPointIds: customerData?.meteringPointIds,
            dateFrom: lastYearFrom,
            dateTo: lastYearTo,
            aggregation
          })
        })
        if (compResponse.ok) {
          const compResult = await compResponse.json()
          comparisonData = processConsumptionData(compResult, [], aggregation)
        }
      }
      
      let processedData = processConsumptionData(consumptionResult, priceResult.records || [], aggregation)
      
      // Filter data for "yesterday" view to show the most recent complete day with data
      if (dateRange === 'yesterday' && processedData.data.length > 0) {
        // Group data by date to find complete days
        const dataByDate = new Map<string, any[]>()
        
        processedData.data.forEach(item => {
          const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
          if (!dataByDate.has(dateStr)) {
            dataByDate.set(dateStr, [])
          }
          dataByDate.get(dateStr)!.push(item)
        })
        
        console.log('Available dates with data:', Array.from(dataByDate.keys()).sort())
        
        // Find the most recent date that has at least 20 hours of data (allowing for some gaps)
        const sortedDates = Array.from(dataByDate.keys()).sort().reverse()
        let selectedDate = ''
        let selectedData: any[] = []
        
        for (const dateStr of sortedDates) {
          const dayData = dataByDate.get(dateStr) || []
          console.log(`Date ${dateStr} has ${dayData.length} hours of data`)
          
          // Use the most recent day that has at least 20 hours of data
          if (dayData.length >= 20) {
            selectedDate = dateStr
            selectedData = dayData
            break
          }
        }
        
        // If no day has 20+ hours, just use the most recent day with any data
        if (!selectedDate && sortedDates.length > 0) {
          selectedDate = sortedDates[0]
          selectedData = dataByDate.get(selectedDate) || []
          console.log(`No complete days found, using most recent: ${selectedDate} with ${selectedData.length} hours`)
        }
        
        console.log(`Selected date for display: ${selectedDate}`)
        processedData.data = selectedData
        
        // Log if no data was selected
        if (processedData.data.length === 0) {
          console.error('No suitable data found for daily view!', {
            availableDates: sortedDates,
            sampleData: consumptionResult?.result?.[0]
          })
        }
        
        // Recalculate totals after filtering
        const filteredData = processedData.data
        processedData.totalConsumption = filteredData.reduce((sum, d) => sum + d.consumption, 0)
        processedData.totalCost = filteredData.reduce((sum, d) => sum + d.cost, 0)
        processedData.averageConsumption = filteredData.length > 0 ? processedData.totalConsumption / filteredData.length : 0
        processedData.averagePrice = filteredData.length > 0 
          ? filteredData.reduce((sum, d) => sum + d.price, 0) / filteredData.length 
          : 0
        const peakData = filteredData.length > 0 
          ? filteredData.reduce((max, d) => d.consumption > (max?.consumption || 0) ? d : max, filteredData[0])
          : { consumption: 0, formattedDate: 'N/A' }
        processedData.peakConsumption = peakData?.consumption || 0
        processedData.peakDate = peakData?.formattedDate || 'N/A'
      }
      
      // Merge comparison data if available
      if (comparisonData) {
        processedData.data = processedData.data.map((item, index) => ({
          ...item,
          comparisonConsumption: comparisonData.data[index]?.consumption || 0
        }))
      }
      
      setConsumptionData({
        ...processedData,
        comparisonData: comparisonData?.data,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching consumption data:', error)
      setConsumptionData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Kunne ikke hente forbrugsdata'
      }))
    }
  }

  const calculateDateRange = (range: DateRange) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(12, 0, 0, 0)
    
    let dateFrom: Date
    let dateTo = yesterday
    let aggregation: string
    
    switch (range) {
      case 'yesterday':
        // Fetch last 3 days to ensure we get the most recent complete day of data
        // Different meters have different update delays (1-3 days typically)
        const threeDaysAgo = new Date(now)
        threeDaysAgo.setDate(now.getDate() - 3)
        threeDaysAgo.setHours(0, 0, 0, 0)
        dateFrom = threeDaysAgo
        
        // Fetch up to yesterday to get the most recent data available
        const yesterdayEnd = new Date(now)
        yesterdayEnd.setDate(now.getDate() - 1)
        yesterdayEnd.setHours(23, 59, 59, 999)
        dateTo = yesterdayEnd
        aggregation = 'Hour'
        
        console.log('Fetching recent days to find latest available data:', {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
          localFrom: dateFrom.toLocaleString('da-DK'),
          localTo: dateTo.toLocaleString('da-DK'),
          note: 'Will display the most recent complete day with data'
        })
        break
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        aggregation = 'Day'
        break
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        aggregation = 'Day'
        break
      case '3m':
        dateFrom = new Date(now)
        dateFrom.setMonth(now.getMonth() - 3)
        aggregation = 'Day'
        break
      case '12m':
        dateFrom = new Date(now)
        dateFrom.setMonth(now.getMonth() - 12)
        aggregation = 'Month'
        break
      case '1y':
        dateFrom = new Date(now)
        dateFrom.setFullYear(now.getFullYear() - 1)
        aggregation = 'Month'
        break
      case '5y':
        dateFrom = new Date(now)
        dateFrom.setFullYear(now.getFullYear() - 5)
        aggregation = 'Year'
        break
      default:
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        aggregation = 'Day'
    }
    
    return {
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
      aggregation
    }
  }

  const processConsumptionData = (result: any, priceData: any[], aggregation: string) => {
    const dataMap = new Map()
    const priceMap = new Map()
    
    // Process real price data from EnergiDataService
    if (Array.isArray(priceData)) {
      console.log(`Processing ${priceData.length} price records for aggregation: ${aggregation}`)
      priceData.forEach((price: any) => {
        try {
          const date = new Date(price.HourDK || price.HourUTC)
          // For hourly data, create multiple keys to handle timezone differences
          if (aggregation === 'Hour') {
            // Store with multiple possible keys to handle timezone mismatches
            const isoKey = date.toISOString()
            const hourKey = `${date.toISOString().split('T')[0]}T${String(date.getHours()).padStart(2, '0')}`
            const utcKey = new Date(price.HourUTC).toISOString()
            
            const priceValue = price.TotalPriceKWh || price.SpotPriceKWh || 2.5
            priceMap.set(isoKey, priceValue)
            priceMap.set(hourKey, priceValue)
            priceMap.set(utcKey, priceValue)
            
            // Also set for the date only (for fallback)
            const dateOnlyKey = date.toISOString().split('T')[0]
            if (!priceMap.has(dateOnlyKey)) {
              priceMap.set(dateOnlyKey, priceValue)
            }
          } else {
            // For daily/monthly/yearly aggregation, use date only
            const key = date.toISOString().split('T')[0]
            const priceValue = price.TotalPriceKWh || price.SpotPriceKWh || 2.5
            priceMap.set(key, priceValue)
          }
        } catch (e) {
          console.warn('Error processing price:', e)
        }
      })
      console.log(`Price map has ${priceMap.size} entries`)
    }
    
    // Process consumption data
    const list = Array.isArray(result?.result) ? result.result : []
    
    list.forEach((meteringPoint: any) => {
      const timeSeries = meteringPoint?.MyEnergyData_MarketDocument?.TimeSeries
      if (Array.isArray(timeSeries)) {
        timeSeries.forEach((ts: any) => {
          const periods = ts?.Period
          if (Array.isArray(periods)) {
            periods.forEach((period: any) => {
              const start = period?.timeInterval?.start || period?.['timeInterval.start']
              if (!start) return
              
              if (Array.isArray(period?.Point)) {
                period.Point.forEach((point: any) => {
                  const quantity = parseFloat(point?.['out_Quantity.quantity'] || 0)
                  const position = parseInt(point?.position || 1)
                  const startDate = new Date(start)
                  
                  let date: Date
                  let dateKey: string
                  
                  if (aggregation === 'Hour') {
                    date = new Date(startDate.getTime() + (position - 1) * 60 * 60 * 1000)
                    dateKey = date.toISOString()
                  } else if (aggregation === 'Month') {
                    date = new Date(startDate)
                    date.setMonth(startDate.getMonth() + (position - 1))
                    dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                  } else if (aggregation === 'Year') {
                    date = new Date(startDate)
                    date.setFullYear(startDate.getFullYear() + (position - 1))
                    dateKey = String(date.getFullYear())
                  } else {
                    date = new Date(startDate.getTime() + (position - 1) * 24 * 60 * 60 * 1000)
                    dateKey = date.toISOString().split('T')[0]
                  }
                  
                  const existingData = dataMap.get(dateKey) || { consumption: 0, price: 0, cost: 0 }
                  const consumption = existingData.consumption + (Number.isNaN(quantity) ? 0 : quantity)
                  
                  // Try multiple keys to find the price
                  let price = priceMap.get(dateKey)
                  if (!price && aggregation === 'Hour') {
                    // Try alternative formats for hourly data
                    const hourOnly = `${dateKey.split('T')[0]}T${String(date.getHours()).padStart(2, '0')}`
                    price = priceMap.get(hourOnly) || priceMap.get(dateKey.split('T')[0])
                  }
                  price = price || existingData.price || 2.5
                  
                  const cost = consumption * price
                  
                  dataMap.set(dateKey, { 
                    consumption, 
                    price, 
                    cost,
                    date: dateKey
                  })
                })
              }
            })
          }
        })
      }
    })
    
    const processedData = Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        consumption: data.consumption,
        price: data.price,
        cost: data.cost,
        formattedDate: formatDateForDisplay(date, aggregation, false)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    const totalConsumption = processedData.reduce((sum, d) => sum + d.consumption, 0)
    const totalCost = processedData.reduce((sum, d) => sum + d.cost, 0)
    const averageConsumption = processedData.length > 0 ? totalConsumption / processedData.length : 0
    const averagePrice = processedData.length > 0 
      ? processedData.reduce((sum, d) => sum + d.price, 0) / processedData.length 
      : 0
    const peakData = processedData.length > 0 
      ? processedData.reduce((max, d) => d.consumption > (max?.consumption || 0) ? d : max, processedData[0])
      : { consumption: 0, formattedDate: 'N/A' }
    
    return {
      data: processedData,
      totalConsumption: Number.isFinite(totalConsumption) ? totalConsumption : 0,
      totalCost: Number.isFinite(totalCost) ? totalCost : 0,
      averageConsumption: Number.isFinite(averageConsumption) ? averageConsumption : 0,
      averagePrice: Number.isFinite(averagePrice) ? averagePrice : 0,
      peakConsumption: Number.isFinite(peakData?.consumption) ? peakData.consumption : 0,
      peakDate: peakData?.formattedDate || 'N/A'
    }
  }

  const formatDateForDisplay = (date: string, aggregation: string, isMobileView: boolean = false): string => {
    if (aggregation === 'Hour') {
      const d = new Date(date)
      const hour = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      
      // For mobile, just show time
      if (isMobileView) {
        return `${hour}:${minutes}`
      }
      
      // For desktop, show full date and time
      const day = d.getDate()
      const month = DANISH_MONTHS[d.getMonth()]
      return `${day}. ${month} kl. ${hour}`
    } else if (aggregation === 'Month') {
      const [year, month] = date.split('-')
      const monthName = DANISH_MONTHS[parseInt(month) - 1]
      // For mobile, show abbreviated format
      if (isMobileView) {
        return `${monthName.substring(0, 3)} ${year.substring(2)}`
      }
      return `${monthName} ${year}`
    } else if (aggregation === 'Year') {
      return date
    } else {
      const d = new Date(date + 'T12:00:00')
      const day = d.getDate()
      const month = DANISH_MONTHS[d.getMonth()]
      
      // For mobile, show short format
      if (isMobileView) {
        return `${day}. ${month.substring(0, 3)}`
      }
      return `${day}. ${month}`
    }
  }

  const adjustDateByYear = (dateStr: string, years: number): string => {
    const date = new Date(dateStr)
    date.setFullYear(date.getFullYear() + years)
    return date.toISOString().split('T')[0]
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchConsumptionData()
    if (onRefresh) onRefresh()
    setIsRefreshing(false)
  }

  const getTrendValue = () => {
    if (consumptionData.data.length < 2) return { icon: Minus, value: 0, color: 'text-gray-500' }
    
    const lastPeriod = consumptionData.data[consumptionData.data.length - 1].consumption
    const previousPeriod = consumptionData.data[consumptionData.data.length - 2].consumption
    const change = ((lastPeriod - previousPeriod) / previousPeriod) * 100
    
    if (change > 10) {
      return { icon: TrendingUp, value: change, color: 'text-red-500' }
    } else if (change < -10) {
      return { icon: TrendingDown, value: change, color: 'text-green-500' }
    } else {
      return { icon: Minus, value: change, color: 'text-gray-500' }
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    
    const consumption = payload.find((p: any) => p.dataKey === 'consumption')?.value || 0
    const price = payload.find((p: any) => p.dataKey === 'price')?.value || 0
    const comparisonConsumption = payload.find((p: any) => p.dataKey === 'comparisonConsumption')?.value
    const cost = consumption * price
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    return (
      <div className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-sm mb-2 text-gray-700">{label}</p>
        <div className="space-y-1.5 text-xs">
          {/* Current year consumption */}
          <div className="pb-1.5 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 font-medium">{currentYear}:</span>
              </div>
              <span className="font-semibold text-gray-900">{consumption.toFixed(2)} kWh</span>
            </div>
          </div>
          
          {/* Previous year comparison */}
          {comparisonConsumption !== undefined && (
            <div className="pb-1.5 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500/40"></div>
                  <span className="text-gray-600 font-medium">{lastYear}:</span>
                </div>
                <span className="font-semibold text-gray-700">{comparisonConsumption.toFixed(2)} kWh</span>
              </div>
              {/* Show difference */}
              <div className="flex items-center justify-between gap-4 mt-1 ml-3.5">
                <span className="text-gray-500 text-[10px]">Forskel:</span>
                <span className={`font-medium text-[10px] ${consumption > comparisonConsumption ? 'text-red-600' : 'text-green-600'}`}>
                  {consumption > comparisonConsumption ? '+' : ''}{(consumption - comparisonConsumption).toFixed(2)} kWh
                </span>
              </div>
            </div>
          )}
          
          {/* Price information */}
          <div className="pb-1.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span className="text-gray-600">Pris:</span>
              </div>
              <span className="font-medium">{price.toFixed(2)} kr/kWh</span>
            </div>
          </div>
          
          {/* Total cost */}
          <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-gray-200">
            <span className="text-gray-700 font-semibold">Total omkostning:</span>
            <span className="font-bold text-blue-600">{cost.toFixed(2)} kr</span>
          </div>
        </div>
      </div>
    )
  }

  const DateRangeSelector = () => {
    const ranges: { value: DateRange; label: string; group: string }[] = [
      { value: 'yesterday', label: 'Dag', group: 'hours' },
      { value: '7d', label: '7 dage', group: 'days' },
      { value: '30d', label: '30 dage', group: 'days' },
      { value: '3m', label: '3 mdr', group: 'months' },
      { value: '12m', label: '1 år', group: 'months' },
      { value: '1y', label: 'År', group: 'years' },
      { value: '5y', label: '5 år', group: 'years' },
    ]
    
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-lg md:rounded-xl w-full md:w-auto overflow-x-auto">
          {ranges.map(({ value, label }, index) => (
            <React.Fragment key={value}>
              {index > 0 && ranges[index - 1].group !== ranges[index].group && (
                <div className="w-px h-4 md:h-5 bg-gray-300 mx-0.5" />
              )}
              <button
                onClick={() => setDateRange(value)}
                className={`
                  px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-md md:rounded-lg transition-all duration-200 whitespace-nowrap
                  ${dateRange === value 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const trend = getTrendValue()

  return (
    <div className="space-y-4">
      {/* Data Delay Information - Only show for yesterday */}
      {dateRange === 'yesterday' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            <strong>Bemærk:</strong> Forbrugsdata fra din elmåler er forsinket med 1-2 dage. 
            De nyeste tilgængelige data er typisk fra i går eller forgårs.
          </AlertDescription>
        </Alert>
      )}

      {/* Header - Desktop Layout */}
      <div className="hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Forbrugsanalyse</h3>
          {customerData?.meteringPointIds && (
            <p className="text-sm text-gray-600 mt-1">
              {customerData.meteringPointIds.length} målerpunkt{customerData.meteringPointIds.length !== 1 ? 'er' : ''} aktiv
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {showComparison ? (
              <ToggleRight className="h-4 w-4 text-blue-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            )}
            Sammenlign år
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || consumptionData.isLoading}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Header - Mobile Layout */}
      <div className="md:hidden">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Forbrugsanalyse</h3>
            {customerData?.meteringPointIds && (
              <p className="text-sm text-gray-600 mt-1">
                {customerData.meteringPointIds.length} målerpunkt{customerData.meteringPointIds.length !== 1 ? 'er' : ''} aktiv
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || consumptionData.isLoading}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Date Range Selector - Desktop Only */}
      <div className="hidden md:block">
        <DateRangeSelector />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <div className={`flex items-center gap-1 text-xs ${trend.color}`}>
                <trend.icon className="h-3 w-3" />
                <span>{trend.value > 0 ? '+' : ''}{trend.value.toFixed(0)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Total forbrug</p>
            <p className="text-2xl font-bold text-gray-900">
              {consumptionData.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${consumptionData.totalConsumption.toFixed(0)} kWh`
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <DollarSign className="h-4 w-4 text-green-600 mb-1" />
            <p className="text-xs text-gray-600 mb-1">Total omkostning</p>
            <p className="text-2xl font-bold text-gray-900">
              {consumptionData.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${consumptionData.totalCost.toFixed(0)} kr`
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-4">
            <Activity className="h-4 w-4 text-amber-600 mb-1" />
            <p className="text-xs text-gray-600 mb-1">Gennemsnit</p>
            <p className="text-2xl font-bold text-gray-900">
              {consumptionData.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${consumptionData.averageConsumption.toFixed(1)} kWh`
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-4">
            <TrendingUp className="h-4 w-4 text-orange-600 mb-1" />
            <p className="text-xs text-gray-600 mb-1">Højeste</p>
            <p className="text-2xl font-bold text-gray-900">
              {consumptionData.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  {consumptionData.peakConsumption.toFixed(1)} kWh
                  <span className="text-xs block text-gray-600 font-normal mt-1">
                    {consumptionData.peakDate}
                  </span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Forbrug & Priser</CardTitle>
              <CardDescription className="text-xs mt-1">
                {dateRange === 'today' || dateRange === 'yesterday' ? 'Timebaseret' :
                 dateRange === '7d' || dateRange === '30d' ? 'Dagligt' :
                 dateRange === '3m' || dateRange === '12m' || dateRange === '1y' ? 'Månedligt' :
                 'Årligt'} forbrug og priser
              </CardDescription>
            </div>
            {consumptionData.data.length > 0 && (
              <Badge variant="outline" className="text-xs hidden md:inline-flex">
                {consumptionData.data.length} datapunkter
              </Badge>
            )}
          </div>
          
          {/* Mobile Controls - Below headline */}
          <div className="md:hidden space-y-1.5 mt-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors w-full justify-center"
            >
              {showComparison ? (
                <ToggleRight className="h-4 w-4 text-blue-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
              Sammenlign år
            </button>
            <DateRangeSelector />
            {consumptionData.data.length > 0 && (
              <div className="flex justify-end">
                <Badge variant="outline" className="text-xs">
                  {consumptionData.data.length} datapunkter
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          {consumptionData.isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Henter forbrugsdata...</p>
              </div>
            </div>
          ) : consumptionData.error ? (
            <Alert variant="destructive">
              <AlertDescription>{consumptionData.error}</AlertDescription>
            </Alert>
          ) : consumptionData.data.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Ingen data tilgængelig for denne periode</p>
              </div>
            </div>
          ) : isMobile ? (
            // Mobile horizontal bar layout (like LivePriceGraph)
            <div className="w-full">
              <div className="max-h-[480px] overflow-y-auto">
                <div className="space-y-1">
                  {consumptionData.data.map((item, index) => {
                    const maxConsumption = Math.max(...consumptionData.data.map(d => d.consumption))
                    const consumptionWidth = Math.max((item.consumption / maxConsumption) * 100, 5)
                    const comparisonWidth = item.comparisonConsumption 
                      ? Math.max((item.comparisonConsumption / maxConsumption) * 100, 5)
                      : 0
                    const priceLevel = item.price < 1.5 ? 'low' : item.price < 2.5 ? 'medium' : 'high'
                    
                    const getPriceColor = (level: string) => {
                      switch (level) {
                        case 'low': return 'bg-green-500'
                        case 'medium': return 'bg-yellow-400'
                        case 'high': return 'bg-red-500'
                        default: return 'bg-gray-400'
                      }
                    }
                    
                    return (
                      <div key={index} className="flex items-center gap-2">
                        {/* Date label */}
                        <div className="w-12 text-[10px] text-gray-600 font-medium text-right">
                          {(() => {
                            // For hourly data, show just the time
                            if (dateRange === 'yesterday' || dateRange === 'today') {
                              const hour = item.date.split('T')[1]?.substring(0, 5) || item.formattedDate.split('kl. ')[1] || item.formattedDate
                              return hour
                            }
                            // For other ranges, show day and month
                            const parts = item.formattedDate.split(' ')
                            if (parts.length >= 2) {
                              return `${parts[0]} ${parts[1].substring(0, 3)}`
                            }
                            return item.formattedDate.split(' ')[0]
                          })()}
                        </div>
                        
                        {/* Bar container */}
                        <div className="flex-1">
                          <div className="relative h-5 bg-gray-100 rounded-sm overflow-hidden">
                            {/* Consumption bar */}
                            <div 
                              className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${consumptionWidth}%` }}
                            />
                            
                            {/* Comparison bar overlay */}
                            {showComparison && item.comparisonConsumption && (
                              <div 
                                className="absolute left-0 top-0 h-full bg-blue-300/40 border-t-2 border-b-2 border-blue-300"
                                style={{ width: `${comparisonWidth}%` }}
                              />
                            )}
                            
                            {/* Price color indicator strip at bottom */}
                            <div 
                              className={`absolute left-0 bottom-0 h-1 ${getPriceColor(priceLevel)}`}
                              style={{ width: `${consumptionWidth}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Value labels */}
                        <div className="w-20 text-right">
                          <div className="text-xs font-semibold text-gray-800">
                            {item.consumption.toFixed(1)} kWh
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {item.price.toFixed(2)} kr/kWh
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Mobile legend */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 rounded-sm bg-blue-500"></div>
                    <span className="text-gray-600">Forbrug</span>
                  </div>
                  {showComparison && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded-sm bg-blue-300/40 border border-blue-300"></div>
                      <span className="text-gray-600">Sidste år</span>
                    </div>
                  )}
                </div>
                
                {/* Price level legend */}
                <div className="flex items-center justify-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-green-500"></div>
                    <span className="text-gray-500">Lav pris</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-yellow-400"></div>
                    <span className="text-gray-500">Mellem</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-red-500"></div>
                    <span className="text-gray-500">Høj pris</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Desktop horizontal chart
            <div className="h-[320px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={consumptionData.data} 
                  margin={{ top: 10, right: 10, left: 10, bottom: showComparison ? 70 : 50 }}
                >
                <defs>
                  <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.consumptionGradient[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.consumptionGradient[1]} stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={'preserveStartEnd'}
                />
                <YAxis 
                  yAxisId="consumption"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  label={{ value: 'Forbrug (kWh)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                />
                <YAxis 
                  yAxisId="price"
                  orientation="right"
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(value) => value.toFixed(2)}
                  label={{ value: 'Pris (kr/kWh)', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#6b7280' } }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                
                {/* Average reference line */}
                <ReferenceLine 
                  yAxisId="consumption"
                  y={consumptionData.averageConsumption} 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                />
                
                {/* Current year consumption */}
                <Bar 
                  yAxisId="consumption"
                  dataKey="consumption" 
                  fill="url(#consumptionGradient)"
                  radius={[4, 4, 0, 0]}
                />
                
                {/* Previous year consumption (if comparison enabled) */}
                {showComparison && (
                  <Bar 
                    yAxisId="consumption"
                    dataKey="comparisonConsumption" 
                    fill={CHART_COLORS.consumption}
                    fillOpacity={0.3}
                    radius={[4, 4, 0, 0]}
                  />
                )}
                
                {/* Price line */}
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="price" 
                  stroke={CHART_COLORS.price}
                  strokeWidth={2}
                  dot={false}
                />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Desktop Legend (only show on desktop) */}
          {!isMobile && !consumptionData.isLoading && consumptionData.data.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-600">Forbrug {new Date().getFullYear()}</span>
              </div>
              {showComparison && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500/30"></div>
                  <span className="text-gray-600">Forbrug {new Date().getFullYear() - 1}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded bg-orange-400"></div>
                <span className="text-gray-600">Pris (kr/kWh)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const csvContent = [
              ['Dato', 'Forbrug (kWh)', 'Pris (kr/kWh)', 'Omkostning (kr)'],
              ...consumptionData.data.map(d => [
                d.formattedDate, 
                d.consumption.toFixed(2),
                d.price.toFixed(2),
                d.cost.toFixed(2)
              ])
            ].map(e => e.join(',')).join('\n')
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `forbrug-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
          }}
          disabled={consumptionData.data.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Eksporter CSV
        </Button>
      </div>
    </div>
  )
}