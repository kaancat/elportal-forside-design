/**
 * SSR Shell for DeclarationGridmix Component
 * Provides static content during SSR for SEO while maintaining structure
 */

import { Card } from '@/components/ui/card'
import { Zap, Leaf, AlertCircle, Calendar } from 'lucide-react'

interface DeclarationGridmixShellProps {
  title?: string
  subtitle?: string
  headerAlignment?: 'left' | 'center' | 'right'
}

export function DeclarationGridmixShell({ 
  title = 'Grøn Strøm i Dit Område',
  subtitle = 'Se hvor meget af din strøm der kommer fra vedvarende energikilder',
  headerAlignment = 'left'
}: DeclarationGridmixShellProps) {
  
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

      {/* Main Card */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-[400px] bg-gradient-to-t from-green-50 via-yellow-50 to-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <Zap className="w-12 h-12 text-green-600 mx-auto" />
                <Leaf className="w-6 h-6 text-green-500 absolute -bottom-1 -right-1" />
              </div>
              <p className="text-gray-600 font-medium mt-3">Indlæser energimiks data...</p>
              <p className="text-sm text-gray-500 mt-2">Beregner grøn andel</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Grøn Energi</span>
              </div>
              <div className="text-xl font-bold text-green-900">--%</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Fossil Energi</span>
              </div>
              <div className="text-xl font-bold text-gray-900">--%</div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Import/Export</span>
              </div>
              <div className="text-xl font-bold text-blue-900">-- GWh</div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Periode</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">30 dage</div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">100% Grøn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span className="text-sm text-gray-600">75-99% Grøn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">50-74% Grøn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">25-49% Grøn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">&lt;25% Grøn</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Om Energimikset</h3>
            <p className="text-sm text-blue-800">
              Energimikset viser hvor din strøm kommer fra time for time. Andelen af grøn energi 
              varierer gennem døgnet og året, afhængigt af vind- og solforhold samt elforbrug.
            </p>
          </div>
        </div>
      </Card>

      {/* SEO Content */}
      <div className="prose max-w-none opacity-0 h-0 overflow-hidden" aria-hidden="true">
        <h3>Grøn Strøm og Energimiks i Danmark</h3>
        <p>
          Danmarks elmiks består af en kombination af vedvarende energikilder og fossile brændsler. 
          Andelen af grøn strøm varierer konstant baseret på vejrforhold og forbrug.
        </p>
        <p>
          Når vinden blæser kraftigt, kan Danmark producere over 100% grøn strøm og eksportere 
          overskuddet til nabolande. I vindstille perioder suppleres med fossile brændsler og import.
        </p>
        <h4>Energikilder i Danmarks Elmiks</h4>
        <ul>
          <li>Vindkraft: 50-80% på vindfulde dage</li>
          <li>Solenergi: Op til 20% midt på sommerdage</li>
          <li>Biomasse: Stabil produktion året rundt</li>
          <li>Naturgas: Backup når vedvarende kilder ikke rækker</li>
          <li>Import/Export: Balancerer nettet med nabolande</li>
        </ul>
        <p>
          Ved at følge energimikset kan du time dit forbrug til perioder med høj grøn andel 
          og dermed reducere dit CO2-aftryk.
        </p>
      </div>
    </div>
  )
}