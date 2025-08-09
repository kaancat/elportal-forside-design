// Test file to verify price calculations after fix

// Simulate the calculation with test data
function calculatePricePerKwh(spotPrice, providerMarkup, greenCerts = 0, tradingCosts = 0) {
  // Constants
  const NETWORK_TARIFF_AVG = 0.30;
  const SYSTEM_TARIFF = 0.19;
  const TRANSMISSION_FEE = 0.11;
  const ELECTRICITY_TAX = 0.90;
  const VAT_RATE = 0.25;
  
  // Spot price from API is already in kr/kWh
  const spotPriceKr = spotPrice;
  
  // All provider fees from Sanity are in øre/kWh - convert to kr/kWh
  const providerMarkupKr = providerMarkup / 100;
  const greenCertsKr = greenCerts / 100;
  const tradingCostsKr = tradingCosts / 100;
  
  // Sum all components before VAT
  const priceBeforeVat = 
    spotPriceKr +
    providerMarkupKr +
    greenCertsKr +
    tradingCostsKr +
    NETWORK_TARIFF_AVG +
    SYSTEM_TARIFF +
    ELECTRICITY_TAX +
    TRANSMISSION_FEE;
  
  // Add 25% VAT
  return priceBeforeVat * (1 + VAT_RATE);
}

// Test providers with their stored values (in øre)
const providers = [
  { name: 'Vindstød DanskVind', markup: 0, green: 0, trading: 0, monthly: 0 },
  { name: 'OK El Flex', markup: 13.21, green: 0, trading: 0, monthly: 0 },
  { name: 'Velkommen GrønEl', markup: 4, green: 15, trading: 3.75, monthly: 1 },
  { name: 'Energi Fyn SpotEl', markup: 8.75, green: 0, trading: 0, monthly: 15 },
  { name: 'Andel Energi TimeEnergi', markup: 11.46, green: 1.88, trading: 0.90, monthly: 19 },
  { name: 'Energi Viborg Flex-El', markup: 6.25, green: 0, trading: 0, monthly: 20 },
  { name: 'Norlys FlexEl', markup: 9, green: 0, trading: 0, monthly: 29 },
  { name: 'EWII Timepris', markup: 3.75, green: 0, trading: 0, monthly: 29 },
  { name: 'NRGi Time', markup: 5, green: 0, trading: 0.29, monthly: 29 },
  { name: 'Verdo Variabel', markup: 10, green: 2.50, trading: 0, monthly: 25 },
  { name: 'DCC Energi Flex', markup: 7.50, green: 3.50, trading: 1.69, monthly: 25 }
];

// Assume spot price of 1.0 kr/kWh for testing
const spotPrice = 1.0;

console.log('Price calculations after fix (spot price: 1.0 kr/kWh):');
console.log('='.repeat(60));

providers.forEach(p => {
  const pricePerKwh = calculatePricePerKwh(spotPrice, p.markup, p.green, p.trading);
  const monthlyConsumption = 4000 / 12; // 333.33 kWh/month
  const monthlyCost = (pricePerKwh * monthlyConsumption) + p.monthly + 15; // +15 for system tariff annual/12
  
  console.log(`${p.name.padEnd(25)} | ${pricePerKwh.toFixed(2)} kr/kWh | ${monthlyCost.toFixed(0)} kr/month`);
});

console.log('\nExpected ranking (lowest to highest monthly cost, Vindstød first):');
const sorted = providers.map(p => {
  const pricePerKwh = calculatePricePerKwh(spotPrice, p.markup, p.green, p.trading);
  const monthlyConsumption = 4000 / 12;
  const monthlyCost = (pricePerKwh * monthlyConsumption) + p.monthly + 15;
  return { ...p, monthlyCost };
}).sort((a, b) => {
  // Vindstød first
  if (a.name.includes('Vindstød')) return -1;
  if (b.name.includes('Vindstød')) return 1;
  return a.monthlyCost - b.monthlyCost;
});

sorted.forEach((p, i) => {
  console.log(`${i+1}. ${p.name.padEnd(25)} - ${p.monthlyCost.toFixed(0)} kr/month`);
});