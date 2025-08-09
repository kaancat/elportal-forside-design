import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  TrendingUp, 
  Calculator, 
  Shield,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Clock,
  Calendar,
  Loader2,
  User,
  Home,
  RefreshCw
} from 'lucide-react'
import { ConsumptionChart } from './ConsumptionChart'
import { ConsumptionDashboard } from './ConsumptionDashboard'
import { TrueCostCalculator } from './TrueCostCalculator'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ContentErrorFallback } from '@/components/ErrorFallbacks'

interface ForbrugTrackerProps {
  title?: string
  description?: string
  connectButtonText?: string
  connectedText?: string
  showBenefits?: boolean
  headerAlignment?: 'left' | 'center' | 'right'
}

// The authorization URL with your third-party ID
// Must match the redirect configured in WordPress on mondaybrew.dk
const AUTHORIZATION_URL = 'https://eloverblik.dk/power-of-attorney?thirdPartyId=945ac027-559a-4923-a670-66bfda8d27c6&fromDate=2021-08-08&toDate=2028-08-08&returnUrl=https%3A%2F%2Fmondaybrew.dk%2Fdinelportal-callback%2F'

export function ForbrugTracker({
  title = 'Start Din Forbrug Tracker',
  description = 'Forbind med Eloverblik for at se dine personlige forbrugsdata',
  connectButtonText = 'Forbind med Eloverblik',
  connectedText = 'Forbundet med Eloverblik',
  showBenefits = true,
  headerAlignment = 'center'
}: ForbrugTrackerProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [consumptionData, setConsumptionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRequestInFlight, setIsRequestInFlight] = useState(false)
  const didInitRef = useRef(false)

  // Check if user has been authorized (returned from Eloverblik)
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    // Only run on client
    if (typeof window === 'undefined') return

    // Check URL parameters for callback from Eloverblik
    const params = new URLSearchParams(window.location.search)
    const authorized = params.get('authorized')
    const customerId = params.get('customer')

    // If we see authorized=true in URL, the user just came back from Eloverblik
    if (authorized === 'true') {
      console.log('User returned from Eloverblik authorization')
      setIsAuthorized(true)
      // Small delay to ensure Eloverblik has processed the authorization
      setTimeout(() => {
        checkAuthorization(customerId)
      }, 1000)
    } else if (window.location.pathname.includes('forbrug-tracker')) {
      // Always check for authorizations when on the forbrug-tracker page
      console.log('Checking for existing authorizations...')
      checkAuthorization(null)
    }
  }, [])

  const checkAuthorization = async (customerId?: string | null) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch list of authorized customers
      const response = await fetch('/api/eloverblik?action=thirdparty-authorizations')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Authorization data:', data) // Debug log
        
        if (data.authorizations && data.authorizations.length > 0) {
          setIsAuthorized(true) // We have authorizations
          
          // For simplicity, use the first authorization or match by customerId
          const auth = customerId 
            ? data.authorizations.find((a: any) => a.customerId === customerId)
            : data.authorizations[0]
          
          if (auth) {
            console.log('Using authorization:', auth) // Debug log
            setCustomerData(auth)
            // Fetch consumption using explicit authorizationId and cached metering points when available
            await fetchConsumptionData({
              authorizationId: auth.authorizationId,
              customerCVR: auth.customerCVR,
              meteringPointIds: auth.meteringPointIds,
            })
          }
        } else {
          console.log('No authorizations found')
          setIsAuthorized(false)
        }
      } else {
        console.error('Authorization check failed:', response.status)
        setError('Kunne ikke hente autorisationsdata')
      }
    } catch (err) {
      console.error('Error checking authorization:', err)
      setError('Kunne ikke hente autorisationsdata')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConsumptionData = async (params: { authorizationId?: string; customerCVR?: string; meteringPointIds?: string[] }) => {
    try {
      if (isRequestInFlight) return
      setIsRequestInFlight(true)
      console.log('Fetching consumption with params:', params) // Debug log
      
      // Get metering points from customerData if available
      const meteringPointIds = params.meteringPointIds || customerData?.meteringPointIds
      
      // Get last 30 days of data, but ensure we don't request future dates
      // Use yesterday as the end date to avoid timezone issues
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0) // Set to midday to avoid timezone edge cases
      
      const thirtyDaysAgo = new Date(yesterday.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Format dates in Danish timezone
      const dateFrom = thirtyDaysAgo.toISOString().split('T')[0]
      const dateTo = yesterday.toISOString().split('T')[0]
      
      console.log(`Requesting consumption data from ${dateFrom} to ${dateTo}`)
      
      const response = await fetch('/api/eloverblik?action=thirdparty-consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Prefer explicit identifiers and cached metering point ids
          authorizationId: params.authorizationId,
          customerCVR: params.customerCVR,
          meteringPointIds: meteringPointIds, // Pass cached metering points if available
          dateFrom,
          dateTo,
          aggregation: 'Day'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Consumption data received:', data) // Debug log
        setConsumptionData(data)
        
        // Calculate total consumption for display
        if (data.result && Array.isArray(data.result)) {
          let total = 0
          data.result.forEach((mp: any) => {
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
          console.log('Total consumption calculated:', total, 'kWh')
        }
      } else {
        console.error('Failed to fetch consumption:', response.status)
        try {
          const errorData = await response.json()
          console.error('Error details:', errorData)
          if (response.status === 429 || response.status === 503) {
            setError('Tjenesten er midlertidigt overbelastet (429/503). Vent 1 minut og prøv igen.')
          } else if (errorData.details) {
            setError(`Kunne ikke hente forbrugsdata: ${errorData.details}`)
          } else {
            setError(`Kunne ikke hente forbrugsdata: ${errorData.error || 'Ukendt fejl'}`)
          }
        } catch {
          const errorText = await response.text()
          console.error('Error text:', errorText)
          setError('Kunne ikke hente forbrugsdata')
        }
      }
    } catch (err) {
      console.error('Error fetching consumption:', err)
      setError('Kunne ikke hente forbrugsdata')
    } finally {
      setIsRequestInFlight(false)
    }
  }

  const handleConnect = () => {
    // Redirect to Eloverblik authorization page
    window.location.href = AUTHORIZATION_URL
  }

  const getAlignmentClass = () => {
    switch (headerAlignment) {
      case 'left': return 'text-left'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  return (
    <ErrorBoundary
      level="component"
      fallback={
        <div className="w-full py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <ContentErrorFallback 
              onRetry={() => checkAuthorization(null)} 
              message="Forbrug Tracker stødte på en fejl"
            />
          </div>
        </div>
      }
      onError={(error) => {
        // Log details for diagnostics without crashing other content
        console.error('ForbrugTracker error boundary caught:', error)
      }}
    >
    <div className="w-full py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className={`mb-8 ${getAlignmentClass()}`}>
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          {description && (
            <p className="text-gray-600 text-lg">{description}</p>
          )}
        </div>

        {/* Main Content */}
        {!isAuthorized ? (
          <>
            {/* Connection Card */}
            <Card className="mb-8">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">
                  Få Adgang til Dine Forbrugsdata
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Forbind sikkert med Eloverblik gennem MitID og se dit faktiske elforbrug
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={handleConnect}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {connectButtonText}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>100% sikkert med MitID authentication</span>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            {showBenefits && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <BarChart3 className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold mb-2">Faktiske Data</h3>
                    <p className="text-sm text-gray-600">
                      Se dit reelle forbrug time for time
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <Calculator className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="font-semibold mb-2">Præcise Priser</h3>
                    <p className="text-sm text-gray-600">
                      Beregn faktiske omkostninger
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold mb-2">Find Besparelser</h3>
                    <p className="text-sm text-gray-600">
                      Se hvor meget du kan spare
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold mb-2">Sikker & Privat</h3>
                    <p className="text-sm text-gray-600">
                      Dine data gemmes aldrig
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Authorized View */}
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Henter dine forbrugsdata...</p>
                  <p className="text-sm text-gray-500 mt-2">Dette kan tage et øjeblik...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button 
                    onClick={() => checkAuthorization(null)}
                    variant="outline"
                  >
                    Prøv igen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Connection Status */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">{connectedText}</p>
                          {customerData && (
                            <p className="text-sm text-green-700 mt-1">
                              {customerData.meteringPointIds?.length || 0} målerpunkt{customerData.meteringPointIds?.length !== 1 ? 'er' : ''} aktiv
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            console.log('Refreshing data...', customerData)
                            if (customerData?.authorizationId || customerData?.customerCVR) {
                              await fetchConsumptionData({
                                authorizationId: customerData?.authorizationId,
                                customerCVR: customerData?.customerCVR,
                                meteringPointIds: customerData?.meteringPointIds,
                              })
                            } else {
                              await checkAuthorization(null)
                            }
                          }}
                          title="Opdater data"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Badge variant="outline" className="border-green-600 text-green-700">
                          Aktiv
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Tabs */}
                <Tabs defaultValue="consumption" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="consumption">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Forbrug
                    </TabsTrigger>
                    <TabsTrigger value="costs">
                      <Calculator className="h-4 w-4 mr-2" />
                      Omkostninger
                    </TabsTrigger>
                    <TabsTrigger value="savings">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Besparelser
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="consumption" className="mt-6">
                    <ConsumptionDashboard 
                      customerData={customerData}
                      onRefresh={() => checkAuthorization(null)}
                    />
                  </TabsContent>

                  <TabsContent value="costs" className="mt-6">
                    <TrueCostCalculator consumptionData={consumptionData} />
                  </TabsContent>

                  <TabsContent value="savings" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Potentielle Besparelser</CardTitle>
                        <CardDescription>
                          Baseret på dit faktiske forbrug
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Alert>
                            <TrendingUp className="h-4 w-4" />
                            <AlertDescription>
                              Vi analyserer dit forbrug og finder de bedste tilbud...
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Quick Stats */}
                {customerData && (
                  <div className="grid md:grid-cols-4 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Total forbrug</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {consumptionData?.totalConsumption 
                            ? `${consumptionData.totalConsumption.toFixed(0)} kWh`
                            : '0 kWh'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Gennemsnit/dag</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {consumptionData?.totalConsumption 
                            ? `${(consumptionData.totalConsumption / 30).toFixed(1)} kWh`
                            : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Home className="h-4 w-4" />
                          <span className="text-sm">Målerpunkter</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {customerData?.meteringPointIds?.length || 1}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">Kundenummer</span>
                        </div>
                        <p className="text-lg font-bold truncate" title={customerData?.customerCVR || customerData?.customerId}>
                          {customerData?.customerCVR || customerData?.customerId || 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}