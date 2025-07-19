// Types for the appliance calculator feature

export interface Appliance {
  _id: string
  name: string
  slug: { current: string }
  category: 'kitchen' | 'entertainment' | 'lighting' | 'cooling' | 'cooking' | 'cleaning' | 'heating' | 'standby' | 'other'
  powerWatts: number
  powerRangeMin?: number
  powerRangeMax?: number
  usageUnit: 'hours_per_day' | 'minutes_per_day' | 'cycles_per_week' | 'always_on'
  defaultUsage: number
  icon?: string
  energyTip?: string
  popularityScore?: number
}

export interface UserAppliance extends Appliance {
  instanceId: string
  usage: number
  customWatts?: number // For when user adjusts variable wattage appliances
}

export interface CalculatorState {
  userAppliances: UserAppliance[]
  electricityPriceKwh: number
}

export type CalculatorAction =
  | { type: 'ADD_APPLIANCE'; payload: Appliance }
  | { type: 'REMOVE_APPLIANCE'; payload: { instanceId: string } }
  | { type: 'UPDATE_USAGE'; payload: { instanceId: string; usage: number } }
  | { type: 'UPDATE_WATTS'; payload: { instanceId: string; watts: number } }
  | { type: 'SET_PRICE'; payload: number }
  | { type: 'LOAD_STATE'; payload: CalculatorState }
  | { type: 'CLEAR_ALL' }

export interface ApplianceSummary extends UserAppliance {
  monthlyKwh: number
  monthlyCost: number
  yearlyKwh: number
  yearlyCost: number
  dailyKwh: number
  dailyCost: number
}

export interface EnergyTip {
  _id: string
  title: string
  slug: { current: string }
  category: 'daily_habits' | 'heating' | 'lighting' | 'appliances' | 'insulation' | 'smart_tech'
  shortDescription: string
  detailedContent?: any[]
  savingsPotential?: 'low' | 'medium' | 'high'
  difficulty?: 'easy' | 'medium' | 'hard'
  icon?: string
  order?: number
}