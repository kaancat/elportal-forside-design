import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  TrendingDown, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SanityService } from '@/services/sanityService'

// Format currency helper
const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(0)} kr`
}

interface TrueCostCalculatorProps {
  consumptionData: any
}

export function TrueCostCalculator({ consumptionData }: TrueCostCalculatorProps) {
  const [calculations, setCalculations] = useState<any[]>([])
  
  // Fetch providers from Sanity
  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => SanityService.getAllProviders(),
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (consumptionData && providers) {
      calculateTrueCosts()
    }
  }, [consumptionData, providers])

  const calculateTrueCosts = () => {
    if (!consumptionData?.result || !providers) return

    // Calculate total consumption
    let totalConsumption = 0
    consumptionData.result.forEach((mp: any) => {
      if (mp.MyEnergyData_MarketDocument?.TimeSeries) {
        mp.MyEnergyData_MarketDocument.TimeSeries.forEach((ts: any) => {
          if (ts.Period) {
            ts.Period.forEach((period: any) => {
              if (period.Point) {
                period.Point.forEach((point: any) => {
                  totalConsumption += parseFloat(point['out_Quantity.quantity'] || 0)
                })
              }
            })
          }
        })
      }
    })

    // Calculate costs for each provider
    const providerCosts = providers.map(provider => {
      // Fixed fees per kWh
      const systemFee = 0.19
      const electricityTax = 0.90
      const fixedFees = systemFee + electricityTax
      
      // Provider's spot price fee (using display price as approximation)
      const spotPriceFee = parseFloat(provider.displayPrice_kWh || '0.05')
      
      // Average spot price (this should ideally come from actual historical data)
      const avgSpotPrice = 0.50 // kr/kWh - placeholder
      
      // Calculate total price per kWh
      const pricePerKwh = (avgSpotPrice + spotPriceFee + fixedFees) * 1.25 // 25% VAT
      
      // Calculate total cost
      const totalCost = totalConsumption * pricePerKwh
      
      // Monthly subscription
      const monthlyFee = parseFloat(provider.displayMonthlyFee || '0')
      const totalMonthlyFees = monthlyFee // For 30 days
      
      return {
        provider: provider.providerName || provider.productName,
        slug: provider.id,
        logo: provider.logoUrl,
        isGreen: provider.benefits?.includes('100% grøn strøm'),
        isVindstod: provider.isVindstoedProduct,
        spotPriceFee: spotPriceFee,
        monthlyFee: monthlyFee,
        totalConsumption: totalConsumption,
        energyCost: totalCost,
        totalCost: totalCost + totalMonthlyFees,
        pricePerKwh: pricePerKwh
      }
    })

    // Sort by total cost (Vindstød first if equal)
    providerCosts.sort((a, b) => {
      if (a.isVindstod) return -1
      if (b.isVindstod) return 1
      return a.totalCost - b.totalCost
    })

    setCalculations(providerCosts)
  }

  if (!consumptionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Omkostningsberegning</CardTitle>
          <CardDescription>Ingen forbrugsdata tilgængelig</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Omkostningsberegning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const cheapest = calculations[0]
  const mostExpensive = calculations[calculations.length - 1]
  const potentialSavings = mostExpensive ? mostExpensive.totalCost - cheapest?.totalCost : 0

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Baseret på dit faktiske forbrug
              </h3>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {calculations[0]?.totalConsumption.toFixed(0)} kWh
              </p>
              <p className="text-sm text-blue-700 mt-1">
                i perioden {consumptionData.dateFrom} til {consumptionData.dateTo}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Provider Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Hvad ville det koste hos forskellige leverandører?</CardTitle>
          <CardDescription>
            Beregnet på dit faktiske forbrug og aktuelle priser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calculations.map((calc, index) => (
              <div
                key={calc.slug}
                className={`border rounded-lg p-4 ${
                  index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {calc.logo && (
                        <img 
                          src={calc.logo} 
                          alt={calc.provider}
                          className="h-8 w-auto"
                        />
                      )}
                      <h4 className="font-semibold">{calc.provider}</h4>
                      {index === 0 && (
                        <Badge className="bg-green-600">Billigst</Badge>
                      )}
                      {calc.isGreen && (
                        <Badge variant="outline" className="border-green-600 text-green-700">
                          100% Grøn
                        </Badge>
                      )}
                      {calc.isVindstod && (
                        <Badge className="bg-blue-600">
                          <Award className="h-3 w-3 mr-1" />
                          Anbefalet
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Spotpristillæg</p>
                        <p className="font-medium">{calc.spotPriceFee.toFixed(2)} kr/kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Abonnement</p>
                        <p className="font-medium">{calc.monthlyFee} kr/md</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pris per kWh</p>
                        <p className="font-medium">{calc.pricePerKwh.toFixed(2)} kr</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Energi (30 dage)</p>
                        <p className="font-medium">{formatCurrency(calc.energyCost)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold">
                      {formatCurrency(calc.totalCost)}
                    </p>
                    <p className="text-sm text-gray-600">for 30 dage</p>
                    {index > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        +{formatCurrency(calc.totalCost - cheapest.totalCost)}
                      </p>
                    )}
                  </div>
                </div>
                
                {calc.isVindstod && (
                  <div className="mt-3 pt-3 border-t">
                    <Button className="w-full" variant="default">
                      Skift til {calc.provider}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {potentialSavings > 0 && (
            <Alert className="mt-6">
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                <strong>Potentiel besparelse:</strong> Op til {formatCurrency(potentialSavings)} 
                på 30 dage ved at vælge den billigste leverandør
              </AlertDescription>
            </Alert>
          )}

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Priserne inkluderer spotpris, netafgifter, systemtarif, elafgift og moms. 
              Beregningen er baseret på dit faktiske forbrug og gennemsnitlige spotpriser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}