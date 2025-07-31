/**
 * Danish Electricity Price Calculation Service
 * 
 * This service centralizes all electricity price calculations for the ElPortal platform.
 * All prices are in Danish Kroner (DKK/kr) per kWh unless otherwise specified.
 * 
 * Price Components:
 * 1. Spot Price - Market price from Nord Pool (variable)
 * 2. Provider Markup - Each provider's additional fee
 * 3. Network Tariff - Grid company fees (varies by region)
 * 4. System Tariff - Energinet system operation
 * 5. Electricity Tax - Government tax (elafgift)
 * 6. Transmission Fee - Energinet transmission network
 * 7. VAT - 25% on all components
 * 8. Monthly Subscription - Fixed monthly fee
 */

import { ProviderProductBlock } from '@/types/sanity';

// Price constants in kr/kWh (2024 values)
export const PRICE_CONSTANTS = {
  // Network and system fees
  NETWORK_TARIFF_AVG: 0.30,    // Average nettarif across Denmark
  SYSTEM_TARIFF: 0.19,         // Systemtarif (from API)
  TRANSMISSION_FEE: 0.11,      // Energinet transmission fee
  
  // Taxes
  ELECTRICITY_TAX: 0.90,       // Elafgift (from API, official 2024 rate)
  VAT_RATE: 0.25,              // 25% VAT
  
  // Fallbacks
  DEFAULT_SPOT_PRICE: 1.00,    // Fallback if API fails
  
  // Annual fees
  SYSTEM_TARIFF_ANNUAL: 180,   // Annual system tariff subscription (kr/year)
};

/**
 * Calculate the total price per kWh including all components and VAT
 */
export function calculatePricePerKwh(
  spotPrice: number,
  providerMarkup: number
): number {
  // Sum all components before VAT
  const priceBeforeVat = 
    spotPrice +
    providerMarkup +
    PRICE_CONSTANTS.NETWORK_TARIFF_AVG +
    PRICE_CONSTANTS.SYSTEM_TARIFF +
    PRICE_CONSTANTS.ELECTRICITY_TAX +
    PRICE_CONSTANTS.TRANSMISSION_FEE;
  
  // Add 25% VAT
  return priceBeforeVat * (1 + PRICE_CONSTANTS.VAT_RATE);
}

/**
 * Calculate monthly electricity cost
 */
export function calculateMonthlyCost(
  annualConsumption: number,
  pricePerKwh: number,
  monthlySubscription: number
): number {
  const monthlyConsumption = annualConsumption / 12;
  const monthlySystemTariff = PRICE_CONSTANTS.SYSTEM_TARIFF_ANNUAL / 12;
  
  return (pricePerKwh * monthlyConsumption) + monthlySubscription + monthlySystemTariff;
}

/**
 * Calculate annual electricity cost
 */
export function calculateAnnualCost(
  annualConsumption: number,
  pricePerKwh: number,
  monthlySubscription: number
): number {
  return (pricePerKwh * annualConsumption) + 
         (monthlySubscription * 12) + 
         PRICE_CONSTANTS.SYSTEM_TARIFF_ANNUAL;
}

/**
 * Get price breakdown for transparency
 */
export function getPriceBreakdown(
  spotPrice: number,
  providerMarkup: number
) {
  const networkFees = PRICE_CONSTANTS.NETWORK_TARIFF_AVG + 
                     PRICE_CONSTANTS.SYSTEM_TARIFF + 
                     PRICE_CONSTANTS.TRANSMISSION_FEE;
  
  const subtotal = spotPrice + providerMarkup + networkFees + PRICE_CONSTANTS.ELECTRICITY_TAX;
  const vatAmount = subtotal * PRICE_CONSTANTS.VAT_RATE;
  
  return {
    spotPrice,
    providerMarkup,
    networkFees,
    electricityTax: PRICE_CONSTANTS.ELECTRICITY_TAX,
    subtotal,
    vatAmount,
    total: subtotal + vatAmount
  };
}

/**
 * Rank providers according to business logic
 * Vindstød must always appear first, then sort by price
 */
export function rankProviders(
  providers: ProviderProductBlock[],
  spotPrice: number,
  annualConsumption: number
): ProviderProductBlock[] {
  // Calculate total monthly cost for each provider
  const providersWithCost = providers.map(provider => {
    const pricePerKwh = calculatePricePerKwh(
      spotPrice,
      provider.displayPrice_kWh || 0
    );
    const monthlyCost = calculateMonthlyCost(
      annualConsumption,
      pricePerKwh,
      provider.displayMonthlyFee || 0
    );
    
    return { ...provider, calculatedMonthlyCost: monthlyCost };
  });
  
  // Separate Vindstød and others
  const vindstod = providersWithCost.find(p => p.isVindstoedProduct);
  const others = providersWithCost
    .filter(p => !p.isVindstoedProduct)
    .sort((a, b) => a.calculatedMonthlyCost - b.calculatedMonthlyCost);
  
  // Vindstød first, then others sorted by price
  const ranked = vindstod ? [vindstod, ...others] : others;
  
  // Remove the temporary cost field
  return ranked.map(({ calculatedMonthlyCost, ...provider }) => provider);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} kr.`;
}

/**
 * Format consumption for display
 */
export function formatConsumption(kwh: number): string {
  return `${kwh.toLocaleString('da-DK')} kWh`;
}