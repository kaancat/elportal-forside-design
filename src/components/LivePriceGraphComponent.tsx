import React, { useEffect, useState } from 'react'
import { LivePriceGraph } from '@/types/sanity'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

interface LivePriceGraphComponentProps {
  block: LivePriceGraph
}

interface PriceData {
  hour: string
  price: number
}

interface ApiResponse {
  records: Array<{
    HourDK: string
    SpotPriceDKK: number
  }>
}

// Force build refresh - Updated to use current date correctly
const LivePriceGraphComponent: React.FC<LivePriceGraphComponentProps> = ({ block }) => {
  const [data, setData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get today's date in the required format - FIXED TO USE CURRENT DATE
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}` // YYYY-MM-DD format
        
        console.log('Current date being used for API call:', dateStr)
        
        // Construct API URL
        const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser'
        const startTime = `${dateStr}T00:00`
        const endTime = `${dateStr}T23:59`
        const filter = encodeURIComponent(`{"PriceArea":["${block.apiRegion}"]}`)
        const apiUrl = `${baseUrl}?start=${startTime}&end=${endTime}&filter=${filter}`

        console.log('Fetching electricity price data from:', apiUrl)

        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const apiData: ApiResponse = await response.json()
        console.log('Raw API response:', apiData)

        // Transform data for chart
        const transformedData: PriceData[] = apiData.records.map(record => {
          // Extract hour from HourDK format (e.g., "2024-06-08T00:00:00")
          const hour = new Date(record.HourDK).getHours()
          // Convert from DKK/MWh to kr/kWh
          const pricePerKwh = record.SpotPriceDKK / 1000
          
          return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            price: Math.round(pricePerKwh * 100) / 100 // Round to 2 decimal places
          }
        })

        // Sort by hour to ensure correct order
        transformedData.sort((a, b) => parseInt(a.hour) - parseInt(b.hour))

        console.log('Transformed price data:', transformedData)
        setData(transformedData)
      } catch (err) {
        console.error('Error fetching price data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch price data')
      } finally {
        setLoading(false)
      }
    }

    fetchPriceData()
  }, [block.apiRegion])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Kl. ${label}`}</p>
          <p className="text-brand-green">
            {`${payload[0].value} kr/kWh`}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-2" />
          {block.subtitle && <Skeleton className="h-6 w-48 mb-6" />}
          <Skeleton className="h-80 w-full" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
          {block.subtitle && (
            <p className="text-gray-600 mb-6">{block.subtitle}</p>
          )}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Kunne ikke hente prisdata: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
        {block.subtitle && (
          <p className="text-gray-600 mb-6">{block.subtitle}</p>
        )}
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'kr/kWh', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="price" 
                fill="#84db41"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            Priser for {block.apiRegion === 'DK1' ? 'Vest-Danmark' : 'Øst-Danmark'} i dag
          </div>
        </div>
      </div>
    </section>
  )
}

export default LivePriceGraphComponent
