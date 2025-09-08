/**
 * SSR Shell for ApplianceCalculator Component
 * Provides static content during SSR for SEO while maintaining structure
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Plus, 
  Calculator,
  Lightbulb,
  Coffee,
  Tv,
  ChefHat,
  Shirt,
  BarChart3
} from 'lucide-react'

interface ApplianceCalculatorShellProps {
  block?: {
    title?: string
    subtitle?: string
    defaultElectricityPrice?: number
  }
}

export function ApplianceCalculatorShell({ block }: ApplianceCalculatorShellProps) {
  const electricityPrice = block?.defaultElectricityPrice || 3.21

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Interaktiv beregner
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Beregn dit strømforbrug
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tilføj dine apparater og se præcis hvor meget strøm du bruger - 
            og hvor meget det koster dig hver måned.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Appliance List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Appliance Button */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent className="p-6">
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Tilføj apparat
                </Button>
              </CardContent>
            </Card>

            {/* Sample Appliance Cards */}
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Eksempel apparater
              </div>
              
              {/* Sample Appliance 1 */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Coffee className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Kaffemaskine</h3>
                        <p className="text-sm text-gray-600 mt-1">1000W • 15 minutter/dag</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Dagligt: <strong className="text-gray-900">0.25 kWh</strong></span>
                          <span className="text-gray-500">Månedligt: <strong className="text-gray-900">7.5 kWh</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">24 kr</div>
                      <div className="text-sm text-gray-600">pr. måned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Appliance 2 */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Tv className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Smart TV 55"</h3>
                        <p className="text-sm text-gray-600 mt-1">100W • 4 timer/dag</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Dagligt: <strong className="text-gray-900">0.4 kWh</strong></span>
                          <span className="text-gray-500">Månedligt: <strong className="text-gray-900">12 kWh</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">39 kr</div>
                      <div className="text-sm text-gray-600">pr. måned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Appliance 3 */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shirt className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Vaskemaskine A+++</h3>
                        <p className="text-sm text-gray-600 mt-1">2000W • 3 vask/uge</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Pr. vask: <strong className="text-gray-900">1.5 kWh</strong></span>
                          <span className="text-gray-500">Månedligt: <strong className="text-gray-900">19.5 kWh</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">63 kr</div>
                      <div className="text-sm text-gray-600">pr. måned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="bg-gradient-to-br from-blue-50 to-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Dit Forbrug
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total Consumption */}
                <div className="text-center py-4 bg-white rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Månedligt forbrug</div>
                  <div className="text-4xl font-bold text-gray-900">39 kWh</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Baseret på {electricityPrice} kr/kWh
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Dagligt</span>
                    <span className="font-bold text-gray-900">4.20 kr</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Månedligt</span>
                    <span className="font-bold text-gray-900">126 kr</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-green-500">
                    <span className="text-gray-600">Årligt</span>
                    <span className="font-bold text-green-600 text-xl">1,512 kr</span>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm">Forbrug pr. kategori</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Køkken</span>
                      </div>
                      <span className="font-medium">31%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600">Underholdning</span>
                      </div>
                      <span className="font-medium">31%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Rengøring</span>
                      </div>
                      <span className="font-medium">38%</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Se besparelsesmuligheder
                </Button>

                {/* Energy Tip */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900 mb-1">Energitip</p>
                      <p className="text-yellow-800">
                        Vask ved 30°C i stedet for 60°C og spar 40% energi på hver vask.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}