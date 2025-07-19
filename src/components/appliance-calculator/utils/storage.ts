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
      return JSON.parse(stored)
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