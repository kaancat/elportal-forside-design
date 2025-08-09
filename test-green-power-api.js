#!/usr/bin/env node

/**
 * Test script for Green Power Denmark API integration
 * Tests various postal codes and addresses to verify correct grid provider lookup
 */

// API base URL
const API_BASE_URL = 'https://api.elnet.greenpowerdenmark.dk/api/supplierlookup';

// Test cases
const testCases = [
  // Postal codes only
  { query: '2200', expected: 'Radius Elnet A/S', location: 'København N' },
  { query: '2100', expected: 'Radius Elnet A/S', location: 'København Ø' },
  { query: '8000', expected: 'KONSTANT Net A/S', location: 'Aarhus C' },
  { query: '5000', expected: 'Vores Elnet', location: 'Odense C' },
  { query: '9000', expected: 'N1 A/S', location: 'Aalborg' },
  { query: '6700', expected: 'N1 A/S', location: 'Esbjerg' },
  { query: '7400', expected: 'N1 A/S', location: 'Herning' },
  { query: '4000', expected: 'Cerius A/S', location: 'Roskilde' },
  
  // Full addresses
  { query: 'Nørrebrogade 1, 2200 København N', expected: 'Radius Elnet A/S', location: 'Nørrebro' },
  { query: 'Rådhuspladsen 1, 8000 Aarhus C', expected: 'KONSTANT Net A/S', location: 'Aarhus centrum' },
  { query: 'Albanigade 1, 5000 Odense', expected: 'Vores Elnet', location: 'Odense' },
  { query: 'Algade 1, 9000 Aalborg', expected: 'N1 A/S', location: 'Aalborg centrum' },
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

async function testAPI(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${API_BASE_URL}/${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log('=' .repeat(80));
  console.log(`${colors.blue}GREEN POWER DENMARK API TEST${colors.reset}`);
  console.log('=' .repeat(80));
  console.log();
  
  let passed = 0;
  let failed = 0;
  let errors = 0;
  
  for (const testCase of testCases) {
    const result = await testAPI(testCase.query);
    
    if (result.error) {
      console.log(`${colors.red}✗ ERROR${colors.reset} [${testCase.location}]`);
      console.log(`  Query: "${testCase.query}"`);
      console.log(`  Error: ${result.error}`);
      errors++;
    } else if (result.name === testCase.expected) {
      console.log(`${colors.green}✓ PASS${colors.reset} [${testCase.location}]`);
      console.log(`  Query: "${testCase.query}"`);
      console.log(`  ${colors.gray}Result: ${result.name} (${result.def})${colors.reset}`);
      passed++;
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} [${testCase.location}]`);
      console.log(`  Query: "${testCase.query}"`);
      console.log(`  Expected: ${testCase.expected}`);
      console.log(`  Got: ${result.name || 'null'}`);
      failed++;
    }
    console.log();
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('=' .repeat(80));
  console.log('TEST RESULTS:');
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}Errors: ${errors}${colors.reset}`);
  console.log('=' .repeat(80));
  
  // Test our specific case
  console.log();
  console.log(`${colors.blue}SPECIFIC TEST: Your postal code 2200${colors.reset}`);
  const yourResult = await testAPI('2200');
  if (yourResult.name === 'Radius Elnet A/S') {
    console.log(`${colors.green}✓ CORRECT!${colors.reset} Postal code 2200 returns Radius Elnet A/S`);
    console.log(`  This matches vindstoed.dk and your actual invoices!`);
  } else {
    console.log(`${colors.red}✗ INCORRECT${colors.reset} Got: ${yourResult.name}`);
  }
}

// Run the tests
runTests().catch(console.error);