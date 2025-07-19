import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Info, TrendingDown } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ApplianceSummary } from '@/types/appliance'
import {
  formatCost,
  formatKwh,
  getUsageLabel,
  getCostEmoji,
} from './utils/calculations'

interface ApplianceCardProps {
  appliance: ApplianceSummary
  onUpdateUsage: (instanceId: string, usage: number) => void
  onUpdateWatts?: (instanceId: string, watts: number) => void
  onRemove: (instanceId: string) => void
}

export function ApplianceCard({
  appliance,
  onUpdateUsage,
  onUpdateWatts,
  onRemove,
}: ApplianceCardProps) {
  const Icon = appliance.icon ? Icons[appliance.icon as keyof typeof Icons] : Zap
  const hasVariableWattage = appliance.powerRangeMin && appliance.powerRangeMax
  const currentWatts = appliance.customWatts || appliance.powerWatts

  // Get usage slider config based on unit type
  const getSliderConfig = () => {
    switch (appliance.usageUnit) {
      case 'hours_per_day':
        return { min: 0, max: 24, step: 0.5 }
      case 'minutes_per_day':
        return { min: 0, max: 120, step: 5 }
      case 'cycles_per_week':
        return { min: 0, max: 14, step: 1 }
      case 'always_on':
        return { min: 24, max: 24, step: 1 } // Locked at 24 hours
      default:
        return { min: 0, max: 24, step: 1 }
    }
  }

  const sliderConfig = getSliderConfig()
  const isAlwaysOn = appliance.usageUnit === 'always_on'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-300 border-gray-100">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-green/10 rounded-lg">
                <Icon className="h-6 w-6 text-brand-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{appliance.name}</h3>
                <p className="text-sm text-gray-500">
                  {currentWatts}W {getCostEmoji(appliance.monthlyCost)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(appliance.instanceId)}
              className="hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Variable wattage slider */}
          {hasVariableWattage && onUpdateWatts && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Strømforbrug</span>
                <span className="font-medium">{currentWatts}W</span>
              </div>
              <Slider
                value={[currentWatts]}
                onValueChange={(value) => onUpdateWatts(appliance.instanceId, value[0])}
                min={appliance.powerRangeMin}
                max={appliance.powerRangeMax}
                step={10}
                className="py-2"
              />
            </div>
          )}

          {/* Usage slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Brug</span>
              <span className="font-medium">
                {getUsageLabel(appliance.usageUnit, appliance.usage)}
              </span>
            </div>
            <Slider
              value={[appliance.usage]}
              onValueChange={(value) => onUpdateUsage(appliance.instanceId, value[0])}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step}
              disabled={isAlwaysOn}
              className="py-2"
            />
          </div>

          {/* Cost breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Dagligt</p>
              <p className="font-semibold text-sm">{formatCost(appliance.dailyCost)} kr</p>
              <p className="text-xs text-gray-400">{formatKwh(appliance.dailyKwh)} kWh</p>
            </div>
            <div className="text-center p-3 bg-brand-green/5 rounded-lg border border-brand-green/20">
              <p className="text-xs text-gray-500 mb-1">Månedligt</p>
              <p className="font-semibold text-sm text-brand-green">
                {formatCost(appliance.monthlyCost)} kr
              </p>
              <p className="text-xs text-gray-400">{formatKwh(appliance.monthlyKwh)} kWh</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Årligt</p>
              <p className="font-semibold text-sm">{formatCost(appliance.yearlyCost)} kr</p>
              <p className="text-xs text-gray-400">{formatKwh(appliance.yearlyKwh)} kWh</p>
            </div>
          </div>

          {/* Energy tip */}
          {appliance.energyTip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2 }}
              className="pt-3 border-t border-gray-100"
            >
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  {appliance.energyTip}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}