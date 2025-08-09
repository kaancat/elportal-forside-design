import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Link, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Zap,
  Copy,
  Mail
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Authorization {
  customerId: string
  customerName: string
  meteringPointIds: string[]
  validFrom: string
  validTo: string
  status: string
}

export function ThirdPartyFuldmagt() {
  const [authorizations, setAuthorizations] = useState<Authorization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // The fuldmagt link customers use to grant access
  // In production, this would be generated from ElOverblik's fuldmagt module
  const FULDMAGT_LINK = 'https://eloverblik.dk/authorization/thirdparty/mondaybrew'
  
  const fetchAuthorizations = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/eloverblik?action=thirdparty-authorizations')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch authorizations')
      }
      
      const data = await response.json()
      setAuthorizations(data.authorizations || [])
      
      if (data.authorizations.length === 0) {
        toast({
          title: 'Ingen fuldmagter',
          description: 'Ingen kunder har givet dig adgang endnu. Del fuldmagtslinket med dine kunder.',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authorizations')
      console.error('Authorization fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchAuthorizations()
  }, [])
  
  const copyFuldmagtLink = () => {
    navigator.clipboard.writeText(FULDMAGT_LINK)
    toast({
      title: 'Link kopieret!',
      description: 'Fuldmagtslinket er kopieret til udklipsholderen.',
    })
  }
  
  const sendFuldmagtEmail = () => {
    const subject = encodeURIComponent('Giv ElPortal adgang til dine eldata')
    const body = encodeURIComponent(`Hej,

For at vi kan vise dig dine faktiske elpriser baseret på dit forbrug, har vi brug for din tilladelse til at hente dine eldata.

Klik på linket nedenfor og log ind med MitID for at give os adgang:
${FULDMAGT_LINK}

Efter du har givet os adgang, kan du se:
- Dine faktiske elpriser time for time
- Præcis hvor meget du ville spare hos forskellige elleverandører
- Anbefalinger baseret på dit faktiske forbrug

Dine data er sikre og bruges kun til at beregne dine priser.

Med venlig hilsen,
ElPortal`)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="space-y-6">
      {/* Fuldmagt Link Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Del Fuldmagtslink med Kunder
          </CardTitle>
          <CardDescription>
            Send dette link til kunder, så de kan give ElPortal adgang til deres eldata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <code className="flex-1 p-3 bg-gray-100 rounded text-sm">
              {FULDMAGT_LINK}
            </code>
            <Button 
              onClick={copyFuldmagtLink}
              variant="outline"
              size="icon"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={sendFuldmagtEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Send via Email
            </Button>
            <Button 
              onClick={() => window.open(FULDMAGT_LINK, '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Test Link
            </Button>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sådan virker det</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Kunden klikker på linket</li>
                <li>Logger ind med MitID (privat eller erhverv)</li>
                <li>Godkender at ElPortal må se deres eldata</li>
                <li>Vi får automatisk adgang til deres forbrugsdata</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Active Authorizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aktive Kundefuldmagter
            <Badge variant="secondary">{authorizations.length}</Badge>
          </CardTitle>
          <CardDescription>
            Kunder der har givet ElPortal adgang til deres eldata
          </CardDescription>
          <Button 
            onClick={fetchAuthorizations}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Opdater
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fejl</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && !error && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Henter fuldmagter...</p>
            </div>
          )}
          
          {!isLoading && !error && authorizations.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Ingen aktive fuldmagter endnu</p>
              <p className="text-sm text-gray-500">
                Del fuldmagtslinket med dine kunder for at komme i gang
              </p>
            </div>
          )}
          
          {!isLoading && !error && authorizations.length > 0 && (
            <div className="space-y-3">
              {authorizations.map((auth) => (
                <div 
                  key={auth.customerId}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{auth.customerName}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Kunde ID: <code className="text-xs">{auth.customerId}</code></p>
                        <p>{auth.meteringPointIds.length} målerpunkt{auth.meteringPointIds.length > 1 ? 'er' : ''}</p>
                        <p>Gyldig fra: {new Date(auth.validFrom).toLocaleDateString('da-DK')}</p>
                        {auth.validTo && (
                          <p>Udløber: {new Date(auth.validTo).toLocaleDateString('da-DK')}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Here you would navigate to customer detail page
                        console.log('View customer:', auth.customerId)
                      }}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Se forbrug
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">
            Om Tredjepartsadgang
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2 text-sm">
          <p>
            Som godkendt tredjepart (mondaybrew ApS) har ElPortal ret til at:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Hente kunders elforbrugsdata med deres samtykke</li>
            <li>Vise faktiske priser baseret på reelt forbrug</li>
            <li>Lave præcise sammenligninger mellem elleverandører</li>
            <li>Give personlige anbefalinger</li>
          </ul>
          <p className="mt-3">
            Al dataadgang sker gennem sikre, krypterede forbindelser og i 
            overensstemmelse med GDPR og Energinets retningslinjer.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}