import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Info, Lock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getMeteringPoints } from '@/services/eloverblik'

interface ConnectEloverblikProps {
  onConnect: (refreshToken: string, meteringPoints: any[]) => void
}

export function ConnectEloverblik({ onConnect }: ConnectEloverblikProps) {
  const [refreshToken, setRefreshToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [meteringPoints, setMeteringPoints] = useState<any[]>([])

  const handleConnect = async () => {
    if (!refreshToken.trim()) {
      setError('Indtast venligst din datadelingstoken')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Get metering points to verify the token works
      const result = await getMeteringPoints(refreshToken)
      
      if (result.meteringPoints && result.meteringPoints.length > 0) {
        setMeteringPoints(result.meteringPoints)
        setSuccess(true)
        onConnect(refreshToken, result.meteringPoints)
      } else {
        setError('Ingen målerpunkter fundet på din konto')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke oprette forbindelse')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Forbind til Eloverblik
          </CardTitle>
          <CardDescription>
            Se dine faktiske elpriser baseret på dit reelle forbrug
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Sådan får du din datadelingstoken</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Gå til <a href="https://eloverblik.dk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  eloverblik.dk <ExternalLink className="h-3 w-3" />
                </a></li>
                <li>Log ind som "Privat" med MitID</li>
                <li>Naviger til "Min profil" → "Datadeling"</li>
                <li>Opret en ny token og kopier den</li>
                <li>Indsæt token herunder</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Token Input */}
          <div className="space-y-2">
            <label htmlFor="refresh-token" className="text-sm font-medium">
              Datadelingstoken
            </label>
            <div className="flex gap-2">
              <Input
                id="refresh-token"
                type="password"
                placeholder="Indsæt din token fra Eloverblik"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                disabled={isLoading || success}
                className="font-mono"
              />
              <Button 
                onClick={handleConnect} 
                disabled={isLoading || success || !refreshToken.trim()}
              >
                {isLoading ? 'Forbinder...' : success ? 'Forbundet' : 'Forbind'}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fejl</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && meteringPoints.length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Forbindelse oprettet!</AlertTitle>
              <AlertDescription className="text-green-700">
                <div className="mt-2 space-y-2">
                  <p>Fandt {meteringPoints.length} målerpunkt{meteringPoints.length > 1 ? 'er' : ''}:</p>
                  <ul className="text-sm space-y-1">
                    {meteringPoints.map((mp) => (
                      <li key={mp.meteringPointId} className="flex items-center gap-2">
                        <span className="font-mono text-xs">{mp.meteringPointId}</span>
                        <span className="text-gray-600">
                          {mp.streetName} {mp.buildingNumber}, {mp.postcode} {mp.cityName}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Privacy Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Din data er sikker</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              <ul className="mt-1 space-y-1">
                <li>• Vi gemmer aldrig din token eller forbrugsdata</li>
                <li>• Data hentes kun når du beder om det</li>
                <li>• Forbindelsen udløber automatisk efter 30 minutter</li>
                <li>• Alt foregår sikkert gennem krypterede forbindelser</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}