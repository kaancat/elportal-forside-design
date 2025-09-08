/**
 * SSR Shell for DeclarationProductionChart Component
 * Provides static content during SSR for SEO while maintaining structure
 */

import { Card } from '@/components/ui/card'
import { Wind, Sun, Flame, Leaf, Activity } from 'lucide-react'

interface DeclarationProductionShellProps {
  title?: string
  subtitle?: string
  headerAlignment?: 'left' | 'center' | 'right'
}

export function DeclarationProductionShell({ 
  title = 'Dansk Elproduktion - Vedvarende Energi vs. Fossile Brændsler',
  subtitle = 'Se hvordan Danmarks elproduktion fordeler sig mellem grønne og fossile energikilder',
  headerAlignment = 'left'
}: DeclarationProductionShellProps) {
  
  const getAlignmentClass = () => {
    switch (headerAlignment) {
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className={getAlignmentClass()}>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Chart Container */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Controls Skeleton */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-[400px] bg-gradient-to-b from-green-50 to-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Indlæser produktionsdata...</p>
              <p className="text-sm text-gray-500 mt-2">Viser fordeling mellem energikilder</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Vindkraft</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Solenergi</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Biomasse</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Fossile brændsler</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Vedvarende Energi</span>
              </div>
              <div className="text-2xl font-bold text-green-900">--%</div>
              <div className="text-sm text-green-700">Gennemsnit sidste 30 dage</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Vindkraft</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">-- GWh</div>
              <div className="text-sm text-blue-700">Total produktion</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Solenergi</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">-- GWh</div>
              <div className="text-sm text-yellow-700">Total produktion</div>
            </div>
          </div>
        </div>
      </Card>

      {/* SEO Content */}
      <div className="prose max-w-none opacity-0 h-0 overflow-hidden" aria-hidden="true">
        <h3>Danmarks Elproduktion og Energimiks</h3>
        <p>
          Danmark er førende inden for vedvarende energi, med vindkraft som den primære grønne energikilde. 
          Vindmøller producerer nu over halvdelen af Danmarks elektricitet, suppleret af solenergi og biomasse.
        </p>
        <p>
          Den danske elproduktion varierer gennem året, med højest vindproduktion i vinterhalvåret og 
          mest solenergi om sommeren. Fossile brændsler bruges primært som backup når vedvarende kilder 
          ikke kan dække behovet.
        </p>
        <ul>
          <li>Vindkraft: Danmarks største vedvarende energikilde</li>
          <li>Solenergi: Voksende bidrag til energimikset</li>
          <li>Biomasse: Stabil grundlast fra bæredygtige kilder</li>
          <li>Fossile brændsler: Reduceres gradvist mod 2030</li>
        </ul>
      </div>
    </div>
  )
}