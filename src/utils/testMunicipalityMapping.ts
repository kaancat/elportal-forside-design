#!/usr/bin/env ts-node

/**
 * Test script to verify municipality mapping is working correctly
 */

import { 
  getMunicipalityByCode, 
  getMunicipalityByAsciiName,
  getMunicipalityByDanishName,
  MUNICIPALITY_MAPPINGS 
} from './municipality/municipalityMappingFix';

console.log('=== Municipality Mapping Test ===\n');

// Test 1: Verify all mappings are complete
console.log('1. VERIFYING ALL MAPPINGS ARE COMPLETE');
console.log(`Total municipalities: ${MUNICIPALITY_MAPPINGS.length}`);

// Test 2: Test code lookups
console.log('\n2. TESTING CODE LOOKUPS');
const testCodes = ['101', '492', '751', '860'];
testCodes.forEach(code => {
  const mapping = getMunicipalityByCode(code);
  if (mapping) {
    console.log(`✓ Code ${code}: ${mapping.danishName} → ${mapping.asciiName}`);
  } else {
    console.log(`✗ Code ${code}: NOT FOUND`);
  }
});

// Test 3: Test ASCII name lookups (what react-denmark-map uses)
console.log('\n3. TESTING ASCII NAME LOOKUPS (react-denmark-map)');
const testAsciiNames = ['koebenhavn', 'aeroe', 'aarhus', 'hjoerring'];
testAsciiNames.forEach(name => {
  const mapping = getMunicipalityByAsciiName(name);
  if (mapping) {
    console.log(`✓ ASCII "${name}": Code ${mapping.code}, Danish: ${mapping.danishName}`);
  } else {
    console.log(`✗ ASCII "${name}": NOT FOUND`);
  }
});

// Test 4: Test Danish name lookups (what API returns)
console.log('\n4. TESTING DANISH NAME LOOKUPS (API data)');
const testDanishNames = ['København', 'Ærø', 'Aarhus', 'Hjørring'];
testDanishNames.forEach(name => {
  const mapping = getMunicipalityByDanishName(name);
  if (mapping) {
    console.log(`✓ Danish "${name}": Code ${mapping.code}, ASCII: ${mapping.asciiName}`);
  } else {
    console.log(`✗ Danish "${name}": NOT FOUND`);
  }
});

// Test 5: Simulate API data mapping
console.log('\n5. SIMULATING API DATA MAPPING');
const simulatedApiData = [
  { municipalityCode: '101', municipalityName: 'København', totalConsumption: 1000 },
  { municipalityCode: '492', municipalityName: 'Ærø', totalConsumption: 50 },
  { municipalityCode: '751', municipalityName: 'Aarhus', totalConsumption: 800 },
];

simulatedApiData.forEach(apiItem => {
  const mapping = getMunicipalityByCode(apiItem.municipalityCode);
  if (mapping) {
    console.log(`✓ ${apiItem.municipalityName} (${apiItem.municipalityCode}) → Map ID: "${mapping.asciiName}"`);
  } else {
    console.log(`✗ ${apiItem.municipalityName} (${apiItem.municipalityCode}) → MAPPING FAILED`);
  }
});

// Test 6: Check for duplicates
console.log('\n6. CHECKING FOR DUPLICATES');
const codeSet = new Set(MUNICIPALITY_MAPPINGS.map(m => m.code));
const asciiSet = new Set(MUNICIPALITY_MAPPINGS.map(m => m.asciiName));
const danishSet = new Set(MUNICIPALITY_MAPPINGS.map(m => m.danishName));

console.log(`Unique codes: ${codeSet.size} (should be ${MUNICIPALITY_MAPPINGS.length})`);
console.log(`Unique ASCII names: ${asciiSet.size} (should be ${MUNICIPALITY_MAPPINGS.length})`);
console.log(`Unique Danish names: ${danishSet.size} (should be ${MUNICIPALITY_MAPPINGS.length})`);

if (codeSet.size === MUNICIPALITY_MAPPINGS.length && 
    asciiSet.size === MUNICIPALITY_MAPPINGS.length && 
    danishSet.size === MUNICIPALITY_MAPPINGS.length) {
  console.log('✓ No duplicates found');
} else {
  console.log('✗ DUPLICATES DETECTED!');
}

console.log('\n=== Test Complete ===');