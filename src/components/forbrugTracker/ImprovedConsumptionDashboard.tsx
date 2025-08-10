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
  MapPin,
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

interface AddressData {
  fullAddress: string
  streetName: string
  buildingNumber: string
  postcode: string
  cityName: string
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

export function ImprovedConsumptionDashboard({ customerData, onRefresh, onConsumptionDataChange }: ImprovedConsumptionDashboardProps) {
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
  const [addressData, setAddressData] = useState<AddressData | null>(null)
  
  // TEMPORARY: Mock data for testing address display
  // TODO: Remove this after testing
  const MOCK_TEST = false // Set to true to test with mock data
  useEffect(() => {
    if (MOCK_TEST) {
      console.log('[MOCK] Setting mock address data for testing')
      setTimeout(() => {
        setAddressData({
          streetName: 'Testvej',
          buildingNumber: '123',
          postcode: '2100',
          cityName: 'København Ø',
          fullAddress: 'Testvej 123, 2100 København Ø'
        })
      }, 1000)
    }
  }, [])
  const [loadingAddress, setLoadingAddress] = useState(false)

  // Fetch address data when customer data is available
  useEffect(() => {
    console.log('[Address Effect] customerData changed:', customerData)
    if (customerData?.meteringPointIds?.length > 0) {
      console.log('[Address Effect] Triggering fetchAddressData')
      fetchAddressData()
    } else {
      console.log('[Address Effect] No meteringPointIds, skipping fetch')
    }
  }, [customerData, fetchAddressData])

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

  const fetchAddressData = useCallback(async () => {
    if (!customerData?.meteringPointIds?.length) {
      console.log('[Address] No metering point IDs available, skipping address fetch')
      return
    }
    
    console.log('[Address] Starting fetch for metering points:', customerData.meteringPointIds)
    setLoadingAddress(true)
    
    try {
      const response = await fetch('/api/eloverblik?action=thirdparty-meteringpoint-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meteringPointIds: customerData.meteringPointIds
        })
      })
      
      console.log('[Address] API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[Address] Full API response:', JSON.stringify(data, null, 2))
        
        // Always set address data structure, even if empty
        if (data?.address) {
          const { streetName, buildingNumber, postcode, cityName, fullAddress } = data.address
          
          // Check if we have a valid fullAddress
          if (fullAddress && fullAddress !== 'Adresse ikke tilgængelig') {
            setAddressData(data.address)
            console.log('[Address] ✅ Set address from API:', fullAddress)
          } else if (streetName || cityName || postcode) {
            // Build address from parts
            const fallbackAddress = [
              streetName && buildingNumber ? `${streetName} ${buildingNumber}` : streetName,
              postcode && cityName ? `${postcode} ${cityName}` : cityName || postcode
            ].filter(Boolean).join(', ')
            
            setAddressData({
              ...data.address,
              fullAddress: fallbackAddress || 'Adresse ikke tilgængelig'
            })
            console.log('[Address] ✅ Built fallback address:', fallbackAddress)
          } else {
            // Set default structure even when no data
            setAddressData({
              streetName: '',
              buildingNumber: '',
              postcode: '',
              cityName: '',
              fullAddress: 'Adresse ikke tilgængelig'
            })
            console.log('[Address] ⚠️ No address data available, using default')
          }
        } else {
          // No address in response, set default
          console.log('[Address] ⚠️ No address field in response')
          setAddressData({
            streetName: '',
            buildingNumber: '',
            postcode: '',
            cityName: '',
            fullAddress: 'Adresse ikke tilgængelig'
          })
        }
      } else {
        const errorText = await response.text()
        console.error('[Address] ❌ API request failed:', response.status, errorText)
        // Set error state but maintain structure
        setAddressData({
          streetName: '',
          buildingNumber: '',
          postcode: '',
          cityName: '',
          fullAddress: 'Fejl ved hentning af adresse'
        })
      }
    } catch (error) {
      console.error('[Address] ❌ Exception during fetch:', error)
      // Set error state but maintain structure
      setAddressData({
        streetName: '',
        buildingNumber: '',
        postcode: '',
        cityName: '',
        fullAddress: 'Netværksfejl ved hentning af adresse'
      })
    } finally {
      setLoadingAddress(false)
      console.log('[Address] Fetch complete, loading state cleared')
    }
  }, [customerData?.meteringPointIds])

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
        // Fetch real prices from EnergiDataService
        fetch(`/api/electricity-prices?date=${dateFrom}&region=${customerData?.region || 'DK2'}`)
      ])
      
      if (!consumptionResponse.ok) {
        throw new Error(`Failed to fetch consumption data: ${consumptionResponse.status}`)
      }
      
      const consumptionResult = await consumptionResponse.json()
      const priceResult = priceResponse.ok ? await priceResponse.json() : { records: [] }
      
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
      
      // Filter data for "yesterday" view to only show yesterday's hours
      if (dateRange === 'yesterday' && processedData.data.length > 0) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayDateStr = yesterday.toISOString().split('T')[0]
        
        console.log('Filtering data for yesterday:', yesterdayDateStr)
        console.log('Raw data before filtering:', processedData.data.length, 'items')
        console.log('Sample data dates:', processedData.data.slice(0, 5).map(d => d.date))
        
        // More flexible filtering - check if the date part matches yesterday
        processedData.data = processedData.data.filter(item => {
          // Handle both ISO string dates and date-only strings
          const itemDateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
          
          // For yesterday data, we want to include all hours from yesterday
          // regardless of whether they came from a 2-day fetch or single day fetch
          if (itemDateStr === yesterdayDateStr) {
            return true
          }
          
          // Also check if it's within yesterday's 24 hour period (handling timezone issues)
          try {
            const itemDate = new Date(item.date)
            const yesterdayStart = new Date(yesterday)
            yesterdayStart.setHours(0, 0, 0, 0)
            const yesterdayEnd = new Date(yesterday)
            yesterdayEnd.setHours(23, 59, 59, 999)
            
            // Check if the item falls within yesterday's range
            const isInRange = itemDate >= yesterdayStart && itemDate <= yesterdayEnd
            if (isInRange) {
              console.log('Including item from yesterday range:', item.date)
            }
            return isInRange
          } catch (e) {
            console.warn('Error parsing date:', item.date, e)
            return false
          }
        })
        
        console.log('Data after filtering:', processedData.data.length, 'items')
        
        // Log if no data matches the filter
        if (processedData.data.length === 0) {
          console.error('No data matched yesterday filter!', {
            yesterdayDateStr,
            sampleDates: consumptionResult?.result?.[0]?.MyEnergyData_MarketDocument?.TimeSeries?.[0]?.Period?.[0]?.timeInterval
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
        // For yesterday: Get full 24 hours of yesterday's data
        const yesterdayStart = new Date(now)
        yesterdayStart.setDate(now.getDate() - 1)
        yesterdayStart.setHours(0, 0, 0, 0)
        dateFrom = yesterdayStart
        
        const yesterdayEnd = new Date(now)
        yesterdayEnd.setDate(now.getDate() - 1)
        yesterdayEnd.setHours(23, 59, 59, 999)
        dateTo = yesterdayEnd
        aggregation = 'Hour'
        
        console.log('Yesterday date range:', {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
          localFrom: dateFrom.toLocaleString('da-DK'),
          localTo: dateTo.toLocaleString('da-DK')
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
      priceData.forEach((price: any) => {
        try {
          const date = new Date(price.HourDK || price.HourUTC)
          const key = aggregation === 'Hour' 
            ? date.toISOString()
            : date.toISOString().split('T')[0]
          // Use total price including all fees and VAT
          priceMap.set(key, price.TotalPriceKWh || price.SpotPriceKWh || 2.5)
        } catch (e) {
          console.warn('Error processing price:', e)
        }
      })
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
                  const price = priceMap.get(dateKey) || existingData.price || 2.5
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
        formattedDate: formatDateForDisplay(date, aggregation)
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

  const formatDateForDisplay = (date: string, aggregation: string): string => {
    if (aggregation === 'Hour') {
      const d = new Date(date)
      const day = d.getDate()
      const month = DANISH_MONTHS[d.getMonth()]
      const hour = String(d.getHours()).padStart(2, '0')
      return `${day}. ${month} kl. ${hour}`
    } else if (aggregation === 'Month') {
      const [year, month] = date.split('-')
      return `${DANISH_MONTHS[parseInt(month) - 1]} ${year}`
    } else if (aggregation === 'Year') {
      return date
    } else {
      const d = new Date(date + 'T12:00:00')
      const day = d.getDate()
      const month = DANISH_MONTHS[d.getMonth()]
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
      { value: 'yesterday', label: 'I går', group: 'hours' },
      { value: '7d', label: '7 dage', group: 'days' },
      { value: '30d', label: '30 dage', group: 'days' },
      { value: '3m', label: '3 mdr', group: 'months' },
      { value: '12m', label: '1 år', group: 'months' },
      { value: '1y', label: 'År', group: 'years' },
      { value: '5y', label: '5 år', group: 'years' },
    ]
    
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-xl">
          {ranges.map(({ value, label }, index) => (
            <React.Fragment key={value}>
              {index > 0 && ranges[index - 1].group !== ranges[index].group && (
                <div className="w-px h-5 bg-gray-300 mx-0.5" />
              )}
              <button
                onClick={() => setDateRange(value)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
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

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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

      {/* Date Range Selector */}
      <DateRangeSelector />

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

      {/* Address Card - Show loading or data */}
      {(loadingAddress || addressData) && (
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Måleradresse</p>
                {loadingAddress ? (
                  <Skeleton className="h-5 w-48" />
                ) : addressData?.fullAddress ? (
                  <p className="text-sm font-medium text-gray-900">
                    {addressData.fullAddress}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Adresse ikke tilgængelig
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Badge variant="outline" className="text-xs">
                {consumptionData.data.length} datapunkter
              </Badge>
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
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart 
                data={consumptionData.data} 
                margin={{ top: 10, right: 10, left: 10, bottom: showComparison ? 80 : 60 }}
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
                  tick={{ fontSize: 11, fill: '#6b7280' }}
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
          )}
          
          {/* Legend */}
          {!consumptionData.isLoading && consumptionData.data.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
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