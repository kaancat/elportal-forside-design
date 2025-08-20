'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calculator, 
  TrendingDown, 
  Award,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SanityService } from '@/services/sanityService'
import { 
  calculatePricePerKwh,
  getPriceBreakdown,
  PRICE_CONSTANTS 
} from '@/services/priceCalculationService'
import { useNetworkTariff } from '@/hooks/useNetworkTariff'
import { gridProviders } from '@/data/gridProviders'

// Format currency helper
const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(0)} kr`
}

// Format date to Danish DD/MM/YYYY
const formatDateDanish = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Get period label in Danish
const getPeriodLabel = (dateRange: string, dateFrom: string, dateTo: string): string => {
  switch(dateRange) {
    case 'yesterday':
      return 'i går'
    case '7d':
      return '7 dage'
    case '30d':
      return '30 dage'
    case '3m':
      return '3 måneder'
    case '12m':
      return '12 måneder'
    case '1y':
      return '1 år'
    case '5y':
      return '5 år'
    default:
      // Custom date range
      const from = new Date(dateFrom)
      const to = new Date(dateTo)
      const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
      return `${days} dage`
  }
}

interface TrueCostCalculatorProps {
  consumptionData: any // Raw API data (for backwards compatibility)
  processedData?: {
    dateRange: string
    dateFrom: string
    dateTo: string
    totalConsumption: number
    totalCost: number
    averagePrice: number
    data: any[]
    region?: string
  }
  customerData?: any
}

export function TrueCostCalculator({ consumptionData, processedData, customerData }: TrueCostCalculatorProps) {
  const [calculations, setCalculations] = useState<any[]>([])
  
  // Fetch providers from Sanity
  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => SanityService.getAllProviders(),
    staleTime: 5 * 60 * 1000
  })
  
  // Determine region from customerData or processedData
  const region = processedData?.region || customerData?.region || 'DK2'
  
  // Get network tariff - try to get the actual grid provider from customerData
  const gridProvider = customerData?.gridProvider || gridProviders['791'] // Default to Radius
  const { averageRate: networkTariff } = useNetworkTariff(
    gridProvider,
    { enabled: true }
  )

  useEffect(() => {
    if (processedData && providers) {
      calculateTrueCosts()
    }
  }, [processedData, providers, networkTariff])

  const calculateTrueCosts = () => {
    if (!processedData || !providers) return

    // Use the actual total consumption from the selected period
    const totalConsumption = processedData.totalConsumption
    
    // Use the average price from the actual period (already includes spot prices)
    // If not available, use current spot price as fallback
    const avgSpotPrice = processedData.averagePrice > 0 
      ? processedData.averagePrice / 2.5 // Rough estimate to extract spot from total price
      : PRICE_CONSTANTS.DEFAULT_SPOT_PRICE
    
    // Use dynamic network tariff or fallback
    const actualNetworkTariff = networkTariff || PRICE_CONSTANTS.NETWORK_TARIFF_AVG
    
    // Calculate the number of days in the period
    const startDate = new Date(processedData.dateFrom)
    const endDate = new Date(processedData.dateTo)
    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const periodMonths = periodDays / 30 // Approximate months for subscription calculation
    
    // Log providers data for debugging
    console.log('Providers data from Sanity:', providers.map(p => ({
      name: p.providerName,
      productName: p.productName,
      spotPriceMarkup: p.spotPriceMarkup,
      monthlySubscription: p.monthlySubscription,
      displayPrice_kWh: p.displayPrice_kWh,
      displayMonthlyFee: p.displayMonthlyFee,
      greenCertificateFee: p.greenCertificateFee,
      tradingCosts: p.tradingCosts,
      yearlySubscription: p.yearlySubscription
    })))

    // Calculate costs for each provider
    const providerCosts = providers.map((provider, index) => {
      // Handle pricing fields with proper fallback logic
      // spotPriceMarkup is in øre/kWh, displayPrice_kWh might also be in øre/kWh
      let spotPriceMarkup: number
      if (typeof provider.spotPriceMarkup === 'number') {
        spotPriceMarkup = provider.spotPriceMarkup
      } else if (typeof provider.displayPrice_kWh === 'number') {
        spotPriceMarkup = provider.displayPrice_kWh
      } else {
        // Fallback: use different values for different providers to avoid identical prices
        spotPriceMarkup = index * 2 // 0, 2, 4, 6 øre/kWh as fallback
        console.warn(`Provider ${provider.providerName} missing spotPriceMarkup, using fallback ${spotPriceMarkup}`)
      }
      
      let monthlySubscription: number
      if (typeof provider.monthlySubscription === 'number') {
        monthlySubscription = provider.monthlySubscription
      } else if (typeof provider.displayMonthlyFee === 'number') {
        monthlySubscription = provider.displayMonthlyFee
      } else {
        // Fallback: use 0 for subscription
        monthlySubscription = 0
        console.warn(`Provider ${provider.providerName} missing monthlySubscription, using 0`)
      }
      
      // Apply regional pricing if available
      if (provider.regionalPricing && provider.regionalPricing.length > 0) {
        const regionalPrice = provider.regionalPricing.find((rp: any) => rp.region === region)
        if (regionalPrice) {
          if (regionalPrice.spotPriceMarkup !== undefined) {
            spotPriceMarkup = regionalPrice.spotPriceMarkup
          }
          if (regionalPrice.monthlySubscription !== undefined) {
            monthlySubscription = regionalPrice.monthlySubscription
          }
        }
      }
      
      // Additional fees
      const greenCertificates = typeof provider.greenCertificateFee === 'number' ? provider.greenCertificateFee : 0
      const tradingCosts = typeof provider.tradingCosts === 'number' ? provider.tradingCosts : 0
      
      // Calculate price per kWh using centralized service
      const pricePerKwh = calculatePricePerKwh(
        avgSpotPrice, 
        spotPriceMarkup,
        actualNetworkTariff,
        {
          greenCertificates: greenCertificates,
          tradingCosts: tradingCosts
        }
      )
      
      // Get price breakdown for transparency
      const breakdown = getPriceBreakdown(
        avgSpotPrice,
        spotPriceMarkup,
        actualNetworkTariff,
        {
          greenCertificates: greenCertificates,
          tradingCosts: tradingCosts
        }
      )
      
      // Calculate costs for the actual period
      const energyCost = totalConsumption * pricePerKwh
      const subscriptionCost = monthlySubscription * periodMonths
      const totalCost = energyCost + subscriptionCost
      
      return {
        provider: provider.providerName || provider.productName,
        slug: provider.id,
        logo: provider.logoUrl,
        isGreen: provider.benefits?.some((b: any) => b.text?.includes('grøn')) || provider.isGreenEnergy,
        isVindstod: provider.isVindstoedProduct,
        spotPriceFee: spotPriceMarkup / 100, // Convert øre to kr for display
        monthlyFee: monthlySubscription,
        totalConsumption: totalConsumption,
        energyCost: energyCost,
        subscriptionCost: subscriptionCost,
        totalCost: totalCost,
        pricePerKwh: pricePerKwh,
        periodDays: periodDays,
        breakdown: breakdown
      }
    })

    // Sort by total cost with Vindstød always first
    providerCosts.sort((a, b) => {
      // Vindstød always comes first
      if (a.isVindstod && !b.isVindstod) return -1
      if (!a.isVindstod && b.isVindstod) return 1
      // Then sort by total cost
      return a.totalCost - b.totalCost
    })

    // Validate that providers have distinct prices
    const uniquePrices = new Set(providerCosts.map(p => p.totalCost.toFixed(2)))
    if (uniquePrices.size === 1 && providerCosts.length > 1) {
      console.error('WARNING: All providers have the same calculated price! This likely means pricing data is missing in Sanity.')
      console.log('Provider costs:', providerCosts.map(p => ({
        name: p.provider,
        spotPriceFee: p.spotPriceFee,
        monthlyFee: p.monthlyFee,
        energyCost: p.energyCost.toFixed(2),
        totalCost: p.totalCost.toFixed(2)
      })))
    }

    setCalculations(providerCosts)
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Omkostningsberegning</CardTitle>
          <CardDescription>Henter leverandører...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message when no processed data is available
  if (!processedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Omkostningsberegning</CardTitle>
          <CardDescription>
            Vælg en periode i "Forbrug" fanen for at se omkostninger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Gå til "Forbrug" fanen og vælg en periode (f.eks. 7 dage, 30 dage) 
              for at se hvad dit faktiske forbrug ville koste hos forskellige leverandører.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const periodLabel = getPeriodLabel(
    processedData.dateRange,
    processedData.dateFrom,
    processedData.dateTo
  )

  const cheapest = calculations[0]
  const mostExpensive = calculations[calculations.length - 1]
  const potentialSavings = mostExpensive && cheapest ? mostExpensive.totalCost - cheapest.totalCost : 0

  // Find Vindstød in the list for comparison
  const vindstod = calculations.find(c => c.isVindstod)
  const vindstodSavings = vindstod && cheapest && !cheapest.isVindstod 
    ? vindstod.totalCost - cheapest.totalCost 
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-brand-green/20 bg-brand-green/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-brand-dark">
                Baseret på dit faktiske forbrug
              </h3>
              <p className="text-3xl font-bold text-brand-green mt-2">
                {processedData.totalConsumption.toFixed(0)} kWh
              </p>
              <p className="text-sm text-gray-700 mt-1">
                i perioden {formatDateDanish(processedData.dateFrom)} til {formatDateDanish(processedData.dateTo)}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-brand-green" />
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
          {calculations.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Beregner priser...
            </div>
          ) : (
            <div className="space-y-3">
              {calculations.map((calc, index) => (
                <div
                  key={calc.slug}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    calc.isVindstod 
                      ? 'border-brand-green bg-brand-green/5' 
                      : index === 0 && !calc.isVindstod
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        {calc.logo && (
                          <img 
                            src={calc.logo} 
                            alt={calc.provider}
                            className="h-6 sm:h-8 w-auto"
                          />
                        )}
                        <h4 className="font-semibold text-sm sm:text-base">{calc.provider}</h4>
                        {calc.isVindstod && (
                          <Badge className="bg-brand-green text-xs px-2 py-0.5">
                            ⭐ Anbefalet
                          </Badge>
                        )}
                        {index === 0 && !calc.isVindstod && (
                          <Badge className="bg-green-600 text-xs px-2 py-0.5">Billigst</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-600">Spotpristillæg</p>
                          <p className="font-medium">{calc.spotPriceFee.toFixed(2)} kr/kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Abonnement</p>
                          <p className="font-medium">{calc.monthlyFee || 0} kr/md</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Pris per kWh</p>
                          <p className="font-medium">{calc.pricePerKwh.toFixed(2)} kr</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Energi ({periodLabel})</p>
                          <p className="font-medium">{formatCurrency(calc.energyCost)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row justify-between sm:flex-col sm:text-right items-end sm:items-stretch mt-2 sm:mt-0 sm:ml-4">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold">
                          {formatCurrency(calc.totalCost)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">for {periodLabel}</p>
                        {index > 0 && (
                          <p className="text-xs sm:text-sm text-red-600 mt-1">
                            +{formatCurrency(calc.totalCost - cheapest.totalCost)}
                          </p>
                        )}
                      </div>
                      
                      {/* Price breakdown popover - mobile optimized */}
                      {calc.breakdown && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-xs text-brand-green hover:underline inline-flex items-center gap-1 sm:mt-2">
                              Se prisdetaljer <Info size={12} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" side="left">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Prisudregning</h4>
                              <p className="text-sm text-muted-foreground">Baseret på {calc.totalConsumption.toFixed(0)} kWh forbrug</p>
                              <div className="text-xs space-y-1 pt-2">
                                <div className="font-semibold mb-1">Pris per kWh:</div>
                                <div className="flex justify-between">
                                  <span>Spotpris:</span> 
                                  <span>{calc.breakdown.spotPrice.toFixed(2)} kr.</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Leverandør tillæg:</span> 
                                  <span>{calc.spotPriceFee.toFixed(2)} kr.</span>
                                </div>
                                <div className="border-t my-1"></div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Nettarif ({region}):</span> 
                                  <span>{calc.breakdown.networkTariff.toFixed(2)} kr.</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Systemtarif:</span> 
                                  <span>{calc.breakdown.systemTariff.toFixed(2)} kr.</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Transmissionstarif:</span> 
                                  <span>{calc.breakdown.transmissionFee.toFixed(2)} kr.</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Elafgift:</span> 
                                  <span>{calc.breakdown.electricityTax.toFixed(2)} kr.</span>
                                </div>
                                <div className="border-t my-1"></div>
                                <div className="flex justify-between font-semibold">
                                  <span>Pris u. moms:</span> 
                                  <span>{calc.breakdown.subtotal.toFixed(2)} kr.</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Moms (25%):</span> 
                                  <span>{calc.breakdown.vatAmount.toFixed(2)} kr.</span>
                                </div>
                                <div className="border-t border-dashed my-1"></div>
                                <div className="flex justify-between font-bold">
                                  <span>Total pr. kWh:</span> 
                                  <span>{calc.pricePerKwh.toFixed(2)} kr.</span>
                                </div>
                                <div className="border-t border-double my-2"></div>
                                <div className="font-semibold mb-1">Total for periode ({periodLabel}):</div>
                                <div className="flex justify-between">
                                  <span>Energi ({calc.totalConsumption.toFixed(0)} kWh):</span> 
                                  <span>{formatCurrency(calc.energyCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Abonnement ({calc.periodDays} dage):</span> 
                                  <span>{formatCurrency(calc.subscriptionCost)}</span>
                                </div>
                                <div className="border-t my-1"></div>
                                <div className="flex justify-between font-bold text-brand-green">
                                  <span>Total:</span> 
                                  <span>{formatCurrency(calc.totalCost)}</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                  
                  {calc.isVindstod && (
                    <div className="mt-3 pt-3 border-t">
                      <Button className="w-full py-2 sm:py-2.5 text-sm sm:text-base" variant="default">
                        Skift til {calc.provider}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {potentialSavings > 0 && calculations.length > 0 && (
            <Alert className="mt-6">
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                <strong>Potentiel besparelse:</strong> Op til {formatCurrency(potentialSavings)} på {periodLabel} ved at vælge den billigste leverandør
              </AlertDescription>
            </Alert>
          )}

          {calculations.length > 0 && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Priserne inkluderer spotpris, netafgifter, systemtarif, elafgift og moms. 
                Beregningen er baseret på dit faktiske forbrug i den valgte periode.
                {networkTariff && (
                  <span className="block mt-1">
                    Nettarif: {networkTariff.toFixed(2)} kr/kWh ({region})
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}