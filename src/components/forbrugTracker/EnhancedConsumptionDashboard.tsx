import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { 
  Clock, 
  Calendar, 
  CalendarDays, 
  CalendarRange,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Download,
  RefreshCw,
  Info,
  Zap,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react'

interface EnhancedConsumptionDashboardProps {
  customerData: any
  onRefresh: () => void
}

type TimeView = 'live' | 'day' | 'month' | 'year' | 'all'
type DateRange = 'today' | 'yesterday' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | '12m' | '5y' | 'custom'

interface ConsumptionData {
  data: any[]
  priceData: any[]
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

const DANISH_MONTHS_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
]

// Brand colors
const CHART_COLORS = {
  consumption: '#3b82f6', // blue-500
  price: '#eab308', // yellow-500
  cost: '#10b981', // emerald-500
  comparison: '#94a3b8', // slate-400
  high: '#ef4444', // red-500
  medium: '#f97316', // orange-500
  low: '#22c55e', // green-500
  gradient: {
    from: '#3b82f6',
    to: '#1e40af'
  }
}

export function EnhancedConsumptionDashboard({ customerData, onRefresh }: EnhancedConsumptionDashboardProps) {
  const [timeView, setTimeView] = useState<TimeView>('day')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [consumptionData, setConsumptionData] = useState<ConsumptionData>({
    data: [],
    priceData: [],
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
  const [copiedCustomerId, setCopiedCustomerId] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Fetch data when view or range changes
  useEffect(() => {
    if (customerData) {
      fetchConsumptionData()
    }
  }, [timeView, dateRange, selectedDate, customerData])

  const fetchConsumptionData = async () => {
    // Safety check for customerData
    if (!customerData || (!customerData.authorizationId && !customerData.customerCVR)) {
      console.log('No customer data available yet')
      return
    }
    
    setConsumptionData(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Calculate date range based on selection
      const { dateFrom, dateTo, aggregation } = calculateDateRange(dateRange, timeView, selectedDate)
      
      // Validate dates
      if (!dateFrom || !dateTo || dateFrom > dateTo) {
        throw new Error('Invalid date range calculated')
      }
      
      console.log(`Fetching ${aggregation} data from ${dateFrom} to ${dateTo}`)
      
      // Fetch consumption data
      const consumptionResponse = await fetch('/api/eloverblik?action=thirdparty-consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorizationId: customerData?.authorizationId,
          customerCVR: customerData?.customerCVR,
          meteringPointIds: customerData?.meteringPointIds,
          dateFrom,
          dateTo,
          aggregation: aggregation === 'Live' ? 'Hour' : aggregation
        })
      })
      
      if (!consumptionResponse.ok) {
        const errorData = await consumptionResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to fetch consumption data: ${consumptionResponse.status}`)
      }
      
      const consumptionResult = await consumptionResponse.json()
      
      // Fetch price data for the same period
      const priceData = await fetchPriceData(dateFrom, dateTo, customerData?.region || 'DK2')
      
      // Fetch comparison data if enabled
      let comparisonData = null
      if (showComparison) {
        const lastYearFrom = adjustDateByYear(dateFrom, -1)
        const lastYearTo = adjustDateByYear(dateTo, -1)
        comparisonData = await fetchComparisonData(lastYearFrom, lastYearTo, aggregation)
      }
      
      const processedData = processConsumptionDataWithPrices(consumptionResult, priceData, aggregation)
      
      setConsumptionData({
        ...processedData,
        comparisonData: comparisonData || undefined,
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

  const fetchPriceData = async (dateFrom: string, dateTo: string, region: string) => {
    try {
      const response = await fetch(`/api/electricity-prices?date=${dateFrom}&region=${region}`)
      if (!response.ok) return []
      const data = await response.json()
      return data.records || []
    } catch (error) {
      console.error('Error fetching price data:', error)
      return []
    }
  }

  const fetchComparisonData = async (dateFrom: string, dateTo: string, aggregation: string) => {
    try {
      const response = await fetch('/api/eloverblik?action=thirdparty-consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorizationId: customerData?.authorizationId,
          customerCVR: customerData?.customerCVR,
          meteringPointIds: customerData?.meteringPointIds,
          dateFrom,
          dateTo,
          aggregation: aggregation === 'Live' ? 'Hour' : aggregation
        })
      })
      
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching comparison data:', error)
      return null
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchConsumptionData()
    if (onRefresh) onRefresh()
    setIsRefreshing(false)
  }

  const calculateDateRange = (range: DateRange, view: TimeView, selectedDate: Date) => {
    const now = new Date()
    const selected = selectedDate || now
    
    // Ensure we don't request future dates
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(23, 59, 59, 999)
    
    let dateFrom: Date
    let dateTo = yesterday
    let aggregation: string
    
    switch (range) {
      case 'today':
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)
        dateFrom = todayStart
        const todayEnd = new Date(now)
        todayEnd.setHours(23, 59, 59, 999)
        dateTo = todayEnd
        aggregation = 'Hour'
        break
      case 'yesterday':
        const yday = new Date(now)
        yday.setDate(yday.getDate() - 1)
        const ydayStart = new Date(yday)
        ydayStart.setHours(0, 0, 0, 0)
        dateFrom = ydayStart
        const ydayEnd = new Date(yday)
        ydayEnd.setHours(23, 59, 59, 999)
        dateTo = ydayEnd
        aggregation = 'Hour'
        break
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        aggregation = view === 'live' ? 'Hour' : 'Day'
        break
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        aggregation = view === 'live' ? 'Hour' : 'Day'
        break
      case 'thisMonth':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        aggregation = 'Day'
        break
      case 'lastMonth':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        dateTo = new Date(now.getFullYear(), now.getMonth(), 0)
        aggregation = 'Day'
        break
      case '12m':
        dateFrom = new Date(now)
        dateFrom.setMonth(now.getMonth() - 12)
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
    
    // Override aggregation based on view preference
    if (view === 'live') {
      aggregation = 'Hour'
    } else if (view === 'day') {
      aggregation = 'Day'
    } else if (view === 'month') {
      aggregation = 'Month'
    } else if (view === 'year' || view === 'all') {
      aggregation = 'Year'
    }
    
    return {
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
      aggregation
    }
  }

  const processConsumptionDataWithPrices = (result: any, priceData: any[], aggregation: string) => {
    const dataMap = new Map()
    const priceMap = new Map()
    
    // Process price data safely
    if (Array.isArray(priceData)) {
      priceData.forEach((price: any) => {
        try {
          const date = new Date(price.HourDK || price.HourUTC)
          const key = aggregation === 'Hour' 
            ? date.toISOString()
            : date.toISOString().split('T')[0]
          priceMap.set(key, price.TotalPriceKWh || 0)
        } catch (e) {
          console.warn('Error processing price data point:', e)
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
                    // Day aggregation
                    date = new Date(startDate.getTime() + (position - 1) * 24 * 60 * 60 * 1000)
                    dateKey = date.toISOString().split('T')[0]
                  }
                  
                  const existingData = dataMap.get(dateKey) || { consumption: 0, price: 0, cost: 0 }
                  const consumption = existingData.consumption + (Number.isNaN(quantity) ? 0 : quantity)
                  const price = priceMap.get(dateKey) || existingData.price || 2.5 // Default price if not found
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
        formattedDate: formatDateForDisplay(date, aggregation),
        priceColor: getPriceColor(data.price),
        consumptionColor: getConsumptionColor(data.consumption)
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
      : { consumption: 0, date: '', formattedDate: 'N/A' }
    
    return {
      data: processedData,
      priceData: processedData,
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
      const month = DANISH_MONTHS_SHORT[d.getMonth()]
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

  const getPriceColor = (price: number): string => {
    if (price < 1.5) return CHART_COLORS.low
    if (price < 2.5) return CHART_COLORS.medium
    return CHART_COLORS.high
  }

  const getConsumptionColor = (consumption: number): string => {
    const avg = consumptionData.averageConsumption
    if (consumption < avg * 0.8) return CHART_COLORS.low
    if (consumption < avg * 1.2) return CHART_COLORS.medium
    return CHART_COLORS.high
  }

  const adjustDateByYear = (dateStr: string, years: number): string => {
    const date = new Date(dateStr)
    date.setFullYear(date.getFullYear() + years)
    return date.toISOString().split('T')[0]
  }

  const copyCustomerId = () => {
    const customerId = customerData?.customerCVR || customerData?.customerId || 'N/A'
    navigator.clipboard.writeText(customerId)
    setCopiedCustomerId(true)
    setTimeout(() => setCopiedCustomerId(false), 2000)
  }

  const getChartComponent = () => {
    const data = consumptionData.data
    
    if (data.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Ingen forbrugsdata tilgængelig for denne periode</p>
          </div>
        </div>
      )
    }
    
    // Combined chart with consumption bars and price line
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <defs>
            <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.gradient.from} stopOpacity={0.9}/>
              <stop offset="95%" stopColor={CHART_COLORS.gradient.to} stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.price} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.price} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={'preserveStartEnd'}
          />
          <YAxis 
            yAxisId="consumption"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: 'Forbrug (kWh)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.consumption } }}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: 'Pris (kr/kWh)', angle: 90, position: 'insideRight', style: { fill: CHART_COLORS.price } }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          
          {/* Average reference lines */}
          <ReferenceLine 
            yAxisId="consumption"
            y={consumptionData.averageConsumption} 
            stroke="#94a3b8" 
            strokeDasharray="3 3" 
            label={{ value: "Gennemsnit", position: "left", style: { fontSize: 10, fill: '#94a3b8' } }}
          />
          
          <Bar 
            yAxisId="consumption"
            dataKey="consumption" 
            fill="url(#consumptionGradient)"
            radius={[4, 4, 0, 0]}
            name="Forbrug (kWh)"
          />
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={CHART_COLORS.price}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.price, r: 3 }}
            name="Pris (kr/kWh)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    
    const consumption = payload.find((p: any) => p.dataKey === 'consumption')?.value || 0
    const price = payload.find((p: any) => p.dataKey === 'price')?.value || 0
    const cost = consumption * price
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-sm mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.consumption }}></div>
            <span className="text-sm">Forbrug: {consumption.toFixed(2)} kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.price }}></div>
            <span className="text-sm">Pris: {price.toFixed(2)} kr/kWh</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-sm font-semibold">Omkostning: {cost.toFixed(2)} kr</span>
          </div>
        </div>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (consumptionData.data.length < 2) return <Minus className="h-4 w-4 text-gray-500" />
    
    const lastPeriod = consumptionData.data[consumptionData.data.length - 1].consumption
    const previousPeriod = consumptionData.data[consumptionData.data.length - 2].consumption
    const change = ((lastPeriod - previousPeriod) / previousPeriod) * 100
    
    if (change > 10) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <ArrowUp className="h-4 w-4" />
          <span className="text-xs font-medium">+{change.toFixed(0)}%</span>
        </div>
      )
    } else if (change < -10) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <ArrowDown className="h-4 w-4" />
          <span className="text-xs font-medium">{change.toFixed(0)}%</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <Minus className="h-4 w-4" />
          <span className="text-xs font-medium">{change > 0 ? '+' : ''}{change.toFixed(0)}%</span>
        </div>
      )
    }
  }

  const DateRangePicker = () => {
    const ranges: { value: DateRange; label: string; icon: any }[] = [
      { value: 'today', label: 'I dag', icon: Calendar },
      { value: 'yesterday', label: 'I går', icon: Calendar },
      { value: '7d', label: '7 dage', icon: CalendarDays },
      { value: '30d', label: '30 dage', icon: CalendarDays },
      { value: 'thisMonth', label: 'Denne måned', icon: CalendarRange },
      { value: 'lastMonth', label: 'Sidste måned', icon: CalendarRange },
      { value: '12m', label: '12 måneder', icon: CalendarRange },
      { value: '5y', label: '5 år', icon: CalendarRange },
    ]
    
    return (
      <div className="flex flex-wrap gap-2">
        {ranges.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            size="sm"
            variant={dateRange === value ? "default" : "outline"}
            onClick={() => setDateRange(value)}
            className={dateRange === value ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Forbrugsanalyse
            </h3>
            {customerData?.meteringPointIds && (
              <p className="text-sm text-gray-600">
                {customerData.meteringPointIds.length} målerpunkt{customerData.meteringPointIds.length !== 1 ? 'er' : ''} aktiv
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            className={showComparison ? "border-blue-600 text-blue-600" : ""}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Sammenlign år
          </Button>
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

      {/* Date Range Picker */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <DateRangePicker />
        </CardContent>
      </Card>

      {/* Time View Tabs */}
      <Tabs value={timeView} onValueChange={(v) => setTimeView(v as TimeView)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="live" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Zap className="h-4 w-4 mr-2" />
            Live
          </TabsTrigger>
          <TabsTrigger value="day" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Dage
          </TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CalendarDays className="h-4 w-4 mr-2" />
            Måneder
          </TabsTrigger>
          <TabsTrigger value="year" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CalendarRange className="h-4 w-4 mr-2" />
            År
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Alt
          </TabsTrigger>
        </TabsList>

        <TabsContent value={timeView} className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  {getTrendIcon()}
                </div>
                <p className="text-sm text-gray-600">Total forbrug</p>
                <p className="text-2xl font-bold text-blue-900">
                  {consumptionData.isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${consumptionData.totalConsumption.toFixed(0)} kWh`
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Total omkostning</p>
                <p className="text-2xl font-bold text-green-900">
                  {consumptionData.isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${consumptionData.totalCost.toFixed(0)} kr`
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600">Gennemsnit</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {consumptionData.isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${consumptionData.averageConsumption.toFixed(1)} kWh`
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Højeste</p>
                <p className="text-xl font-bold text-orange-900">
                  {consumptionData.isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      {consumptionData.peakConsumption.toFixed(1)} kWh
                      <span className="text-xs block text-orange-700">{consumptionData.peakDate}</span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Info className="h-5 w-5 text-purple-600" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyCustomerId}
                    className="h-6 w-6 p-0"
                  >
                    {copiedCustomerId ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-purple-600" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Kundenummer</p>
                <p className="text-sm font-bold text-purple-900 truncate" title={customerData?.customerCVR || customerData?.customerId}>
                  {customerData?.customerCVR || customerData?.customerId || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">
                    Forbrug & Priser
                  </CardTitle>
                  <CardDescription>
                    {timeView === 'live' && 'Timebaseret forbrug og priser'}
                    {timeView === 'day' && 'Dagligt forbrug og gennemsnitspriser'}
                    {timeView === 'month' && 'Månedligt forbrug og priser'}
                    {timeView === 'year' && 'Årligt forbrug og priser'}
                    {timeView === 'all' && 'Komplet historik'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-white">
                  {consumptionData.data.length} datapunkter
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {consumptionData.isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Henter forbrugsdata...</p>
                  </div>
                </div>
              ) : consumptionData.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{consumptionData.error}</AlertDescription>
                </Alert>
              ) : (
                getChartComponent()
              )}
            </CardContent>
          </Card>

          {/* Year Comparison (if enabled) */}
          {showComparison && consumptionData.comparisonData && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>År-til-år sammenligning</CardTitle>
                <CardDescription>
                  Sammenlign dit forbrug med samme periode sidste år
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Sammenligningsdata kommer snart...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-end gap-2">
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
            a.download = `forbrug-${timeView}-${new Date().toISOString().split('T')[0]}.csv`
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