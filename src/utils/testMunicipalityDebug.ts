/**
 * Debug script to test municipality mapping
 */

import { 
  MUNICIPALITY_MAPPINGS,
  ASCII_NAME_TO_MAPPING,
  DANISH_NAME_TO_MAPPING,
  NORMALIZED_NAME_TO_MAPPING,
  getMunicipalityByAsciiName
} from './municipality/municipalityMappingFix';

export function debugMunicipalityMapping() {
  console.log('=== MUNICIPALITY MAPPING DEBUG ===');
  
  // Test some known problematic municipalities
  const testNames = [
    'københavn',
    'koebenhavn',
    'København',
    'ærø',
    'aeroe',
    'Ærø',
    'sønderborg',
    'soenderborg',
    'Sønderborg',
    'høje-taastrup',
    'hoeje-taastrup',
    'Høje-Taastrup'
  ];
  
  console.log('\nTesting municipality name lookups:');
  testNames.forEach(name => {
    const result = getMunicipalityByAsciiName(name);
    console.log(`"${name}" -> ${result ? `Found: ${result.danishName} (${result.code})` : 'NOT FOUND'}`);
  });
  
  console.log('\n\nAll ASCII mappings (first 10):');
  Array.from(ASCII_NAME_TO_MAPPING.entries()).slice(0, 10).forEach(([key, value]) => {
    console.log(`  "${key}" -> ${value.danishName} (${value.code})`);
  });
  
  console.log('\n\nAll Danish mappings (first 10):');
  Array.from(DANISH_NAME_TO_MAPPING.entries()).slice(0, 10).forEach(([key, value]) => {
    console.log(`  "${key}" -> ${value.danishName} (${value.code})`);
  });
  
  console.log('\n\nAll Normalized mappings (first 10):');
  Array.from(NORMALIZED_NAME_TO_MAPPING.entries()).slice(0, 10).forEach(([key, value]) => {
    console.log(`  "${key}" -> ${value.danishName} (${value.code})`);
  });
  
  console.log('\n\nTotal mappings:');
  console.log(`  ASCII mappings: ${ASCII_NAME_TO_MAPPING.size}`);
  console.log(`  Danish mappings: ${DANISH_NAME_TO_MAPPING.size}`);
  console.log(`  Normalized mappings: ${NORMALIZED_NAME_TO_MAPPING.size}`);
  console.log(`  Total municipalities: ${MUNICIPALITY_MAPPINGS.length}`);
}

// Export for use in browser console
(window as any).debugMunicipalityMapping = debugMunicipalityMapping;