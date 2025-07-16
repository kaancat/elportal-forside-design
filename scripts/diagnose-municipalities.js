/**
 * Diagnostic script to identify mismatched municipality names
 * between our mapping and react-denmark-map
 */

// Import the react-denmark-map data
const municipalitiesData = require('@lorenzorapetti/react-denmark-map/dist/municipalities.json');

// Our current mapping
const MUNICIPALITY_CODE_TO_NAME = {
  // Region Hovedstaden
  '101': 'koebenhavn',
  '147': 'frederiksberg',
  '151': 'ballerup',
  '153': 'broendby',
  '155': 'dragoer',
  '157': 'gentofte',
  '159': 'gladsaxe',
  '161': 'glostrup',
  '163': 'herlev',
  '165': 'albertslund',
  '167': 'hvidovre',
  '169': 'hoeje-taastrup',
  '173': 'lyngby-taarbaek',
  '175': 'roedovre',
  '183': 'ishoej',
  '185': 'taarnby',
  '187': 'vallensbaek',
  '190': 'furesoe',
  '201': 'alleroed',
  '210': 'fredensborg',
  '217': 'helsingoer',
  '219': 'hilleroed',
  '223': 'hoersholm',
  '230': 'rudersdal',
  '240': 'egedal',
  '250': 'frederikssund',
  '253': 'greve',
  '259': 'koege',
  '260': 'halsnaes',
  '265': 'roskilde',
  '269': 'solroed',
  '270': 'gribskov',
  
  // Region Sjælland
  '306': 'odsherred',
  '316': 'holbaek',
  '320': 'faxe',
  '326': 'kalundborg',
  '329': 'ringsted',
  '330': 'soroe',
  '336': 'stevns',
  '340': 'slagelse',
  '350': 'naestved',
  '360': 'lolland',
  '370': 'guldborgsund',
  '376': 'vordingborg',
  '390': 'bornholm',
  
  // Region Syddanmark
  '400': 'middelfart',
  '410': 'assens',
  '420': 'faaborg-midtfyn',
  '430': 'kerteminde',
  '440': 'nyborg',
  '450': 'odense',
  '461': 'svendborg',
  '479': 'nordfyns',
  '480': 'langeland',
  '482': 'aeroe',
  '492': 'billund',
  '510': 'haderslev',
  '530': 'soenderborg',
  '540': 'toender',
  '550': 'aabenraa',
  '561': 'esbjerg',
  '563': 'fanoe',
  '573': 'varde',
  '575': 'vejen',
  '580': 'ribe',
  '607': 'fredericia',
  '615': 'horsens',
  '621': 'kolding',
  '630': 'vejle',
  
  // Region Midtjylland
  '657': 'herning',
  '661': 'holstebro',
  '665': 'lemvig',
  '671': 'struer',
  '706': 'syddjurs',
  '707': 'norddjurs',
  '710': 'favrskov',
  '727': 'odder',
  '730': 'randers',
  '740': 'silkeborg',
  '741': 'samsoe',
  '746': 'skanderborg',
  '751': 'aarhus',
  '756': 'ikast-brande',
  '760': 'ringkoebing-skjern',
  '766': 'hedensted',
  '779': 'skive',
  '787': 'thisted',
  '791': 'viborg',
  
  // Region Nordjylland
  '810': 'broenderslev',
  '813': 'frederikshavn',
  '820': 'vesthimmerlands',
  '825': 'laesoe',
  '840': 'rebild',
  '846': 'mariagerfjord',
  '849': 'jammerbugt',
  '851': 'aalborg',
  '860': 'hjoerring'
};

console.log('Diagnosing municipality name mismatches...\n');

// Get all municipality names from react-denmark-map
const libraryMunicipalities = new Set();
if (municipalitiesData && municipalitiesData.features) {
  municipalitiesData.features.forEach(feature => {
    if (feature.properties && feature.properties.name) {
      libraryMunicipalities.add(feature.properties.name.toLowerCase());
    }
  });
}

console.log(`Total municipalities in react-denmark-map: ${libraryMunicipalities.size}`);
console.log(`Total municipalities in our mapping: ${Object.keys(MUNICIPALITY_CODE_TO_NAME).length}\n`);

// Check for mismatches
const mismatches = [];
const notInLibrary = [];

for (const [code, name] of Object.entries(MUNICIPALITY_CODE_TO_NAME)) {
  if (!libraryMunicipalities.has(name)) {
    notInLibrary.push({ code, ourName: name });
  }
}

// Find what names the library has that we don't
const ourNames = new Set(Object.values(MUNICIPALITY_CODE_TO_NAME));
const libraryOnly = [];

libraryMunicipalities.forEach(libName => {
  if (!ourNames.has(libName)) {
    libraryOnly.push(libName);
  }
});

// Print results
if (notInLibrary.length > 0) {
  console.log('❌ Municipality names in our mapping but NOT found in react-denmark-map:');
  console.log('(These are causing the gray areas on the map)\n');
  notInLibrary.forEach(({ code, ourName }) => {
    console.log(`  Code ${code}: "${ourName}"`);
    
    // Try to find similar names
    const similar = Array.from(libraryMunicipalities).filter(libName => 
      libName.includes(ourName.substring(0, 4)) || 
      ourName.includes(libName.substring(0, 4))
    );
    
    if (similar.length > 0) {
      console.log(`    Possible matches: ${similar.join(', ')}`);
    }
  });
  console.log('');
}

if (libraryOnly.length > 0) {
  console.log('✅ Municipality names in react-denmark-map but NOT in our mapping:');
  console.log('(We might be missing these municipalities)\n');
  libraryOnly.forEach(name => {
    console.log(`  "${name}"`);
  });
  console.log('');
}

// Print all library municipality names for reference
console.log('\n📋 All municipality names expected by react-denmark-map:');
const sortedLibraryNames = Array.from(libraryMunicipalities).sort();
sortedLibraryNames.forEach((name, index) => {
  if (index % 3 === 0) process.stdout.write('\n  ');
  process.stdout.write(name.padEnd(25));
});
console.log('\n');

// Summary
console.log('\n📊 Summary:');
console.log(`  - Municipalities with incorrect names: ${notInLibrary.length}`);
console.log(`  - Municipalities possibly missing from our mapping: ${libraryOnly.length}`);
console.log(`  - Total expected municipalities: 98`);