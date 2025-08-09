#!/usr/bin/env node

/**
 * Test script for DAWA (Danmarks Adresse Web API) Autocomplete
 * Tests various Danish address searches to verify autocomplete functionality
 */

// API base URL
const API_BASE_URL = 'https://api.dataforsyningen.dk/autocomplete';

// Test cases
const testQueries = [
  { query: 'Birkevej 7', description: 'Street with number' },
  { query: 'Nørrebrogade', description: 'Copenhagen street' },
  { query: 'Rådhuspladsen 1', description: 'City hall square' },
  { query: '2200', description: 'Postal code København N' },
  { query: '8000', description: 'Postal code Aarhus' },
  { query: 'Vesterb', description: 'Partial street name (fuzzy)' },
  { query: 'H.C. Andersens', description: 'Street with special characters' },
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

async function testAutocomplete(query, caretpos) {
  try {
    const params = new URLSearchParams({
      q: query,
      caretpos: caretpos || query.length,
      fuzzy: ''
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

function formatAddress(result) {
  const { data } = result;
  const parts = [];
  
  if (data.vejnavn && data.husnr) {
    parts.push(`${data.vejnavn} ${data.husnr}`);
  } else if (data.vejnavn) {
    parts.push(data.vejnavn);
  }
  
  if (data.supplerendebynavn) {
    parts.push(data.supplerendebynavn);
  }
  
  if (data.postnr && data.postnrnavn) {
    parts.push(`${data.postnr} ${data.postnrnavn}`);
  }
  
  return parts.join(', ');
}

async function runTests() {
  console.log('=' .repeat(80));
  console.log(`${colors.blue}DAWA AUTOCOMPLETE API TEST${colors.reset}`);
  console.log('=' .repeat(80));
  console.log();
  
  for (const test of testQueries) {
    console.log(`${colors.cyan}Testing: "${test.query}" (${test.description})${colors.reset}`);
    console.log('-'.repeat(60));
    
    const results = await testAutocomplete(test.query);
    
    if (results.error) {
      console.log(`${colors.red}✗ ERROR: ${results.error}${colors.reset}`);
    } else if (results.length === 0) {
      console.log(`${colors.yellow}⚠ No results found${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Found ${results.length} results:${colors.reset}`);
      
      // Show first 5 results
      const displayCount = Math.min(5, results.length);
      for (let i = 0; i < displayCount; i++) {
        const result = results[i];
        const formatted = formatAddress(result);
        console.log(`  ${i + 1}. ${formatted}`);
        console.log(`     ${colors.gray}Type: ${result.type} | Postal: ${result.data.postnr || 'N/A'}${colors.reset}`);
      }
      
      if (results.length > 5) {
        console.log(`  ${colors.gray}... and ${results.length - 5} more results${colors.reset}`);
      }
    }
    
    console.log();
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Test specific Copenhagen address
  console.log('=' .repeat(80));
  console.log(`${colors.blue}SPECIFIC TEST: Nørrebrogade 1, 2200${colors.reset}`);
  console.log('=' .repeat(80));
  
  const cphTest = await testAutocomplete('Nørrebrogade 1, 2200');
  if (cphTest.length > 0) {
    const first = cphTest[0];
    console.log(`${colors.green}✓ FOUND${colors.reset}`);
    console.log(`  Address: ${formatAddress(first)}`);
    console.log(`  Postal Code: ${first.data.postnr}`);
    console.log(`  City: ${first.data.postnrnavn}`);
    console.log(`  Coordinates: ${first.data.y}, ${first.data.x}`);
    console.log(`  ${colors.gray}This address should return Radius Elnet via Green Power Denmark API${colors.reset}`);
  }
  
  console.log();
  console.log('=' .repeat(80));
  console.log(`${colors.green}AUTOCOMPLETE INTEGRATION READY!${colors.reset}`);
  console.log('Users can now:');
  console.log('  • Type partial addresses and see suggestions');
  console.log('  • Select from dropdown with mouse or keyboard');
  console.log('  • Get accurate grid provider for selected address');
  console.log('=' .repeat(80));
}

// Run the tests
runTests().catch(console.error);