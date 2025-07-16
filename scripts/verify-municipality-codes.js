/**
 * Script to verify municipality codes by fetching actual data from the API
 * and comparing with our mapping and react-denmark-map expectations
 */

import fetch from 'node-fetch';

// Import our current mapping
import { MUNICIPALITY_CODE_TO_NAME } from '../src/utils/municipality/municipalityCodeMapping.js';

// Expected municipalities by react-denmark-map
const libraryMunicipalities = [
  'aabenraa', 'aalborg', 'aarhus', 'aeroe', 'albertslund', 'alleroed', 'assens',
  'ballerup', 'billund', 'bornholm', 'broendby', 'broenderslev', 'dragoer',
  'egedal', 'esbjerg', 'faaborg-midtfyn', 'fanoe', 'favrskov', 'faxe',
  'fredensborg', 'fredericia', 'frederiksberg', 'frederikshavn', 'frederikssund',
  'furesoe', 'gentofte', 'gladsaxe', 'glostrup', 'greve', 'gribskov',
  'guldborgsund', 'haderslev', 'halsnaes', 'hedensted', 'helsingoer', 'herlev',
  'herning', 'hilleroed', 'hjoerring', 'hoeje-taastrup', 'hoersholm', 'holbaek',
  'holstebro', 'horsens', 'hvidovre', 'ikast-brande', 'ishoej', 'jammerbugt',
  'kalundborg', 'kerteminde', 'koebenhavn', 'koege', 'kolding', 'laesoe',
  'langeland', 'lejre', 'lemvig', 'lolland', 'lyngby-taarbaek', 'mariagerfjord',
  'middelfart', 'morsoe', 'naestved', 'norddjurs', 'nordfyn', 'nyborg', 'odder',
  'odense', 'odsherred', 'randers', 'rebild', 'ringkoebing-skjern', 'ringsted',
  'roedovre', 'roskilde', 'rudersdal', 'samsoe', 'silkeborg', 'skanderborg',
  'skive', 'slagelse', 'soenderborg', 'solroed', 'soroe', 'stevns', 'struer',
  'svendborg', 'syddjurs', 'thisted', 'toender', 'taarnby', 'vallensbaek',
  'varde', 'vejen', 'vejle', 'vesthimmerlands', 'viborg', 'vordingborg'
];

async function fetchMunicipalityData() {
  try {
    console.log('Fetching municipality data from API...\n');
    
    // Use local dev server
    const response = await fetch('http://localhost:8080/api/consumption-map?consumerType=all&aggregation=latest&view=24h');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No municipality data received from API');
    }
    
    console.log(`Received data for ${data.data.length} municipalities from API\n`);
    
    // Group municipalities by what we're mapping them to
    const apiMunicipalities = new Map();
    const unmappedCodes = [];
    
    data.data.forEach(municipality => {
      const code = municipality.municipalityCode;
      const apiName = municipality.municipalityName;
      const mappedName = MUNICIPALITY_CODE_TO_NAME[code];
      
      if (mappedName) {
        apiMunicipalities.set(code, {
          apiName,
          mappedName,
          hasData: true
        });
      } else {
        unmappedCodes.push({ code, name: apiName });
      }
    });
    
    // Check for issues
    console.log('🔍 VERIFICATION RESULTS:\n');
    
    // 1. Check unmapped codes
    if (unmappedCodes.length > 0) {
      console.log('❌ Municipality codes from API NOT in our mapping:');
      unmappedCodes.forEach(({ code, name }) => {
        console.log(`   Code ${code}: "${name}"`);
      });
      console.log('');
    }
    
    // 2. Check mapped but not matching library expectations
    const notInLibrary = [];
    apiMunicipalities.forEach((data, code) => {
      if (!libraryMunicipalities.includes(data.mappedName)) {
        notInLibrary.push({ code, ...data });
      }
    });
    
    if (notInLibrary.length > 0) {
      console.log('❌ Municipalities mapped to names NOT expected by react-denmark-map:');
      notInLibrary.forEach(({ code, apiName, mappedName }) => {
        console.log(`   Code ${code}: API="${apiName}", Mapped="${mappedName}"`);
        // Find similar names in library
        const similar = libraryMunicipalities.filter(lib => 
          lib.includes(mappedName.substring(0, 4)) || 
          mappedName.includes(lib.substring(0, 4))
        );
        if (similar.length > 0) {
          console.log(`     → Possible match: ${similar.join(', ')}`);
        }
      });
      console.log('');
    }
    
    // 3. Check codes in our mapping but not returned by API
    const missingFromApi = [];
    Object.entries(MUNICIPALITY_CODE_TO_NAME).forEach(([code, name]) => {
      if (!apiMunicipalities.has(code)) {
        missingFromApi.push({ code, name });
      }
    });
    
    if (missingFromApi.length > 0) {
      console.log('⚠️  Municipality codes in our mapping but NOT returned by API:');
      missingFromApi.forEach(({ code, name }) => {
        console.log(`   Code ${code}: "${name}"`);
      });
      console.log('');
    }
    
    // 4. List all API municipalities for reference
    console.log('📋 All municipalities from API:\n');
    const sortedMunicipalities = Array.from(data.data).sort((a, b) => 
      a.municipalityCode.localeCompare(b.municipalityCode)
    );
    
    sortedMunicipalities.forEach(m => {
      const mapped = MUNICIPALITY_CODE_TO_NAME[m.municipalityCode];
      const inLibrary = mapped && libraryMunicipalities.includes(mapped);
      const status = !mapped ? '❌ Not mapped' : 
                     !inLibrary ? '⚠️  Wrong name' : 
                     '✅';
      console.log(`   ${m.municipalityCode}: "${m.municipalityName}" → ${mapped || 'NOT MAPPED'} ${status}`);
    });
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total from API: ${data.data.length}`);
    console.log(`   Unmapped codes: ${unmappedCodes.length}`);
    console.log(`   Wrong names: ${notInLibrary.length}`);
    console.log(`   Missing from API: ${missingFromApi.length}`);
    console.log(`   Expected by library: ${libraryMunicipalities.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure the development server is running (npm run dev)');
  }
}

// Run the verification
fetchMunicipalityData();