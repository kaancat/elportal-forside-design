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

// Bemærk: API-svaret fra vores *egen* API er det samme som fra EnergiDataService
interface ApiResponse {
  records: Array<{
    HourDK: string
    SpotPriceDKK: number
  }>
}

const LivePriceGraphComponent: React.FC<LivePriceGraphComponentProps> = ({ block }) => {
  const [data, setData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Tjek om der overhovedet er en region valgt, før vi forsøger at hente data
    if (!block.apiRegion) {
      setLoading(false)
      setError("Price area (region) has not been selected in Sanity.")
      return
    }

    const fetchPriceData = async () => {
      setLoading(true)
      setError(null)

      try {
        // --- DEN ENE VIGTIGE ÆNDRING ER HER ---
        // Vi kalder nu vores egen interne API-rute, som Vercel hoster for os.
        const apiUrl = `/api/electricity-prices?region=${block.apiRegion}`;
        
        console.log('Fetching data from our INTERNAL API:', apiUrl);

        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          // Hvis vores egen API fejler, viser vi status fra den.
          throw new Error(`Request to our API failed: ${response.status} - ${response.statusText}`)
        }

        const apiData: ApiResponse = await response.json()

        if (!apiData.records || apiData.records.length === 0) {
            throw new Error('No price data available.')
        }

        // Transformér data til det format, vores graf skal bruge
        const transformedData: PriceData[] = apiData.records.map(record => {
          const hour = new Date(record.HourDK).getHours()
          const pricePerKwh = record.SpotPriceDKK / 1000
          
          return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            price: Math.round(pricePerKwh * 100) / 100,
          }
        })

        // Sorter data, da API'et nu kan returnere det i omvendt rækkefølge
        transformedData.sort((a, b) => parseInt(a.hour) - parseInt(b.hour))

        setData(transformedData)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPriceData()
  }, [block.apiRegion])

  // Resten af UI-koden er den samme...
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Kl. ${label}`}</p>
          <p className="text-brand-green">
            {`${payload[0].value.toFixed(2)} kr/kWh`}
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
          {block.subtitle && <p className="text-gray-600 mb-6">{block.subtitle}</p>}
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
        {block.subtitle && <p className="text-gray-600 mb-6">{block.subtitle}</p>}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} label={{ value: 'kr/kWh', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="price" fill="#84db41" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Priser for {block.apiRegion === 'DK1' ? 'Vest-Danmark' : 'Øst-Danmark'} (i går)
          </div>
        </div>
      </div>
    </section>
  )
}

export default LivePriceGraphComponent