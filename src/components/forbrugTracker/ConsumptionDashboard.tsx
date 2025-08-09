import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  Legend
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
  Info
} from 'lucide-react'

interface ConsumptionDashboardProps {
  customerData: any
  onRefresh: () => void
}

type TimeView = 'hour' | 'day' | 'month' | 'year'
type DateRange = '24h' | '7d' | '30d' | '12m' | '5y' | 'custom'

interface ConsumptionData {
  data: any[]
  totalConsumption: number
  averageConsumption: number
  peakConsumption: number
  peakDate: string
  comparisonData?: any
  isLoading: boolean
  error?: string
}

export function ConsumptionDashboard({ customerData, onRefresh }: ConsumptionDashboardProps) {
  const [timeView, setTimeView] = useState<TimeView>('day')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [consumptionData, setConsumptionData] = useState<ConsumptionData>({
    data: [],
    totalConsumption: 0,
    averageConsumption: 0,
    peakConsumption: 0,
    peakDate: '',
    isLoading: false
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch data when view or range changes
  useEffect(() => {
    fetchConsumptionData()
  }, [timeView, dateRange])

  const fetchConsumptionData = async () => {
    setConsumptionData(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Calculate date range based on selection
      const { dateFrom, dateTo, aggregation } = calculateDateRange(dateRange, timeView)
      
      console.log(`Fetching ${aggregation} data from ${dateFrom} to ${dateTo}`)
      
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
          aggregation
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch consumption data: ${response.status}`)
      }
      
      const result = await response.json()
      const processedData = processConsumptionDataAdvanced(result, aggregation)
      
      setConsumptionData({
        data: processedData.data,
        totalConsumption: processedData.total,
        averageConsumption: processedData.average,
        peakConsumption: processedData.peak,
        peakDate: processedData.peakDate,
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchConsumptionData()
    if (onRefresh) onRefresh()
    setIsRefreshing(false)
  }

  const calculateDateRange = (range: DateRange, view: TimeView) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(12, 0, 0, 0)
    
    let dateFrom: Date
    let dateTo = yesterday
    let aggregation: string
    
    switch (range) {
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        aggregation = 'Hour'
        break
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        aggregation = view === 'hour' ? 'Hour' : 'Day'
        break
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        aggregation = view === 'hour' ? 'Hour' : 'Day'
        break
      case '12m':
        dateFrom = new Date(now)
        dateFrom.setMonth(now.getMonth() - 12)
        aggregation = view === 'year' ? 'Year' : 'Month'
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
    if (view === 'hour' && ['24h', '7d'].includes(range)) {
      aggregation = 'Hour'
    } else if (view === 'day' && ['7d', '30d'].includes(range)) {
      aggregation = 'Day'
    } else if (view === 'month' && ['12m', '5y'].includes(range)) {
      aggregation = 'Month'
    } else if (view === 'year') {
      aggregation = 'Year'
    }
    
    return {
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
      aggregation
    }
  }

  const processConsumptionDataAdvanced = (result: any, aggregation: string) => {
    const dataMap = new Map()
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
                  
                  dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + (Number.isNaN(quantity) ? 0 : quantity))
                })
              }
            })
          }
        })
      }
    })
    
    const processedData = Array.from(dataMap.entries())
      .map(([date, consumption]) => ({
        date,
        consumption,
        formattedDate: formatDateForDisplay(date, aggregation)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    const total = processedData.reduce((sum, d) => sum + d.consumption, 0)
    const average = processedData.length > 0 ? total / processedData.length : 0
    const peakData = processedData.reduce((max, d) => d.consumption > max.consumption ? d : max, 
      { consumption: 0, date: '', formattedDate: '' })
    
    return {
      data: processedData,
      total,
      average,
      peak: peakData.consumption,
      peakDate: peakData.formattedDate
    }
  }

  const formatDateForDisplay = (date: string, aggregation: string): string => {
    if (aggregation === 'Hour') {
      const d = new Date(date)
      return `${d.getDate()}/${d.getMonth() + 1} kl. ${String(d.getHours()).padStart(2, '0')}`
    } else if (aggregation === 'Month') {
      const [year, month] = date.split('-')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
      return `${months[parseInt(month) - 1]} ${year}`
    } else if (aggregation === 'Year') {
      return date
    } else {
      const d = new Date(date)
      return `${d.getDate()}/${d.getMonth() + 1}`
    }
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
    
    if (timeView === 'hour' || timeView === 'day') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Forbrug']}
              labelFormatter={(label) => `${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="consumption" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorConsumption)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    } else {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 11 }}
              angle={timeView === 'month' ? -45 : 0}
              textAnchor={timeView === 'month' ? "end" : "middle"}
              height={timeView === 'month' ? 60 : 40}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(0)} kWh`, 'Forbrug']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="consumption" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }

  const getTrendIcon = () => {
    // Calculate trend based on last two periods
    if (consumptionData.data.length < 2) return <Minus className="h-4 w-4 text-gray-500" />
    
    const lastPeriod = consumptionData.data[consumptionData.data.length - 1].consumption
    const previousPeriod = consumptionData.data[consumptionData.data.length - 2].consumption
    
    if (lastPeriod > previousPeriod * 1.1) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (lastPeriod < previousPeriod * 0.9) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Forbrugsanalyse</h3>
          {customerData?.meteringPointIds && (
            <Badge variant="outline">
              {customerData.meteringPointIds.length} målerpunkt{customerData.meteringPointIds.length !== 1 ? 'er' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Sidste 24 timer</SelectItem>
              <SelectItem value="7d">Sidste 7 dage</SelectItem>
              <SelectItem value="30d">Sidste 30 dage</SelectItem>
              <SelectItem value="12m">Sidste 12 måneder</SelectItem>
              <SelectItem value="5y">Sidste 5 år</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Time View Tabs */}
      <Tabs value={timeView} onValueChange={(v) => setTimeView(v as TimeView)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hour" disabled={!['24h', '7d'].includes(dateRange)}>
            <Clock className="h-4 w-4 mr-2" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="day">
            <Calendar className="h-4 w-4 mr-2" />
            Dage
          </TabsTrigger>
          <TabsTrigger value="month" disabled={['24h', '7d'].includes(dateRange)}>
            <CalendarDays className="h-4 w-4 mr-2" />
            Måneder
          </TabsTrigger>
          <TabsTrigger value="year" disabled={!['5y'].includes(dateRange)}>
            <CalendarRange className="h-4 w-4 mr-2" />
            År
          </TabsTrigger>
        </TabsList>

        <TabsContent value={timeView} className="space-y-4 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total forbrug</p>
                <p className="text-2xl font-bold">
                  {consumptionData.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `${consumptionData.totalConsumption.toFixed(0)} kWh`
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Gennemsnit</p>
                <p className="text-2xl font-bold">
                  {consumptionData.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `${consumptionData.averageConsumption.toFixed(1)} kWh`
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Højeste forbrug</p>
                <p className="text-2xl font-bold">
                  {consumptionData.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `${consumptionData.peakConsumption.toFixed(1)} kWh`
                  )}
                </p>
                {consumptionData.peakDate && (
                  <p className="text-xs text-gray-500 mt-1">{consumptionData.peakDate}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Tendens</p>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon()}
                  <span className="text-sm">
                    {consumptionData.data.length >= 2 ? 'Seneste periode' : 'Ingen data'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                Forbrugsoversigt
              </CardTitle>
              <CardDescription>
                {timeView === 'hour' && 'Timebaseret forbrug'}
                {timeView === 'day' && 'Dagligt forbrug'}
                {timeView === 'month' && 'Månedligt forbrug'}
                {timeView === 'year' && 'Årligt forbrug'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consumptionData.isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Export functionality
            const csvContent = [
              ['Dato', 'Forbrug (kWh)'],
              ...consumptionData.data.map(d => [d.formattedDate, d.consumption.toFixed(2)])
            ].map(e => e.join(',')).join('\n')
            
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `forbrug-${timeView}-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
          }}
          disabled={consumptionData.data.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Eksporter data
        </Button>
      </div>
    </div>
  )
}