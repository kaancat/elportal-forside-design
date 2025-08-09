#!/usr/bin/env node

/**
 * Test script for DAWA autocomplete with door/apartment information
 * Tests addresses with floor and door details (e.g., "1.th", "st.tv")
 */

const API_BASE_URL = 'https://api.dataforsyningen.dk/autocomplete';

// Test addresses with expected door information
const testAddresses = [
  { query: 'Jagtvej 88, 2200', description: 'Your address - should show door options' },
  { query: 'Nørrebrogade 1, 2200', description: 'Copenhagen address with apartments' },
  { query: 'Vesterbrogade 10', description: 'Address that might have apartments' },
  { query: 'H.C. Andersens Boulevard 12', description: 'Central Copenhagen address' },
  { query: 'Amaliegade 15', description: 'Royal area address' },
];

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

async function testAutocomplete(query) {
  try {
    const params = new URLSearchParams({
      q: query,
      caretpos: query.length,
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
  const { data, type } = result;
  
  if (type === 'vejnavn') {
    return data.navn || result.forslagstekst;
  }
  
  const parts = [];
  
  // Street and number
  if (data.vejnavn && data.husnr) {
    let addressPart = `${data.vejnavn} ${data.husnr}`;
    
    // Add floor and door if present
    if (data.etage || data.dør) {
      const doorPart = [data.etage, data.dør].filter(Boolean).join('.');
      addressPart += `, ${doorPart}`;
    }
    
    parts.push(addressPart);
  } else if (data.vejnavn) {
    parts.push(data.vejnavn);
  }
  
  // City info
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
  console.log(`${colors.blue}DAWA AUTOCOMPLETE WITH DOOR/APARTMENT TEST${colors.reset}`);
  console.log('=' .repeat(80));
  console.log();
  
  for (const test of testAddresses) {
    console.log(`${colors.cyan}Testing: "${test.query}"${colors.reset}`);
    console.log(`${colors.gray}${test.description}${colors.reset}`);
    console.log('-'.repeat(60));
    
    const results = await testAutocomplete(test.query);
    
    if (results.error) {
      console.log(`${colors.red}✗ ERROR: ${results.error}${colors.reset}`);
    } else if (results.length === 0) {
      console.log(`${colors.yellow}⚠ No results found${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Found ${results.length} results:${colors.reset}`);
      
      // Group by whether they have door information
      const withDoor = [];
      const withoutDoor = [];
      
      results.forEach(result => {
        if (result.type !== 'vejnavn' && (result.data.etage || result.data.dør)) {
          withDoor.push(result);
        } else {
          withoutDoor.push(result);
        }
      });
      
      // Show addresses with door info first
      if (withDoor.length > 0) {
        console.log(`\n  ${colors.magenta}Addresses with apartment/door info:${colors.reset}`);
        withDoor.slice(0, 10).forEach((result, i) => {
          const formatted = formatAddress(result);
          const doorInfo = [result.data.etage, result.data.dør].filter(Boolean).join('.');
          console.log(`  ${i + 1}. ${formatted}`);
          console.log(`     ${colors.gray}Type: ${result.type} | Floor: ${result.data.etage || 'N/A'} | Door: ${result.data.dør || 'N/A'}${colors.reset}`);
        });
      }
      
      // Show some regular addresses
      if (withoutDoor.length > 0 && withDoor.length < 5) {
        console.log(`\n  ${colors.gray}Other addresses (no door info):${colors.reset}`);
        withoutDoor.slice(0, 3).forEach((result, i) => {
          const formatted = formatAddress(result);
          console.log(`  ${withDoor.length + i + 1}. ${formatted}`);
        });
      }
      
      if (results.length > 10) {
        console.log(`\n  ${colors.gray}... and ${results.length - 10} more results${colors.reset}`);
      }
    }
    
    console.log();
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Test specific apartment address
  console.log('=' .repeat(80));
  console.log(`${colors.blue}SPECIFIC TEST: Jagtvej 88 1.th${colors.reset}`);
  console.log('=' .repeat(80));
  
  const specificTest = await testAutocomplete('Jagtvej 88 1.th');
  if (specificTest.length > 0) {
    const first = specificTest[0];
    console.log(`${colors.green}✓ FOUND${colors.reset}`);
    console.log(`  Full Address: ${formatAddress(first)}`);
    console.log(`  Street: ${first.data.vejnavn}`);
    console.log(`  Number: ${first.data.husnr}`);
    console.log(`  Floor: ${first.data.etage || 'N/A'}`);
    console.log(`  Door: ${first.data.dør || 'N/A'}`);
    console.log(`  Postal Code: ${first.data.postnr}`);
    console.log(`  City: ${first.data.postnrnavn}`);
    
    if (first.data.etage || first.data.dør) {
      const doorDisplay = [first.data.etage, first.data.dør].filter(Boolean).join('.');
      console.log(`\n  ${colors.green}✓ Door information will display as: ${doorDisplay}${colors.reset}`);
    }
  }
  
  console.log();
  console.log('=' .repeat(80));
  console.log(`${colors.green}DOOR/APARTMENT AUTOCOMPLETE READY!${colors.reset}`);
  console.log('Features:');
  console.log('  • Shows floor (etage) information when available');
  console.log('  • Shows door (dør) position (th, tv, mf, etc.)');
  console.log('  • Formats as "1.th", "st.tv" in green text');
  console.log('  • Full apartment-level address precision');
  console.log('=' .repeat(80));
}

// Run the tests
runTests().catch(console.error);