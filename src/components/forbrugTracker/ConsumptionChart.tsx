import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  AreaChart
} from 'recharts'

interface ConsumptionChartProps {
  data: any
}

export function ConsumptionChart({ data }: ConsumptionChartProps) {
  if (!data || !data.result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forbrugsdata</CardTitle>
          <CardDescription>Ingen data tilgængelig</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Ingen forbrugsdata at vise
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process the consumption data from Eloverblik format
  const processedData = processConsumptionData(data.result)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dit Elforbrug</CardTitle>
        <CardDescription>
          Fra {data.dateFrom} til {data.dateTo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData}>
              <defs>
                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Forbrug']}
                labelFormatter={(label) => `Dato: ${new Date(label).toLocaleDateString('da-DK')}`}
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
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600">Total forbrug</p>
            <p className="text-xl font-semibold">
              {processedData.reduce((sum, d) => sum + d.consumption, 0).toFixed(1)} kWh
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gennemsnit per dag</p>
            <p className="text-xl font-semibold">
              {(processedData.reduce((sum, d) => sum + d.consumption, 0) / processedData.length).toFixed(1)} kWh
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Højeste dag</p>
            <p className="text-xl font-semibold">
              {Math.max(...processedData.map(d => d.consumption)).toFixed(1)} kWh
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function processConsumptionData(result: any[]): any[] {
  const dataMap = new Map()

  // Process each metering point's data
  result.forEach(meteringPoint => {
    if (meteringPoint.MyEnergyData_MarketDocument?.TimeSeries) {
      meteringPoint.MyEnergyData_MarketDocument.TimeSeries.forEach((ts: any) => {
        if (ts.Period) {
          ts.Period.forEach((period: any) => {
            const start = period['timeInterval.start']
            const end = period['timeInterval.end']
            
            if (period.Point) {
              period.Point.forEach((point: any) => {
                const quantity = parseFloat(point['out_Quantity.quantity'] || 0)
                const position = parseInt(point.position || 1)
                
                // Calculate the date for this point
                const startDate = new Date(start)
                const date = new Date(startDate.getTime() + (position - 1) * 24 * 60 * 60 * 1000)
                const dateKey = date.toISOString().split('T')[0]
                
                // Aggregate consumption by date
                if (dataMap.has(dateKey)) {
                  dataMap.set(dateKey, dataMap.get(dateKey) + quantity)
                } else {
                  dataMap.set(dateKey, quantity)
                }
              })
            }
          })
        }
      })
    }
  })

  // Convert to array and sort by date
  return Array.from(dataMap.entries())
    .map(([date, consumption]) => ({
      date,
      consumption
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}