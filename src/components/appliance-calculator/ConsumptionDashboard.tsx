import React from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
    .filter((app) => app.monthlyCost != null && !isNaN(app.monthlyCost))
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 10) // Top 10 consumers
    .map((app) => ({
      name: app.name,
      value: parseFloat((app.monthlyCost || 0).toFixed(2)),
      percentage: totalMonthlyCost > 0 
        ? ((app.monthlyCost / totalMonthlyCost) * 100).toFixed(1)
        : '0',
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-brand-green/5 to-brand-green/10 border-brand-green/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-brand-green flex-shrink-0" />
              <span className="text-xs font-medium text-brand-green">Månedlig</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {formatCost(totalMonthlyCost)}
            </p>
            <p className="text-sm text-gray-900 font-medium">
              kr
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {formatKwh(totalMonthlyKwh)} kWh
            </p>
            {hasAppliances && costComparison && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                ≈ en biografbillet om måneden
              </p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">Årlig</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {formatCost(totalYearlyCost)}
            </p>
            <p className="text-sm text-gray-900 font-medium">
              kr
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {formatKwh(totalMonthlyKwh * 12)} kWh/år
            </p>
            {hasAppliances && (
              <p className="text-xs text-green-600 font-medium mt-1">
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
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">Daglig</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {formatCost(totalDailyCost)}
            </p>
            <p className="text-sm text-gray-900 font-medium">
              kr
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {formatKwh(totalMonthlyKwh / 30.44)} kWh
            </p>
            {hasAppliances && (
              <p className="text-xs text-gray-500 mt-1">
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
            <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Dine største strømforbrugere
            </h3>
            
            {chartData.length > 0 ? (
              <div className="space-y-6">
                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={90}
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Bar Chart - Top 3 consumers */}
                {chartData.length > 1 && (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.slice(0, 3)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={0}
                          height={40}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.slice(0, 3).map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {/* Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center">
                  {chartData.slice(0, 5).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                  {chartData.length > 5 && (
                    <span className="text-xs text-gray-500">+{chartData.length - 5} mere</span>
                  )}
                </div>
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
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-display font-bold mb-2">
                  Klar til at spare på elregningen?
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Baseret på dit årlige forbrug på <span className="font-semibold">{formatKwh(totalMonthlyKwh * 12)} kWh</span>,
                  kan du potentielt spare op til <span className="font-semibold">{formatCost(potentialSavings)} kr</span> om året.
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={onNavigateToComparison}
                className="w-full sm:w-auto bg-white text-brand-green hover:bg-gray-100 font-medium"
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
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
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