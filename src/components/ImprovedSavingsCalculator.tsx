import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Info, TrendingDown, MapPin } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EnergySavingTip {
  _id: string
  title: string
  category: string
  savingsPotential?: 'low' | 'medium' | 'high'
  difficulty?: 'easy' | 'medium' | 'hard'
  shortDescription?: string
}

interface ImprovedSavingsCalculatorProps {
  tips?: EnergySavingTip[]
  className?: string
}

// Realistic savings percentages based on tip effectiveness
const SAVINGS_PERCENTAGES = {
  low: { min: 0.01, max: 0.03, typical: 0.02 },     // 1-3%, typically 2%
  medium: { min: 0.03, max: 0.08, typical: 0.05 },  // 3-8%, typically 5%
  high: { min: 0.08, max: 0.15, typical: 0.10 },    // 8-15%, typically 10%
}

export function ImprovedSavingsCalculator({ tips = [], className }: ImprovedSavingsCalculatorProps) {
  const [monthlyUsage, setMonthlyUsage] = useState<number>(300) // Default Danish household
  const [region, setRegion] = useState<'DK1' | 'DK2'>('DK2')
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTips, setSelectedTips] = useState<Set<string>>(new Set())
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Fetch current electricity price
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/electricity-prices?region=${region}`)
        const data = await response.json()
        
        if (data.records && data.records.length > 0) {
          // Get the current hour's price
          const now = new Date()
          const currentHour = now.getHours()
          const todaysPrices = data.records.filter((record: any) => {
            const recordDate = new Date(record.HourDK)
            return recordDate.getDate() === now.getDate()
          })
          
          const currentHourPrice = todaysPrices[currentHour]?.TotalPriceKWh || 
                                   data.records[0]?.TotalPriceKWh || 
                                   2.5 // Fallback price
          
          setCurrentPrice(currentHourPrice)
        }
      } catch (error) {
        console.error('Failed to fetch electricity price:', error)
        setCurrentPrice(2.5) // Fallback to average price
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentPrice()
  }, [region])

  // Group tips by savings potential
  const tipsByPotential = useMemo(() => {
    const grouped = {
      high: tips.filter(t => t.savingsPotential === 'high'),
      medium: tips.filter(t => t.savingsPotential === 'medium'),
      low: tips.filter(t => t.savingsPotential === 'low'),
    }
    return grouped
  }, [tips])

  // Calculate potential savings
  const calculateSavings = useMemo(() => {
    if (!currentPrice || monthlyUsage <= 0) {
      return { min: 0, max: 0, typical: 0, breakdown: [] }
    }

    let totalMinPercent = 0
    let totalMaxPercent = 0
    let totalTypicalPercent = 0
    const breakdown: any[] = []

    // Calculate based on selected tips or all tips if none selected
    const tipsToCalculate = selectedTips.size > 0 
      ? tips.filter(t => selectedTips.has(t._id))
      : tips

    // Group by potential and calculate
    const potentialGroups: Record<string, EnergySavingTip[]> = {}
    tipsToCalculate.forEach(tip => {
      const potential = tip.savingsPotential || 'low'
      if (!potentialGroups[potential]) {
        potentialGroups[potential] = []
      }
      potentialGroups[potential].push(tip)
    })

    // Calculate savings for each group with diminishing returns
    Object.entries(potentialGroups).forEach(([potential, groupTips]) => {
      const savings = SAVINGS_PERCENTAGES[potential as keyof typeof SAVINGS_PERCENTAGES]
      const count = groupTips.length
      
      // Apply diminishing returns - each additional tip in same category is 80% as effective
      let groupMinPercent = 0
      let groupMaxPercent = 0
      let groupTypicalPercent = 0
      
      for (let i = 0; i < count; i++) {
        const effectiveness = Math.pow(0.8, i) // 100%, 80%, 64%, etc.
        groupMinPercent += savings.min * effectiveness
        groupMaxPercent += savings.max * effectiveness
        groupTypicalPercent += savings.typical * effectiveness
      }
      
      totalMinPercent += groupMinPercent
      totalMaxPercent += groupMaxPercent
      totalTypicalPercent += groupTypicalPercent
      
      breakdown.push({
        potential,
        count,
        savingsPercent: groupTypicalPercent,
        monthlySavings: Math.round(monthlyUsage * groupTypicalPercent * currentPrice)
      })
    })

    // Cap total savings at realistic maximum (30%)
    totalMinPercent = Math.min(totalMinPercent, 0.25)
    totalMaxPercent = Math.min(totalMaxPercent, 0.30)
    totalTypicalPercent = Math.min(totalTypicalPercent, 0.28)

    const monthlyMin = Math.round(monthlyUsage * totalMinPercent * currentPrice)
    const monthlyMax = Math.round(monthlyUsage * totalMaxPercent * currentPrice)
    const monthlyTypical = Math.round(monthlyUsage * totalTypicalPercent * currentPrice)

    return {
      min: monthlyMin,
      max: monthlyMax,
      typical: monthlyTypical,
      breakdown,
      percentSaved: Math.round(totalTypicalPercent * 100)
    }
  }, [monthlyUsage, currentPrice, selectedTips, tips])

  return (
    <Card className={`p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">
            Beregn dine realistiske besparelser
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-5 w-5 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Beregningen bruger aktuelle elpriser og realistiske besparelsesprocenter baseret på effektiviteten af energispare tips.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="usage" className="flex items-center gap-2 mb-2">
                Dit månedlige elforbrug (kWh)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Gennemsnit for dansk husstand:</p>
                      <ul className="text-xs mt-1">
                        <li>• Lejlighed: 150-250 kWh</li>
                        <li>• Rækkehus: 250-350 kWh</li>
                        <li>• Villa: 350-500 kWh</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="usage"
                type="number"
                value={monthlyUsage}
                onChange={(e) => setMonthlyUsage(parseInt(e.target.value) || 0)}
                className="bg-white"
                min="0"
                max="2000"
              />
            </div>

            <div>
              <Label htmlFor="region" className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Dit område
              </Label>
              <Select value={region} onValueChange={(value) => setRegion(value as 'DK1' | 'DK2')}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DK1">Vestdanmark (DK1 - Jylland/Fyn)</SelectItem>
                  <SelectItem value="DK2">Østdanmark (DK2 - Sjælland/Bornholm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktuel elpris ({region})</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? 'Henter...' : currentPrice ? `${currentPrice.toFixed(2)} kr/kWh` : 'Ikke tilgængelig'}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Estimeret månedlig besparelse</p>
              
              {calculateSavings.typical > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <p className="text-3xl font-bold text-green-600">
                      {calculateSavings.typical} kr
                    </p>
                    <span className="text-sm text-gray-500">
                      ({calculateSavings.percentSaved}% reduktion)
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Interval: {calculateSavings.min} - {calculateSavings.max} kr/måned
                  </p>
                  
                  <p className="text-xs text-gray-600 mt-3">
                    Årlig besparelse: <span className="font-semibold">{calculateSavings.typical * 12} kr</span>
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-500">
                  Indtast dit forbrug for at se besparelse
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        {calculateSavings.breakdown.length > 0 && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-green-700 hover:text-green-800"
            >
              {showBreakdown ? 'Skjul' : 'Vis'} beregningsdetaljer
            </Button>
            
            {showBreakdown && (
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Besparelse fordelt på tip-kategorier:</p>
                {calculateSavings.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">
                      {item.count} {item.potential === 'high' ? 'høj-effekt' : item.potential === 'medium' ? 'mellem-effekt' : 'lav-effekt'} tips
                    </span>
                    <span className="font-medium text-gray-900">
                      {item.monthlySavings} kr/måned
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-500">
                    * Beregningen tager højde for diminishing returns - hver ekstra tip i samme kategori har lidt mindre effekt
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="bg-green-600 hover:bg-green-700">
            Se alle energispare tips
          </Button>
          <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
            Sammenlign elselskaber
          </Button>
        </div>
      </div>
    </Card>
  )
}