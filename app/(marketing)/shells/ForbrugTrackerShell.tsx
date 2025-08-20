/**
 * SSR Shell for ForbrugTracker Component
 * Provides static content during SSR for SEO while maintaining structure
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Shield,
  BarChart3,
  Calculator,
  TrendingUp,
  ChevronRight,
  Clock,
  User,
  Home
} from 'lucide-react'

interface ForbrugTrackerShellProps {
  title?: string
  description?: string
  connectButtonText?: string
  showBenefits?: boolean
  headerAlignment?: 'left' | 'center' | 'right'
}

export function ForbrugTrackerShell({
  title = 'Start Din Forbrug Tracker',
  description = 'Forbind med Eloverblik for at se dine personlige forbrugsdata',
  connectButtonText = 'Forbind med Eloverblik',
  showBenefits = true,
  headerAlignment = 'center'
}: ForbrugTrackerShellProps) {
  
  const getAlignmentClass = () => {
    switch (headerAlignment) {
      case 'left': return 'text-left'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className={`mb-8 ${getAlignmentClass()}`}>
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          {description && (
            <p className="text-gray-600 text-lg">{description}</p>
          )}
        </div>

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
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              disabled
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

        {/* Sample Data Display (hidden but SEO-friendly) */}
        <div className="mt-12 space-y-6 opacity-0 h-0 overflow-hidden" aria-hidden="true">
          <div className="prose max-w-none">
            <h3>Hvad er Forbrug Tracker?</h3>
            <p>
              Forbrug Tracker er en sikker integration med Eloverblik, der giver dig mulighed for at se dit faktiske 
              elforbrug direkte i DinElPortal. Ved at forbinde via MitID kan du få adgang til:
            </p>
            <ul>
              <li>Time-for-time forbrugsdata for de seneste 30 dage</li>
              <li>Præcise omkostningsberegninger baseret på aktuelle elpriser</li>
              <li>Sammenligning med gennemsnitligt forbrug i din region</li>
              <li>Personlige anbefalinger til at reducere dit elforbrug</li>
            </ul>
            
            <h3>Sådan fungerer det</h3>
            <ol>
              <li>Klik på "Forbind med Eloverblik" knappen</li>
              <li>Log ind med dit MitID</li>
              <li>Giv tilladelse til at hente dine forbrugsdata</li>
              <li>Se dine data direkte i DinElPortal</li>
            </ol>
            
            <h3>Sikkerhed og privatliv</h3>
            <p>
              Vi tager din sikkerhed og privatliv alvorligt. Forbindelsen til Eloverblik sker gennem en sikker, 
              krypteret forbindelse, og vi gemmer aldrig dine personlige data. Alle data hentes direkte fra 
              Eloverblik og vises kun til dig i din browser.
            </p>
            
            <h3>Fordele ved at bruge Forbrug Tracker</h3>
            <p>
              Med Forbrug Tracker får du et komplet overblik over dit elforbrug og kan identificere 
              besparelsesmuligheder. Du kan se:
            </p>
            <ul>
              <li>Hvornår på dagen du bruger mest strøm</li>
              <li>Hvordan dit forbrug varierer fra dag til dag</li>
              <li>Hvor meget du kan spare ved at skifte eludbyder</li>
              <li>Tips til at reducere dit forbrug uden at gå på kompromis med komfort</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}