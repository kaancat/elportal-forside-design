import React, { useEffect, useState } from 'react'
import { LivePriceGraph } from '@/types/sanity'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

// Definerer strukturen på de props, komponenten modtager
interface LivePriceGraphComponentProps {
  block: LivePriceGraph
}

// Definerer strukturen på den data, vores graf forventer
interface PriceData {
  hour: string
  price: number
}

// Definerer strukturen på det svar, vi forventer fra EnergiDataService API'et
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
    const fetchPriceData = async () => {
      console.log('--- EXECUTING LATEST VERSION OF fetchPriceData ---');
      
      // Sørg for at nulstille status, hver gang vi henter data
      setLoading(true)
      setError(null)

      try {
        // --- START PÅ DEN KORREKTE, SKUDSIKRE DATOLOGIK ---

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        const dateStringForAPI = `${year}-${month}-${day}`;

        const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser';
        const filter = encodeURIComponent(`{"PriceArea":["${block.apiRegion}"]}`);
        const apiUrl = `${baseUrl}?start=${dateStringForAPI}T00:00&end=${dateStringForAPI}T23:59&filter=${filter}`;

        console.log('Final API URL to be fetched:', apiUrl);
        
        // --- SLUT PÅ DATOLOGIK ---

        const response = await fetch(apiUrl)

        // Tjek om API-kaldet var en succes (status 200-299)
        if (!response.ok) {
          // Hvis ikke, kast en fejl med statuskoden, f.eks. "API request failed: 404"
          throw new Error(`API request failed: ${response.status}`)
        }

        const apiData: ApiResponse = await response.json()

        // Hvis der ikke er nogen 'records', er der ingen data for den dag.
        if (!apiData.records || apiData.records.length === 0) {
            throw new Error('No price data available for the selected day.')
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

        // Sorter for en sikkerheds skyld
        transformedData.sort((a, b) => parseInt(a.hour) - parseInt(b.hour))

        setData(transformedData)

      } catch (err) {
        // Håndter eventuelle fejl (både fra fetch og fra databehandling)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        // Sæt loading til false, uanset om det lykkedes eller ej
        setLoading(false)
      }
    }

    // Kald funktionen, når komponenten indlæses, eller når regionen ændres
    if (block.apiRegion) {
        fetchPriceData()
    }
  }, [block.apiRegion])

  // Resten af komponenten (UI-delen) er den samme som før, den skal bare have data...
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
