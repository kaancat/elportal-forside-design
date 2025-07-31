# Electricity Calculator Logic Documentation

## Overview
The ElPortal electricity price calculator provides transparent, real-time electricity price calculations for Danish consumers. The calculator integrates live spot prices from the Nord Pool market with provider-specific fees to give users accurate cost estimates.

## Price Components

### 1. Variable Components
- **Spot Price (Spotpris)**: Real-time electricity market price from Nord Pool via EnergiDataService API
  - Updates hourly
  - Varies by region (DK1/DK2)
  - Fallback: 1.00 kr/kWh if API unavailable

- **Provider Markup (Tillæg)**: Each electricity provider's profit margin
  - Stored in Sanity CMS
  - Ranges typically from 0.00 to 0.30 kr/kWh

### 2. Fixed Components (2024 rates)
- **Network Tariff (Nettarif)**: 0.30 kr/kWh (average)
- **System Tariff (Systemtarif)**: 0.19 kr/kWh
- **Transmission Fee (Transmissionstarif)**: 0.11 kr/kWh
- **Electricity Tax (Elafgift)**: 0.90 kr/kWh
- **System Tariff Annual**: 180 kr/year (15 kr/month)

### 3. Tax
- **VAT (Moms)**: 25% applied to all components

## Calculation Formula

```typescript
// Per kWh calculation
priceBeforeVAT = spotPrice + providerMarkup + networkTariff + systemTariff + transmissionFee + electricityTax
pricePerKwh = priceBeforeVAT × 1.25

// Monthly cost
monthlyConsumption = annualConsumption / 12
monthlySystemTariff = 180 / 12 = 15 kr
monthlyCost = (pricePerKwh × monthlyConsumption) + monthlySubscription + monthlySystemTariff

// Annual cost
annualCost = (pricePerKwh × annualConsumption) + (monthlySubscription × 12) + 180
```

## Example Calculation

For a household with 4,000 kWh annual consumption:
- Spot price: 1.20 kr/kWh
- Provider markup: 0.05 kr/kWh
- Monthly subscription: 29 kr

```
Price before VAT = 1.20 + 0.05 + 0.30 + 0.19 + 0.11 + 0.90 = 2.75 kr/kWh
Price per kWh = 2.75 × 1.25 = 3.44 kr/kWh

Monthly consumption = 4,000 / 12 = 333.33 kWh
Monthly cost = (3.44 × 333.33) + 29 + 15 = 1,190.67 kr
```

## Provider Ranking Logic

Providers are ranked according to business requirements:
1. Vindstød (if available) always appears first
2. Other providers sorted by total monthly cost (lowest first)
3. Maximum 5 providers shown in calculator results

## Data Sources

1. **Spot Prices**: `/api/electricity-prices` endpoint
   - Fetches from EnergiDataService
   - Cached for 1 hour
   - Regional support (DK1/DK2)

2. **Provider Data**: Sanity CMS
   - Provider name and logo
   - Product details and features
   - Pricing (markup and monthly fee)
   - Signup links

## User Flow

1. **Welcome** → User sees benefits and starts calculator
2. **Consumption Input** → User selects housing type or enters custom consumption
3. **Results** → Shows personalized prices with:
   - Top 5 providers ranked by price
   - Transparent price breakdown
   - Direct signup links
   - Savings indicators

## Error Handling

- **API Failures**: Falls back to default spot price (1.00 kr/kWh)
- **Missing Providers**: Shows error message with retry option
- **Network Issues**: Loading states and error messages in Danish

## Implementation Files

- `/src/services/priceCalculationService.ts` - Core calculation logic
- `/src/components/PriceCalculatorWidget.tsx` - Main calculator component
- `/src/components/CalculatorResults.tsx` - Results display component
- `/src/components/ProviderCard.tsx` - Individual provider display