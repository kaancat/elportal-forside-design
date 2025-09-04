'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
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
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { ConsumptionChart } from './ConsumptionChart'
import { ConsumptionDashboard } from './ConsumptionDashboard'
import { EnhancedConsumptionDashboard } from './EnhancedConsumptionDashboard'
import { ImprovedConsumptionDashboard } from './ImprovedConsumptionDashboard'
import { TrueCostCalculator } from './TrueCostCalculator'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ContentErrorFallback } from '@/components/ErrorFallbacks'
import rateLimiter, { debounce } from '@/utils/rateLimiter'

interface ForbrugTrackerProps {
  title?: string
  description?: string
  connectButtonText?: string
  connectedText?: string
  showBenefits?: boolean
  headerAlignment?: 'left' | 'center' | 'right'
}

// Session configuration
// The authorization flow now uses secure session-based authentication

// Client-side cache helpers
const STORAGE_KEY = 'elportal_consumption_cache'
const AUTH_STORAGE_KEY = 'elportal_auth_cache'
const STORAGE_TTL = 5 * 60 * 1000 // 5 minutes
const AUTH_TTL = 15 * 60 * 1000 // 15 minutes for auth data

const getCachedData = (key: string): any => {
  try {
    const cached = sessionStorage.getItem(`${STORAGE_KEY}_${key}`)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > STORAGE_TTL) {
      sessionStorage.removeItem(`${STORAGE_KEY}_${key}`)
      return null
    }
    
    return data
  } catch {
    return null
  }
}

const setCachedData = (key: string, data: any): void => {
  try {
    sessionStorage.setItem(
      `${STORAGE_KEY}_${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch (e) {
    // Storage full, clear old entries
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(STORAGE_KEY))
      .forEach(k => sessionStorage.removeItem(k))
  }
}

const getCachedAuth = (): any => {
  try {
    const cached = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > AUTH_TTL) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    
    return data
  } catch {
    return null
  }
}

const setCachedAuth = (data: any): void => {
  try {
    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch {
    // Ignore storage errors
  }
}

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
  const [processedConsumptionData, setProcessedConsumptionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRequestInFlight, setIsRequestInFlight] = useState(false)
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number>(0)
  const [errorRetryCount, setErrorRetryCount] = useState(0)
  const didInitRef = useRef(false)
  const fetchStateRef = useRef<'idle' | 'fetching' | 'complete'>('idle')
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown timer for rate limit retry
  useEffect(() => {
    if (rateLimitRetryAfter > 0) {
      const timer = setInterval(() => {
        setRateLimitRetryAfter((prev) => {
          if (prev <= 1) {
            // Clear error when countdown reaches 0
            setError(null)
            setErrorRetryCount(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [rateLimitRetryAfter])

  // Check session and authorization status on mount
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    // Only run on client
    if (typeof window === 'undefined') return

    // Check if we have a valid session
    checkSession()
  }, [])
  
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session?action=verify', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const { authenticated, hasAuthorization, customerId } = await response.json()
        
        if (authenticated && hasAuthorization && customerId) {
          console.log('Session has authorization for customer:', customerId)
          setIsAuthorized(true)
          // Fetch user data with session
          await checkAuthorization(customerId)
        } else if (authenticated && !hasAuthorization) {
          // Session exists but no authorization yet
          console.log('Session exists but no authorization')
          setIsAuthorized(false)
        }
      } else {
        // No session - user needs to start authorization
        console.log('No session found')
        setIsAuthorized(false)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setError('Kunne ikke kontrollere session')
    }
  }

  const checkAuthorization = async (customerId?: string | null) => {
    // Try to use cached auth data first
    const cachedAuth = getCachedAuth()
    if (cachedAuth && cachedAuth.customerId === customerId) {
      console.log('Using cached authorization data')
      setIsAuthorized(true)
      setCustomerData(cachedAuth)
      // Fetch consumption using cached data
      await fetchConsumptionData({
        authorizationId: cachedAuth.authorizationId,
        customerCVR: cachedAuth.customerCVR,
        meteringPointIds: cachedAuth.meteringPointIds,
      })
      return
    }
    
    // Check rate limit before making request
    const { allowed, retryAfter } = rateLimiter.canMakeRequest('eloverblik-auth')
    if (!allowed) {
      setError(`For mange forespørgsler. Vent venligst ${retryAfter} sekunder.`)
      setRateLimitRetryAfter(retryAfter || 60)
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Record the request
      rateLimiter.recordRequest('eloverblik-auth')
      
      // Fetch authorized customer data with session
      const response = await fetch('/api/eloverblik?action=thirdparty-authorizations', {
        credentials: 'include'
      })
      
      if (response.status === 429) {
        // Rate limited by server
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
        rateLimiter.record429Error('eloverblik-auth', retryAfter)
        setError(`For mange forespørgsler. Systemet er midlertidigt overbelastet.`)
        setRateLimitRetryAfter(retryAfter)
        setIsAuthorized(false)
      } else if (response.status === 401) {
        // No valid session
        setError('Din session er udløbet. Log venligst ind igen.')
        setIsAuthorized(false)
      } else if (response.status === 403) {
        // Session exists but no authorization
        setError('Du har ikke givet tilladelse til at hente dine data.')
        setIsAuthorized(false)
      } else if (response.ok) {
        const data = await response.json()
        console.log('Authorization data:', data) // Debug log
        
        if (data.authorizations && data.authorizations.length > 0) {
          setIsAuthorized(true) // We have authorizations
          
          // Session-based auth returns only the user's data
          const auth = data.authorizations[0]
          
          if (auth) {
            console.log('Using authorization:', auth) // Debug log
            setCustomerData(auth)
            // Cache the authorization data
            setCachedAuth(auth)
            // Fetch consumption using explicit authorizationId and cached metering points when available
            await fetchConsumptionData({
              authorizationId: auth.authorizationId,
              customerCVR: auth.customerCVR,
              meteringPointIds: auth.meteringPointIds,
            })
          } else {
            setError('Din autorisation kunne ikke findes. Prøv at forbinde igen.')
            setIsAuthorized(false)
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

  const startAuthorization = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Initialize session
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (!sessionResponse.ok) {
        throw new Error('Kunne ikke starte session')
      }
      
      const sessionJson = await sessionResponse.json()
      const sessionId = sessionJson?.data?.sessionId ?? sessionJson?.sessionId
      console.log('Session created:', sessionId)
      
      // Get authorization URL
      const authResponse = await fetch('/api/auth/authorize', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (!authResponse.ok) {
        throw new Error('Kunne ikke starte autorisation')
      }
      
      const authJson = await authResponse.json()
      const authorizationUrl = authJson?.data?.authorizationUrl ?? authJson?.authorizationUrl
      console.log('Redirecting to Eloverblik:', authorizationUrl)
      
      // Redirect to Eloverblik
      window.location.href = authorizationUrl
    } catch (error) {
      console.error('Authorization start failed:', error)
      setError('Kunne ikke starte autorisation. Prøv igen senere.')
      setIsLoading(false)
    }
  }
  
  const fetchConsumptionDataInternal = async (params: { authorizationId?: string; customerCVR?: string; meteringPointIds?: string[] }) => {
    try {
      // Prevent double-fetching with proper state tracking
      if (fetchStateRef.current === 'fetching') {
        console.log('Already fetching consumption data, skipping...')
        return
      }
      
      if (isRequestInFlight) return
      
      // Check rate limit before making request
      const { allowed, retryAfter } = rateLimiter.canMakeRequest('eloverblik-consumption')
      if (!allowed) {
        setError(`For mange forespørgsler. Vent venligst ${retryAfter} sekunder før næste opdatering.`)
        setRateLimitRetryAfter(retryAfter || 30)
        return
      }
      
      fetchStateRef.current = 'fetching'
      setIsRequestInFlight(true)
      console.log('Fetching consumption with params:', params) // Debug log
      
      // Record the request
      rateLimiter.recordRequest('eloverblik-consumption')
      
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
      
      // Check cache first
      const cacheKey = `${params.authorizationId || params.customerCVR}_${dateFrom}_${dateTo}`
      const cached = getCachedData(cacheKey)
      if (cached) {
        console.log('Using cached consumption data')
        setConsumptionData(cached)
        fetchStateRef.current = 'complete'
        setIsRequestInFlight(false)
        return
      }
      
      console.log(`Requesting consumption data from ${dateFrom} to ${dateTo}`)
      
      const response = await fetch('/api/eloverblik?action=thirdparty-consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
      
      if (response.status === 429) {
        // Rate limited by server
        const retryAfter = parseInt(response.headers.get('Retry-After') || '30')
        rateLimiter.record429Error('eloverblik-consumption', retryAfter)
        setError(`For mange forespørgsler. Systemet er midlertidigt overbelastet.`)
        setRateLimitRetryAfter(retryAfter)
        
        // Try to show cached data if available
        const cached = getCachedData(cacheKey)
        if (cached) {
          console.log('Showing cached data due to rate limit')
          setConsumptionData(cached)
          setError(`For mange forespørgsler. Viser gemte data. Prøv igen om ${retryAfter} sekunder.`)
        }
        fetchStateRef.current = 'complete'
        setIsRequestInFlight(false)
        return
      } else if (response.status === 401) {
        // Session expired
        setError('Din session er udløbet. Log venligst ind igen.')
        fetchStateRef.current = 'complete'
        setIsRequestInFlight(false)
        return
      } else if (response.ok) {
        const data = await response.json()
        console.log('Consumption data received:', data) // Debug log
        setConsumptionData(data)
        
        // Cache the successful response
        setCachedData(cacheKey, data)
        
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
            const errorMsg = response.status === 429 
              ? 'For mange forespørgsler - systemet er midlertidigt overbelastet. Vent venligst 60 sekunder før du prøver igen.'
              : 'Eloverblik er midlertidigt utilgængelig. Vi viser gemte data hvor muligt. Prøv igen om 2 minutter.'
            
            // Try to show cached data if available during 429/503 errors
            const cached = getCachedData(cacheKey)
            if (cached) {
              console.log('Showing cached data due to API error')
              setConsumptionData(cached)
              setError(errorMsg + ' (Viser gemte data)')
            } else {
              setError(errorMsg)
            }
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
      fetchStateRef.current = 'complete'
      setIsRequestInFlight(false)
    }
  }
  
  // Create debounced version of fetchConsumptionData
  const fetchConsumptionData = useCallback(
    debounce(fetchConsumptionDataInternal, 1000),
    [customerData]
  )

  const handleConnect = () => {
    // Start secure session-based authorization
    startAuthorization()
  }

  const getAlignmentClass = () => {
    switch (headerAlignment) {
      case 'left': return 'text-left'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  // Auto-recovery error handler
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0)
  
  const handleErrorBoundaryReset = useCallback(() => {
    // Reset all state
    setIsAuthorized(false)
    setIsLoading(false)
    setCustomerData(null)
    setConsumptionData(null)
    setProcessedConsumptionData(null)
    setError(null)
    setIsRequestInFlight(false)
    setRateLimitRetryAfter(0)
    setErrorRetryCount(0)
    fetchStateRef.current = 'idle'
    
    // Clear rate limiter state
    rateLimiter.clearState('eloverblik-auth')
    rateLimiter.clearState('eloverblik-consumption')
    
    // Force remount by changing key
    setErrorBoundaryKey(prev => prev + 1)
  }, [])
  
  return (
    <ErrorBoundary
      key={errorBoundaryKey}
      level="component"
      fallback={
        <div className="w-full py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-orange-900 mb-2">Forbrug Tracker stødte på en fejl</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    Komponenten vil automatisk genstarte om et øjeblik...
                  </p>
                  <Button 
                    onClick={handleErrorBoundaryReset} 
                    variant="outline" 
                    size="sm"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Genstart nu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      onError={(error) => {
        // Log details for diagnostics without crashing other content
        console.error('ForbrugTracker error boundary caught:', error)
        
        // Auto-recover after 5 seconds
        setTimeout(() => {
          handleErrorBoundaryReset()
        }, 5000)
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
                <Alert variant={rateLimitRetryAfter > 0 ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{error}</p>
                      {rateLimitRetryAfter > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Automatisk retry om {rateLimitRetryAfter} sekunder...</span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button 
                    onClick={() => {
                      if (rateLimitRetryAfter === 0) {
                        checkAuthorization(null)
                      }
                    }}
                    variant="outline"
                    disabled={rateLimitRetryAfter > 0}
                  >
                    {rateLimitRetryAfter > 0 ? `Vent ${rateLimitRetryAfter}s` : 'Prøv igen'}
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
                            // Prevent rapid clicks/taps
                            if (isRequestInFlight || rateLimitRetryAfter > 0) {
                              return
                            }
                            
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
                          disabled={isRequestInFlight || rateLimitRetryAfter > 0}
                          title={rateLimitRetryAfter > 0 ? `Vent ${rateLimitRetryAfter} sekunder` : "Opdater data"}
                        >
                          <RefreshCw className={`h-4 w-4 ${isRequestInFlight ? 'animate-spin' : ''}`} />
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
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consumption">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Forbrug
                    </TabsTrigger>
                    <TabsTrigger value="costs">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Sammenlign & Spar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="consumption" className="mt-6">
                    <ImprovedConsumptionDashboard 
                      customerData={customerData}
                      onRefresh={() => checkAuthorization(null)}
                      onConsumptionDataChange={setProcessedConsumptionData}
                    />
                  </TabsContent>

                  <TabsContent value="costs" className="mt-6">
                    <TrueCostCalculator 
                      consumptionData={consumptionData}
                      processedData={processedConsumptionData}
                      customerData={customerData}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}