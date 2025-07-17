#!/usr/bin/env ts-node

/**
 * Debug script to identify municipality mapping issues between API and react-denmark-map
 */

import { MUNICIPALITY_CODE_TO_NAME, MUNICIPALITY_NAME_TO_CODE } from './municipality/municipalityCodeMapping';

// Helper function to normalize Danish characters to ASCII
function normalizeToAscii(name: string): string {
  return name
    .toLowerCase()
    .replace(/ø/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'aa')
    .replace(/ö/g, 'oe')
    .replace(/ä/g, 'ae')
    .replace(/ü/g, 'ue')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// These are the municipality names that react-denmark-map expects based on the minified source
// I've extracted some visible ones from the output
const REACT_DENMARK_MAP_MUNICIPALITIES = [
  'langeland', 'aabenraa', 'aeroe', 'soenderborg', 'svendborg', 'faaborg-midtfyn',
  'toender', 'haderslev', 'assens', 'nyborg', 'esbjerg', 'vejen', 'koebenhavn',
  'frederiksberg', 'ballerup', 'broendby', 'dragoer', 'gentofte', 'gladsaxe',
  'glostrup', 'herlev', 'albertslund', 'hvidovre', 'hoeje-taastrup', 'lyngby-taarbaek',
  'roedovre', 'ishoej', 'taarnby', 'vallensbaek', 'furesoe', 'alleroed',
  'fredensborg', 'helsingoer', 'hilleroed', 'hoersholm', 'rudersdal', 'egedal',
  'frederikssund', 'greve', 'koege', 'halsnaes', 'roskilde', 'solroed', 'gribskov',
  'odsherred', 'holbaek', 'faxe', 'kalundborg', 'ringsted', 'soroe', 'stevns',
  'slagelse', 'lejre', 'lolland', 'naestved', 'guldborgsund', 'vordingborg',
  'bornholm', 'middelfart', 'kerteminde', 'odense', 'nordfyn', 'billund',
  'fanoe', 'varde', 'fredericia', 'horsens', 'kolding', 'vejle', 'herning',
  'holstebro', 'lemvig', 'struer', 'syddjurs', 'norddjurs', 'favrskov', 'odder',
  'randers', 'silkeborg', 'samsoe', 'skanderborg', 'aarhus', 'ikast-brande',
  'ringkoebing-skjern', 'hedensted', 'morsoe', 'skive', 'thisted', 'viborg',
  'broenderslev', 'frederikshavn', 'vesthimmerlands', 'laesoe', 'rebild',
  'mariagerfjord', 'jammerbugt', 'aalborg', 'hjoerring'
];

async function debugMunicipalityMapping() {
  console.log('=== Municipality Mapping Debug Report ===\n');

  // 1. Check our mapping coverage
  console.log('1. CHECKING OUR MAPPING COVERAGE');
  console.log(`Total municipalities in our mapping: ${Object.keys(MUNICIPALITY_CODE_TO_NAME).length}`);
  console.log(`Total expected by react-denmark-map: ${REACT_DENMARK_MAP_MUNICIPALITIES.length}\n`);

  // 2. Check for municipalities in react-denmark-map that we don't have
  console.log('2. MUNICIPALITIES IN REACT-DENMARK-MAP NOT IN OUR MAPPING:');
  const missingInOurMapping = REACT_DENMARK_MAP_MUNICIPALITIES.filter(
    name => !MUNICIPALITY_NAME_TO_CODE[name]
  );
  if (missingInOurMapping.length > 0) {
    missingInOurMapping.forEach(name => {
      console.log(`  - ${name}`);
    });
  } else {
    console.log('  None - all react-denmark-map municipalities are in our mapping ✓');
  }
  console.log();

  // 3. Check for municipalities in our mapping that react-denmark-map doesn't have
  console.log('3. MUNICIPALITIES IN OUR MAPPING NOT IN REACT-DENMARK-MAP:');
  const ourMunicipalityNames = Object.values(MUNICIPALITY_CODE_TO_NAME);
  const extraInOurMapping = ourMunicipalityNames.filter(
    name => !REACT_DENMARK_MAP_MUNICIPALITIES.includes(name)
  );
  if (extraInOurMapping.length > 0) {
    extraInOurMapping.forEach(name => {
      const code = MUNICIPALITY_NAME_TO_CODE[name];
      console.log(`  - ${name} (code: ${code})`);
    });
  } else {
    console.log('  None - all our municipalities are in react-denmark-map ✓');
  }
  console.log();

  // 4. Fetch data from API and check mapping
  console.log('4. FETCHING DATA FROM API TO CHECK LIVE MAPPING...');
  try {
    const response = await fetch('http://localhost:5173/api/consumption-map?consumerType=all&aggregation=latest&view=24h');
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.log('  ERROR: No data returned from API');
      return;
    }

    console.log(`  API returned ${data.data.length} municipalities\n`);

    // Check each municipality from API
    console.log('5. CHECKING API MUNICIPALITY MAPPING:');
    const unmappedMunicipalities: any[] = [];
    const mappedMunicipalities: any[] = [];
    const nameNormalizationIssues: any[] = [];

    data.data.forEach((municipality: any) => {
      const { municipalityCode, municipalityName } = municipality;
      const mappedName = MUNICIPALITY_CODE_TO_NAME[municipalityCode];
      const normalizedApiName = normalizeToAscii(municipalityName);

      if (!mappedName) {
        unmappedMunicipalities.push({ 
          code: municipalityCode, 
          name: municipalityName,
          normalizedName: normalizedApiName,
          issue: 'No mapping for this code'
        });
      } else if (!REACT_DENMARK_MAP_MUNICIPALITIES.includes(mappedName)) {
        // Check if normalization would fix it
        if (REACT_DENMARK_MAP_MUNICIPALITIES.includes(normalizedApiName)) {
          nameNormalizationIssues.push({
            code: municipalityCode,
            apiName: municipalityName,
            currentMapping: mappedName,
            shouldBe: normalizedApiName
          });
        } else {
          unmappedMunicipalities.push({ 
            code: municipalityCode, 
            name: municipalityName, 
            mappedTo: mappedName,
            normalizedName: normalizedApiName,
            issue: 'Mapped name not in react-denmark-map' 
          });
        }
      } else {
        mappedMunicipalities.push({ code: municipalityCode, name: municipalityName, mappedTo: mappedName });
      }
    });

    console.log(`  Successfully mapped: ${mappedMunicipalities.length}`);
    console.log(`  Failed to map: ${unmappedMunicipalities.length}`);
    console.log(`  Name normalization issues: ${nameNormalizationIssues.length}\n`);

    if (nameNormalizationIssues.length > 0) {
      console.log('6. NAME NORMALIZATION ISSUES (MAIN PROBLEM!):');
      console.log('   The API returns Danish characters but react-denmark-map expects ASCII');
      console.log('   Current mapping vs what it should be:\n');
      nameNormalizationIssues.forEach(m => {
        console.log(`  - Code: ${m.code}`);
        console.log(`    API returns: "${m.apiName}"`);  
        console.log(`    Currently mapped to: "${m.currentMapping}"`);  
        console.log(`    Should be mapped to: "${m.shouldBe}"\n`);
      });
    }

    if (unmappedMunicipalities.length > 0) {
      console.log('\n7. OTHER UNMAPPED MUNICIPALITIES:');
      unmappedMunicipalities.forEach(m => {
        console.log(`  - Code: ${m.code}, Name: "${m.name}"`);
        console.log(`    Normalized: "${m.normalizedName}", Issue: ${m.issue}`);
        if (m.mappedTo) {
          console.log(`    Currently mapped to: "${m.mappedTo}"`);
        }
      });
    }

    // Show some successful mappings for reference
    console.log('\n8. SAMPLE SUCCESSFUL MAPPINGS:');
    mappedMunicipalities.slice(0, 5).forEach(m => {
      console.log(`  - Code: ${m.code}, API Name: "${m.name}" → Map ID: "${m.mappedTo}" ✓`);
    });

    // Generate corrected mapping
    console.log('\n9. SUGGESTED MAPPING CORRECTIONS:');
    console.log('   Copy this to replace the MUNICIPALITY_CODE_TO_NAME object:\n');
    console.log('export const MUNICIPALITY_CODE_TO_NAME: Record<string, string> = {');
    
    // Group by region for readability
    const regions = {
      'Hovedstaden': ['101', '147', '151', '153', '155', '157', '159', '161', '163', '165', '167', '169', '173', '175', '183', '185', '187', '190', '201', '210', '217', '219', '223', '230', '240', '250', '253', '259', '260', '265', '269', '270'],
      'Sjælland': ['306', '316', '320', '326', '329', '330', '336', '340', '350', '360', '370', '376', '390', '400'],
      'Syddanmark': ['410', '420', '430', '440', '450', '461', '479', '480', '482', '492', '510', '530', '540', '550', '580', '561', '563', '573', '575', '607', '615', '621', '630'],
      'Midtjylland': ['657', '661', '665', '671', '706', '707', '710', '727', '730', '740', '741', '746', '751', '756', '760', '766', '773', '779', '787', '791'],
      'Nordjylland': ['810', '813', '820', '825', '840', '846', '849', '851', '860']
    };

    Object.entries(regions).forEach(([region, codes]) => {
      console.log(`  // Region ${region}`);
      codes.forEach(code => {
        const apiMunicipality = data.data.find((m: any) => m.municipalityCode === code);
        if (apiMunicipality) {
          const normalizedName = normalizeToAscii(apiMunicipality.municipalityName);
          console.log(`  '${code}': '${normalizedName}',`);
        }
      });
      console.log('');
    });
    
    console.log('};');

  } catch (error) {
    console.log(`  ERROR fetching API data: ${error}`);
    console.log('  Make sure the dev server is running (npm run dev)');
  }
}

// Run the debug script
debugMunicipalityMapping().catch(console.error);