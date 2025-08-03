import { CalculatorState } from '@/types/appliance'

const STORAGE_KEY = 'elportal_appliance_calculator'

export function saveCalculatorState(state: CalculatorState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save calculator state:', error)
  }
}

export function loadCalculatorState(): CalculatorState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate the loaded state
      if (parsed && typeof parsed === 'object') {
        // Ensure electricityPriceKwh is a valid number
        if (!parsed.electricityPriceKwh || isNaN(parsed.electricityPriceKwh)) {
          parsed.electricityPriceKwh = 3.21 // Default price
        }
        // Ensure userAppliances is an array
        if (!Array.isArray(parsed.userAppliances)) {
          parsed.userAppliances = []
        }
        return parsed
      }
    }
  } catch (error) {
    console.error('Failed to load calculator state:', error)
  }
  return null
}

export function clearCalculatorState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear calculator state:', error)
  }
}