import React from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Zap,
  TrendingUp,
  Calendar,
  Coffee,
  ShoppingCart,
  ArrowRight,
  Lightbulb,
} from 'lucide-react'
import { ApplianceSummary } from '@/types/appliance'
import { formatCost, formatKwh, getCostComparison } from './utils/calculations'

interface ConsumptionDashboardProps {
  appliances: ApplianceSummary[]
  totalDailyCost: number
  totalMonthlyCost: number
  totalYearlyCost: number
  totalMonthlyKwh: number
  electricityPrice: number
  onNavigateToComparison?: () => void
}

const COLORS = [
  '#98ce2f', // Brand green
  '#7fb924',
  '#66a319',
  '#4d8e0e',
  '#347803',
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
]

export function ConsumptionDashboard({
  appliances,
  totalDailyCost,
  totalMonthlyCost,
  totalYearlyCost,
  totalMonthlyKwh,
  electricityPrice,
  onNavigateToComparison,
}: ConsumptionDashboardProps) {
  // Prepare data for pie chart
  const chartData = appliances
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 10) // Top 10 consumers
    .map((app) => ({
      name: app.name,
      value: parseFloat(app.monthlyCost.toFixed(2)),
      percentage: ((app.monthlyCost / totalMonthlyCost) * 100).toFixed(1),
    }))

  const hasAppliances = appliances.length > 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatCost(payload[0].value)} kr/måned ({payload[0].payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const costComparison = getCostComparison(totalMonthlyCost)
  const potentialSavings = totalYearlyCost * 0.15 // Assume 15% savings potential

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-brand-green/5 to-brand-green/10 border-brand-green/20">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-brand-green" />
              <Badge className="bg-brand-green/20 text-brand-green border-0">
                Månedlig
              </Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCost(totalMonthlyCost)} kr
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {formatKwh(totalMonthlyKwh)} kWh
            </p>
            {hasAppliances && (
              <p className="text-xs text-gray-500 mt-2">
                ≈ {costComparison} om måneden
              </p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <Badge variant="secondary">Årlig</Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCost(totalYearlyCost)} kr
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {formatKwh(totalMonthlyKwh * 12)} kWh/år
            </p>
            {hasAppliances && (
              <p className="text-xs text-gray-500 mt-2">
                Kunne spare op til {formatCost(potentialSavings)} kr
              </p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <Badge variant="outline">Daglig</Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCost(totalDailyCost)} kr
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {formatKwh(totalMonthlyKwh / 30.44)} kWh
            </p>
            {hasAppliances && (
              <p className="text-xs text-gray-500 mt-2">
                Ved {formatCost(electricityPrice)} kr/kWh
              </p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Pie Chart */}
      {hasAppliances && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Dine største strømforbrugere
            </h3>
            
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Tilføj apparater for at se fordelingen</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Call to Action */}
      {hasAppliances && onNavigateToComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-r from-brand-green to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Klar til at spare på elregningen?
                </h3>
                <p className="text-white/90">
                  Baseret på dit årlige forbrug på {formatKwh(totalMonthlyKwh * 12)} kWh,
                  kan du potentielt spare op til {formatCost(potentialSavings)} kr om året.
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={onNavigateToComparison}
                className="bg-white text-brand-green hover:bg-gray-100"
              >
                Sammenlign elaftaler
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!hasAppliances && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ingen apparater tilføjet endnu
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Tilføj dine elektriske apparater for at se dit strømforbrug og
            potentielle besparelser.
          </p>
        </motion.div>
      )}
    </div>
  )
}