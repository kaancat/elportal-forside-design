'use client'

import React, { useReducer, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { calculatorReducer } from './reducer'
import { ApplianceSelector } from './ApplianceSelector'
import { ApplianceCard } from './ApplianceCard'
import { ConsumptionDashboard } from './ConsumptionDashboard'
import { saveCalculatorState, loadCalculatorState } from './utils/storage'
import { createApplianceSummary } from './utils/calculations'
import { Appliance } from '@/types/appliance'
import { useRouter } from 'next/navigation'

interface ApplianceCalculatorProps {
  appliances: Appliance[]
  isLoading?: boolean
  defaultElectricityPrice?: number
}

const DEFAULT_ELECTRICITY_PRICE = 3.21 // DKK per kWh including VAT and fees

export function ApplianceCalculator({
  appliances,
  isLoading = false,
  defaultElectricityPrice = DEFAULT_ELECTRICITY_PRICE,
}: ApplianceCalculatorProps) {
  const router = useRouter()

  const initialState = {
    userAppliances: [],
    electricityPriceKwh: defaultElectricityPrice,
  }

  const [state, dispatch] = useReducer(calculatorReducer, initialState)

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadCalculatorState()
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState })
    }
  }, [])

  // Save state on changes
  useEffect(() => {
    saveCalculatorState(state)
  }, [state])

  // Calculate summaries
  const applianceSummaries = useMemo(() => {
    return state.userAppliances.map((appliance) =>
      createApplianceSummary(appliance, state.electricityPriceKwh)
    )
  }, [state.userAppliances, state.electricityPriceKwh])

  const totals = useMemo(() => {
    const totalDaily = applianceSummaries.reduce(
      (sum, app) => sum + app.dailyCost,
      0
    )
    const totalMonthly = applianceSummaries.reduce(
      (sum, app) => sum + app.monthlyCost,
      0
    )
    const totalYearly = applianceSummaries.reduce(
      (sum, app) => sum + app.yearlyCost,
      0
    )
    const totalMonthlyKwh = applianceSummaries.reduce(
      (sum, app) => sum + app.monthlyKwh,
      0
    )

    return {
      daily: totalDaily,
      monthly: totalMonthly,
      yearly: totalYearly,
      monthlyKwh: totalMonthlyKwh,
    }
  }, [applianceSummaries])

  const handleNavigateToComparison = () => {
    // Navigate to price comparison with pre-filled consumption
    const annual = Math.round(totals.monthlyKwh * 12)
    router.push(`/sammenlign-priser?annualConsumption=${annual}`)
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Interaktiv beregner
            </div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-4">
              Beregn dit strømforbrug
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tilføj dine apparater og se præcis hvor meget strøm du bruger -
              og hvor meget det koster dig hver måned.
            </p>
          </motion.div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Appliance List */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ApplianceSelector
                  appliances={appliances}
                  onSelect={(appliance) =>
                    dispatch({ type: 'ADD_APPLIANCE', payload: appliance })
                  }
                  isLoading={isLoading}
                />
              </motion.div>

              {applianceSummaries.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {applianceSummaries.length} apparater tilføjet
                  </div>
                  {applianceSummaries.map((appliance) => (
                    <ApplianceCard
                      key={appliance.instanceId}
                      appliance={appliance}
                      onUpdateUsage={(instanceId, usage) =>
                        dispatch({
                          type: 'UPDATE_USAGE',
                          payload: { instanceId, usage },
                        })
                      }
                      onUpdateWatts={
                        appliance.powerRangeMin && appliance.powerRangeMax
                          ? (instanceId, watts) =>
                            dispatch({
                              type: 'UPDATE_WATTS',
                              payload: { instanceId, watts },
                            })
                          : undefined
                      }
                      onRemove={(instanceId) =>
                        dispatch({
                          type: 'REMOVE_APPLIANCE',
                          payload: { instanceId },
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
                >
                  <p className="text-gray-500 text-lg">
                    Klik på "Tilføj apparat" for at komme i gang
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Column - Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <ConsumptionDashboard
                appliances={applianceSummaries}
                totalDailyCost={totals.daily}
                totalMonthlyCost={totals.monthly}
                totalYearlyCost={totals.yearly}
                totalMonthlyKwh={totals.monthlyKwh}
                electricityPrice={state.electricityPriceKwh}
                onNavigateToComparison={handleNavigateToComparison}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}