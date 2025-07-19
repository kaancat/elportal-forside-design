import { UserAppliance, ApplianceSummary } from '@/types/appliance'

// Constants
const DAYS_IN_MONTH = 30.44
const WEEKS_IN_MONTH = 4.33
const DAYS_IN_YEAR = 365
const HOURS_IN_DAY = 24

export function calculateDailyKwh(appliance: UserAppliance): number {
  const powerKw = (appliance.customWatts || appliance.powerWatts) / 1000
  const { usage, usageUnit } = appliance

  switch (usageUnit) {
    case 'hours_per_day':
      return powerKw * usage
    case 'minutes_per_day':
      return powerKw * (usage / 60)
    case 'cycles_per_week':
      // Assuming each cycle is 1 hour (can be adjusted per appliance type)
      return (powerKw * usage) / 7
    case 'always_on':
      return powerKw * HOURS_IN_DAY
    default:
      return 0
  }
}

export function calculateMonthlyKwh(appliance: UserAppliance): number {
  return calculateDailyKwh(appliance) * DAYS_IN_MONTH
}

export function calculateYearlyKwh(appliance: UserAppliance): number {
  return calculateDailyKwh(appliance) * DAYS_IN_YEAR
}

export function calculateCost(kwh: number, pricePerKwh: number): number {
  return kwh * pricePerKwh
}

export function createApplianceSummary(
  appliance: UserAppliance,
  pricePerKwh: number
): ApplianceSummary {
  const dailyKwh = calculateDailyKwh(appliance)
  const monthlyKwh = dailyKwh * DAYS_IN_MONTH
  const yearlyKwh = dailyKwh * DAYS_IN_YEAR

  return {
    ...appliance,
    dailyKwh,
    dailyCost: calculateCost(dailyKwh, pricePerKwh),
    monthlyKwh,
    monthlyCost: calculateCost(monthlyKwh, pricePerKwh),
    yearlyKwh,
    yearlyCost: calculateCost(yearlyKwh, pricePerKwh),
  }
}

export function formatCost(cost: number): string {
  return cost.toFixed(2).replace('.', ',')
}

export function formatKwh(kwh: number): string {
  if (kwh < 0.01) return '< 0,01'
  if (kwh < 1) return kwh.toFixed(2).replace('.', ',')
  if (kwh < 10) return kwh.toFixed(1).replace('.', ',')
  return Math.round(kwh).toLocaleString('da-DK')
}

// Helper to get human-readable usage labels
export function getUsageLabel(unit: UserAppliance['usageUnit'], value: number): string {
  switch (unit) {
    case 'hours_per_day':
      return `${value} ${value === 1 ? 'time' : 'timer'}/dag`
    case 'minutes_per_day':
      return `${value} ${value === 1 ? 'minut' : 'minutter'}/dag`
    case 'cycles_per_week':
      return `${value} ${value === 1 ? 'gang' : 'gange'}/uge`
    case 'always_on':
      return 'Altid tændt'
    default:
      return ''
  }
}

// Calculate potential savings
export function calculatePotentialSavings(
  appliances: ApplianceSummary[],
  currentPricePerKwh: number,
  cheaperPricePerKwh: number
): number {
  const totalYearlyKwh = appliances.reduce((sum, app) => sum + app.yearlyKwh, 0)
  const currentYearlyCost = totalYearlyKwh * currentPricePerKwh
  const cheaperYearlyCost = totalYearlyKwh * cheaperPricePerKwh
  return currentYearlyCost - cheaperYearlyCost
}

// Get emoji for cost ranges
export function getCostEmoji(monthlyCost: number): string {
  if (monthlyCost < 10) return '🟢'
  if (monthlyCost < 50) return '🟡'
  if (monthlyCost < 100) return '🟠'
  return '🔴'
}

// Get relatable cost comparisons
export function getCostComparison(monthlyCost: number): string {
  if (monthlyCost < 15) return 'en kop kaffe'
  if (monthlyCost < 30) return 'en cafe latte'
  if (monthlyCost < 50) return 'en biografbillet'
  if (monthlyCost < 100) return 'en pizzamiddag'
  if (monthlyCost < 200) return 'et månedsabonnement på Netflix'
  if (monthlyCost < 500) return 'en restaurantmiddag for to'
  return 'en weekendtur'
}