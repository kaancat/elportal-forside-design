/**
 * SSR Shell for ConsumptionMap Component
 * Provides static content during SSR for SEO while maintaining structure
 */

import { Card } from '@/components/ui/card'
import { MapPin, Zap, TrendingUp } from 'lucide-react'

interface ConsumptionMapShellProps {
  block?: {
    title?: string
    description?: string
    headerAlignment?: 'left' | 'center' | 'right'
  }
}

export function ConsumptionMapShell({ block }: ConsumptionMapShellProps) {
  const title = block?.title || 'Elforbrug pr. Region'
  const description = block?.description || 'Se det gennemsnitlige elforbrug i forskellige danske regioner'
  const alignment = block?.headerAlignment || 'center'
  
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left': return 'text-left'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  return (
    <div className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`mb-8 ${getAlignmentClass()}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          {description && (
            <p className="text-lg text-gray-600">{description}</p>
          )}
        </div>

        {/* Map Container */}
        <div className="max-w-6xl mx-auto">
          <Card className="relative overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 min-h-[500px] flex flex-col items-center justify-center">
              {/* Loading Placeholder */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Danmarks Forbrugskort
                </h3>
                <p className="text-gray-600 max-w-md">
                  Interaktivt kort viser elforbrug og priser på tværs af danske regioner
                </p>
                
                {/* Sample Region Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Østdanmark (DK2)</span>
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Gns. forbrug:</span>
                        <span className="font-medium">-- kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aktuel pris:</span>
                        <span className="font-medium">-- kr/kWh</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Vestdanmark (DK1)</span>
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Gns. forbrug:</span>
                        <span className="font-medium">-- kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aktuel pris:</span>
                        <span className="font-medium">-- kr/kWh</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Lavt forbrug</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Middel forbrug</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Højt forbrug</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Regional Data</h4>
                  <p className="text-sm text-blue-700">Live opdatering hver time</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Prisforskelle</h4>
                  <p className="text-sm text-green-700">Se besparelser pr. område</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Forbrugstrends</h4>
                  <p className="text-sm text-purple-700">Historiske mønstre</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}