import React, { useState } from 'react'
import { ConnectEloverblik } from '@/components/eloverblik/ConnectEloverblik'
import { ThirdPartyFuldmagt } from '@/components/eloverblik/ThirdPartyFuldmagt'
import { getConsumption } from '@/services/eloverblik'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Zap, TrendingUp, Activity, Building2, User } from 'lucide-react'

export function TestEloverblik() {
  const [isConnected, setIsConnected] = useState(false)
  const [refreshToken, setRefreshToken] = useState('')
  const [meteringPoints, setMeteringPoints] = useState<any[]>([])
  const [consumptionData, setConsumptionData] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = (token: string, points: any[]) => {
    setRefreshToken(token)
    setMeteringPoints(points)
    setIsConnected(true)
    console.log('Connected with', points.length, 'metering points')
  }

  const fetchLastMonthConsumption = async () => {
    if (!refreshToken || meteringPoints.length === 0) return

    setIsLoadingData(true)
    setError(null)

    try {
      // Get dates for last month
      const today = new Date()
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      
      const dateFrom = lastMonth.toISOString().split('T')[0]
      const dateTo = endOfLastMonth.toISOString().split('T')[0]
      
      console.log('Fetching consumption from', dateFrom, 'to', dateTo)
      
      // Fetch consumption data
      const result = await getConsumption(
        refreshToken,
        meteringPoints.map(mp => mp.meteringPointId),
        dateFrom,
        dateTo,
        'Day' // Daily aggregation for monthly view
      )
      
      setConsumptionData(result)
      console.log('Consumption data:', result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consumption')
      console.error('Error fetching consumption:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchLastWeekConsumption = async () => {
    if (!refreshToken || meteringPoints.length === 0) return

    setIsLoadingData(true)
    setError(null)

    try {
      // Get dates for last week
      const today = new Date()
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const dateFrom = lastWeek.toISOString().split('T')[0]
      const dateTo = today.toISOString().split('T')[0]
      
      console.log('Fetching consumption from', dateFrom, 'to', dateTo)
      
      // Fetch hourly consumption data
      const result = await getConsumption(
        refreshToken,
        meteringPoints.map(mp => mp.meteringPointId),
        dateFrom,
        dateTo,
        'Hour' // Hourly data for detailed analysis
      )
      
      setConsumptionData(result)
      console.log('Consumption data:', result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consumption')
      console.error('Error fetching consumption:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  const calculateTotalConsumption = () => {
    if (!consumptionData?.result) return 0
    
    let total = 0
    consumptionData.result.forEach((mp: any) => {
      if (mp.MyEnergyData_MarketDocument?.TimeSeries) {
        mp.MyEnergyData_MarketDocument.TimeSeries.forEach((ts: any) => {
          if (ts.Period) {
            ts.Period.forEach((period: any) => {
              if (period.Point) {
                period.Point.forEach((point: any) => {
                  total += parseFloat(point['out_Quantity.quantity'] || 0)
                })
              }
            })
          }
        })
      }
    })
    
    return total
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Eloverblik Integration</h1>
          <p className="text-gray-600 mt-2">
            Test både tredjepartsadgang og direkte kundeadgang
          </p>
        </div>

        <Tabs defaultValue="thirdparty" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thirdparty" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tredjepartsadgang (Virksomhed)
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Kundeadgang (Test)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="thirdparty" className="space-y-6">
            <Alert>
              <AlertDescription>
                Som godkendt tredjepart (mondaybrew ApS) kan du modtage fuldmagter fra kunder 
                og hente deres forbrugsdata gennem ElOverblik's Third Party API.
              </AlertDescription>
            </Alert>
            <ThirdPartyFuldmagt />
          </TabsContent>

          <TabsContent value="customer" className="space-y-6">
            <Alert>
              <AlertDescription>
                Dette er til test hvor du selv indsætter din personlige token for at se dit eget forbrug.
                I produktion vil kunder give adgang via fuldmagt.
              </AlertDescription>
            </Alert>

            {!isConnected ? (
              <ConnectEloverblik onConnect={handleConnect} />
            ) : (
              <div className="space-y-6">
            {/* Connection Status */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Forbundet til Eloverblik
                </CardTitle>
                <CardDescription className="text-green-700">
                  {meteringPoints.length} målerpunkt{meteringPoints.length > 1 ? 'er' : ''} aktiv
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Fetch Data Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hent Forbrugsdata
                </CardTitle>
                <CardDescription>
                  Vælg hvilken periode du vil se data for
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button 
                  onClick={fetchLastWeekConsumption}
                  disabled={isLoadingData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Sidste 7 dage (timedata)
                </Button>
                <Button 
                  onClick={fetchLastMonthConsumption}
                  disabled={isLoadingData}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Sidste måned (dagsdata)
                </Button>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoadingData && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Henter forbrugsdata...</p>
                </CardContent>
              </Card>
            )}

            {/* Consumption Data Display */}
            {consumptionData && !isLoadingData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Forbrugsdata
                  </CardTitle>
                  <CardDescription>
                    Fra {consumptionData.dateFrom} til {consumptionData.dateTo} ({consumptionData.aggregation})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Samlet forbrug</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calculateTotalConsumption().toFixed(2)} kWh
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Metadata:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Enhed: {consumptionData.metadata?.unit}</li>
                        <li>• Tidszone: {consumptionData.metadata?.timezone}</li>
                        <li>• Dataforsinkelse: {consumptionData.metadata?.dataDelay}</li>
                      </ul>
                    </div>

                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        Vis rå data (til debugging)
                      </summary>
                      <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(consumptionData, null, 2)}
                      </pre>
                    </details>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}