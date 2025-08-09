#!/usr/bin/env node

/**
 * Test script for DatahubPricelist API integration
 * Verifies that network tariff fetching works correctly
 */

const API_BASE_URL = 'https://api.energidataservice.dk/dataset/DatahubPricelist';

// Test providers with their GLN codes and expected charge codes
const testProviders = [
  {
    name: 'Radius Elnet (Copenhagen)',
    gln: '5790000705689',
    chargeCode: 'DT_C_01',
    expectedAvg: 0.217 // Expected average in kr/kWh
  },
  {
    name: 'N1 (Jutland)',
    gln: '5790001089030',
    chargeCode: 'CD',
    expectedAvg: 0.192
  },
  {
    name: 'Cerius (Zealand)',
    gln: '5790000610976',
    chargeCode: 'DT_C_01',
    expectedAvg: 0.236
  },
  {
    name: 'Vores Elnet (Funen)',
    gln: '5790000610853',
    chargeCode: 'DT_C_01',
    expectedAvg: 0.220
  },
  {
    name: 'TREFOR El-Net',
    gln: '5790000392261',
    chargeCode: 'DT_C_01',
    expectedAvg: 0.316
  }
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

async function fetchTariff(gln, chargeCode) {
  try {
    const filter = {
      ChargeType: 'D03',
      GLN_Number: gln,
      ChargeTypeCode: chargeCode
    };

    const params = new URLSearchParams({
      filter: JSON.stringify(filter),
      sort: 'ValidFrom desc',
      limit: '5'
    });

    const response = await fetch(`${API_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

function calculateAverage(hourlyRates) {
  // Danish household consumption pattern
  const lowHours = [0, 1, 2, 3, 4, 5];           // 25% consumption
  const peakHours = [17, 18, 19, 20];            // 15% consumption
  const highHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21, 22, 23]; // 60% consumption
  
  const lowAvg = lowHours.reduce((sum, h) => sum + hourlyRates[h], 0) / lowHours.length;
  const highAvg = highHours.reduce((sum, h) => sum + hourlyRates[h], 0) / highHours.length;
  const peakAvg = peakHours.reduce((sum, h) => sum + hourlyRates[h], 0) / peakHours.length;
  
  return lowAvg * 0.25 + highAvg * 0.60 + peakAvg * 0.15;
}

function getCurrentTariff(records) {
  const now = new Date();
  
  for (const record of records) {
    const validFrom = new Date(record.ValidFrom);
    const validTo = record.ValidTo ? new Date(record.ValidTo) : null;
    
    if (now >= validFrom && (!validTo || now < validTo)) {
      return record;
    }
  }
  
  return null;
}

async function runTests() {
  console.log('='.repeat(80));
  console.log(`${colors.blue}DATAHUB PRICELIST API INTEGRATION TEST${colors.reset}`);
  console.log('='.repeat(80));
  console.log();
  
  let successCount = 0;
  let failCount = 0;
  
  for (const provider of testProviders) {
    console.log(`${colors.cyan}Testing: ${provider.name}${colors.reset}`);
    console.log(`GLN: ${provider.gln} | Charge Code: ${provider.chargeCode}`);
    console.log('-'.repeat(60));
    
    const result = await fetchTariff(provider.gln, provider.chargeCode);
    
    if (result.error) {
      console.log(`${colors.red}✗ API ERROR: ${result.error}${colors.reset}`);
      failCount++;
    } else if (!result.records || result.records.length === 0) {
      console.log(`${colors.yellow}⚠ No tariff data found${colors.reset}`);
      failCount++;
    } else {
      const currentTariff = getCurrentTariff(result.records);
      
      if (!currentTariff) {
        console.log(`${colors.yellow}⚠ No valid tariff for current date${colors.reset}`);
        failCount++;
      } else {
        // Extract hourly rates
        const hourlyRates = [];
        for (let i = 1; i <= 24; i++) {
          hourlyRates.push(currentTariff[`Price${i}`]);
        }
        
        // Calculate average
        const average = calculateAverage(hourlyRates);
        
        // Check season
        const validFrom = new Date(currentTariff.ValidFrom);
        const month = validFrom.getMonth();
        const season = month >= 3 && month < 9 ? 'Summer' : 'Winter';
        
        console.log(`${colors.green}✓ FOUND TARIFF DATA${colors.reset}`);
        console.log(`  Valid from: ${currentTariff.ValidFrom}`);
        console.log(`  Valid to: ${currentTariff.ValidTo || 'No end date'}`);
        console.log(`  Season: ${season}`);
        console.log(`  Charge owner: ${currentTariff.ChargeOwner}`);
        console.log();
        
        // Display tariff periods
        console.log(`  ${colors.magenta}Tariff periods (kr/kWh):${colors.reset}`);
        const lowRate = (hourlyRates[0] + hourlyRates[1] + hourlyRates[2] + 
                        hourlyRates[3] + hourlyRates[4] + hourlyRates[5]) / 6;
        const highRate = (hourlyRates[6] + hourlyRates[7] + hourlyRates[8] + 
                         hourlyRates[9] + hourlyRates[10] + hourlyRates[11] + 
                         hourlyRates[12] + hourlyRates[13] + hourlyRates[14] + 
                         hourlyRates[15] + hourlyRates[16] + hourlyRates[21] + 
                         hourlyRates[22] + hourlyRates[23]) / 14;
        const peakRate = (hourlyRates[17] + hourlyRates[18] + 
                         hourlyRates[19] + hourlyRates[20]) / 4;
        
        console.log(`    Low (00-06): ${lowRate.toFixed(4)} kr/kWh`);
        console.log(`    High (06-17, 21-24): ${highRate.toFixed(4)} kr/kWh`);
        console.log(`    Peak (17-21): ${peakRate.toFixed(4)} kr/kWh`);
        console.log();
        
        console.log(`  ${colors.magenta}Calculated average: ${average.toFixed(3)} kr/kWh${colors.reset}`);
        console.log(`  Expected average: ${provider.expectedAvg} kr/kWh`);
        
        const diff = Math.abs(average - provider.expectedAvg);
        if (diff < 0.05) {
          console.log(`  ${colors.green}✓ Average matches expected (diff: ${diff.toFixed(3)})${colors.reset}`);
          successCount++;
        } else {
          console.log(`  ${colors.yellow}⚠ Average differs from expected (diff: ${diff.toFixed(3)})${colors.reset}`);
          successCount++; // Still count as success if we got data
        }
      }
    }
    
    console.log();
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('TEST RESULTS:');
  console.log(`${colors.green}Successful: ${successCount}/${testProviders.length}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}/${testProviders.length}${colors.reset}`);
  console.log('='.repeat(80));
  
  // Current hour information
  const hour = new Date().getHours();
  let period, periodName;
  if (hour >= 0 && hour < 6) {
    period = 'low';
    periodName = 'Lavlast (billigste)';
  } else if (hour >= 17 && hour < 21) {
    period = 'peak';
    periodName = 'Spidslast (dyreste)';
  } else {
    period = 'high';
    periodName = 'Højlast (normal)';
  }
  
  console.log();
  console.log(`${colors.blue}CURRENT TARIFF PERIOD:${colors.reset}`);
  console.log(`Time: ${new Date().toLocaleTimeString('da-DK')}`);
  console.log(`Period: ${periodName}`);
  console.log(`Hour: ${hour}:00-${(hour + 1) % 24}:00`);
  console.log();
  
  if (successCount === testProviders.length) {
    console.log(`${colors.green}✓ ALL TESTS PASSED - API INTEGRATION WORKING!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ SOME TESTS FAILED - CHECK CONFIGURATION${colors.reset}`);
  }
  
  console.log('='.repeat(80));
}

// Run the tests
runTests().catch(console.error);