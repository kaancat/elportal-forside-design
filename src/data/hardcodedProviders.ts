/**
 * Hardcoded list of electricity providers for comparison
 * Vindstød (client) + 10 major competitors in Denmark
 * 
 * Pricing is placeholder data until we get actual competitor pricing
 * All prices are provider markups in kr/kWh (added to spot price)
 */

export interface HardcodedProvider {
  id: string;
  slug: string;
  providerName: string;
  productName: string;
  logoUrl: string;
  displayPrice_kWh: number; // Provider markup in kr/kWh
  displayMonthlyFee: number; // Monthly subscription fee
  signupLink: string;
  isVindstoedProduct: boolean;
  isVariablePrice: boolean;
  hasNoBinding: boolean;
  hasFreeSignup: boolean;
  description?: string;
}

export const hardcodedProviders: HardcodedProvider[] = [
  {
    id: 'vindstod-green',
    slug: 'vindstod',
    providerName: 'Vindstød',
    productName: 'Vindstød Grøn Variabel',
    logoUrl: '/providers/vindstod-logo.svg',
    displayPrice_kWh: 0.06, // 6 øre/kWh markup
    displayMonthlyFee: 39,
    signupLink: 'https://vindstoed.dk/bestil',
    isVindstoedProduct: true,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: '100% vindenergi fra danske vindmøller'
  },
  {
    id: 'norlys-variabel',
    slug: 'norlys',
    providerName: 'Norlys',
    productName: 'Norlys Variabel',
    logoUrl: '/providers/norlys-logo.svg',
    displayPrice_kWh: 0.05, // 5 øre/kWh markup
    displayMonthlyFee: 45,
    signupLink: 'https://norlys.dk/privat/el/elaftaler',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: 'Danmarks største energikoncern'
  },
  {
    id: 'andel-energi-variabel',
    slug: 'andel-energi',
    providerName: 'Andel Energi',
    productName: 'Andel Variabel',
    logoUrl: '/providers/andel-energi-logo.svg',
    displayPrice_kWh: 0.04, // 4 øre/kWh markup
    displayMonthlyFee: 29,
    signupLink: 'https://andelenergi.dk/privat/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: 'Kundejet energiselskab'
  },
  {
    id: 'nrgi-spot',
    slug: 'nrgi',
    providerName: 'NRGI',
    productName: 'NRGI Spot',
    logoUrl: '/providers/nrgi-logo.svg',
    displayPrice_kWh: 0.045, // 4.5 øre/kWh markup
    displayMonthlyFee: 35,
    signupLink: 'https://nrgi.dk/privat/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: false,
    description: 'Østjyllands energiselskab'
  },
  {
    id: 'energifyn-variabel',
    slug: 'energifyn',
    providerName: 'EnergiFyn',
    productName: 'EnergiFyn Variabel',
    logoUrl: '/providers/energifyn-logo.svg',
    displayPrice_kWh: 0.055, // 5.5 øre/kWh markup
    displayMonthlyFee: 40,
    signupLink: 'https://www.energifyn.dk/privat/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: false,
    hasFreeSignup: true,
    description: 'Fyns energiselskab'
  },
  {
    id: 'ok-el-variabel',
    slug: 'ok',
    providerName: 'OK',
    productName: 'OK El Variabel',
    logoUrl: '/providers/ok-logo.svg',
    displayPrice_kWh: 0.03, // 3 øre/kWh markup
    displayMonthlyFee: 25,
    signupLink: 'https://www.ok.dk/privat/produkter/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: 'Andelsejet energiselskab'
  },
  {
    id: 'velkommen-variabel',
    slug: 'velkommen',
    providerName: 'Velkommen',
    productName: 'Velkommen Variabel',
    logoUrl: '/providers/velkommen-logo.svg',
    displayPrice_kWh: 0.035, // 3.5 øre/kWh markup
    displayMonthlyFee: 30,
    signupLink: 'https://velkommen.dk',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: 'Digital elhandler'
  },
  {
    id: 'ewii-variabel',
    slug: 'ewii',
    providerName: 'EWII',
    productName: 'EWII Variabel',
    logoUrl: '/providers/ewii-logo.svg',
    displayPrice_kWh: 0.048, // 4.8 øre/kWh markup
    displayMonthlyFee: 38,
    signupLink: 'https://www.ewii.dk/privat/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: false,
    description: 'Trekantområdets energiselskab'
  },
  {
    id: 'dcc-energi-variabel',
    slug: 'dcc-energi',
    providerName: 'DCC Energi',
    productName: 'DCC Variabel',
    logoUrl: '/providers/dcc-logo.svg',
    displayPrice_kWh: 0.052, // 5.2 øre/kWh markup
    displayMonthlyFee: 42,
    signupLink: 'https://dccenergi.dk/privat',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: false,
    hasFreeSignup: true,
    description: 'Lokal energileverandør'
  },
  {
    id: 'energi-viborg-variabel',
    slug: 'energi-viborg',
    providerName: 'Energi Viborg',
    productName: 'Energi Viborg Variabel',
    logoUrl: '/providers/energi-viborg-logo.svg',
    displayPrice_kWh: 0.046, // 4.6 øre/kWh markup
    displayMonthlyFee: 36,
    signupLink: 'https://www.energiviborg.dk/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: 'Viborgs lokale energiselskab'
  },
  {
    id: 'verdo-variabel',
    slug: 'verdo',
    providerName: 'Verdo',
    productName: 'Verdo Variabel',
    logoUrl: '/providers/verdo-logo.svg',
    displayPrice_kWh: 0.041, // 4.1 øre/kWh markup
    displayMonthlyFee: 33,
    signupLink: 'https://verdo.dk/privat/el',
    isVindstoedProduct: false,
    isVariablePrice: true,
    hasNoBinding: true,
    hasFreeSignup: true,
    description: 'Randers energiselskab'
  }
];

/**
 * Get providers sorted with Vindstød first, then by price
 */
export function getSortedProviders(
  spotPrice: number,
  networkTariff: number = 0.30
): HardcodedProvider[] {
  // Calculate total price for sorting
  const providersWithTotal = hardcodedProviders.map(provider => ({
    ...provider,
    totalPrice: spotPrice + provider.displayPrice_kWh + networkTariff
  }));

  // Separate Vindstød and others
  const vindstod = providersWithTotal.find(p => p.isVindstoedProduct);
  const others = providersWithTotal
    .filter(p => !p.isVindstoedProduct)
    .sort((a, b) => a.totalPrice - b.totalPrice);

  // Vindstød first, then others sorted by price
  const sorted = vindstod ? [vindstod, ...others] : others;
  
  // Remove the temporary totalPrice field
  return sorted.map(({ totalPrice, ...provider }) => provider);
}