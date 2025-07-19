import { CalculatorState, CalculatorAction, UserAppliance } from '@/types/appliance'

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    case 'ADD_APPLIANCE': {
      const newAppliance: UserAppliance = {
        ...action.payload,
        instanceId: crypto.randomUUID(),
        usage: action.payload.defaultUsage,
      }
      return {
        ...state,
        userAppliances: [...state.userAppliances, newAppliance],
      }
    }

    case 'REMOVE_APPLIANCE':
      return {
        ...state,
        userAppliances: state.userAppliances.filter(
          (app) => app.instanceId !== action.payload.instanceId
        ),
      }

    case 'UPDATE_USAGE':
      return {
        ...state,
        userAppliances: state.userAppliances.map((app) =>
          app.instanceId === action.payload.instanceId
            ? { ...app, usage: action.payload.usage }
            : app
        ),
      }

    case 'UPDATE_WATTS':
      return {
        ...state,
        userAppliances: state.userAppliances.map((app) =>
          app.instanceId === action.payload.instanceId
            ? { ...app, customWatts: action.payload.watts }
            : app
        ),
      }

    case 'SET_PRICE':
      return {
        ...state,
        electricityPriceKwh: action.payload,
      }

    case 'LOAD_STATE':
      return action.payload

    case 'CLEAR_ALL':
      return {
        ...state,
        userAppliances: [],
      }

    default:
      return state
  }
}