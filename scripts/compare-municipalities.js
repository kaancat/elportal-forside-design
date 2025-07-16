// List of all 98 municipality IDs expected by react-denmark-map
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

// Our current mapping (values only)
const ourMunicipalities = [
  'koebenhavn', 'frederiksberg', 'ballerup', 'broendby', 'dragoer', 'gentofte',
  'gladsaxe', 'glostrup', 'herlev', 'albertslund', 'hvidovre', 'hoeje-taastrup',
  'lyngby-taarbaek', 'roedovre', 'ishoej', 'taarnby', 'vallensbaek', 'furesoe',
  'alleroed', 'fredensborg', 'helsingoer', 'hilleroed', 'hoersholm', 'rudersdal',
  'egedal', 'frederikssund', 'greve', 'koege', 'halsnaes', 'roskilde', 'solroed',
  'gribskov', 'odsherred', 'holbaek', 'faxe', 'kalundborg', 'ringsted', 'soroe',
  'stevns', 'slagelse', 'lejre', 'lolland', 'naestved', 'vordingborg', 'bornholm',
  'middelfart', 'assens', 'faaborg-midtfyn', 'kerteminde', 'nyborg', 'odense',
  'svendborg', 'nordfyn', 'langeland', 'aeroe', 'billund', 'haderslev',
  'soenderborg', 'toender', 'aabenraa', 'esbjerg', 'fanoe', 'varde', 'vejen',
  'ribe', 'fredericia', 'horsens', 'kolding', 'vejle', 'herning', 'holstebro',
  'lemvig', 'struer', 'syddjurs', 'norddjurs', 'favrskov', 'odder', 'randers',
  'silkeborg', 'samsoe', 'skanderborg', 'aarhus', 'ikast-brande',
  'ringkoebing-skjern', 'hedensted', 'morsoe', 'skive', 'thisted', 'viborg',
  'broenderslev', 'frederikshavn', 'vesthimmerlands', 'laesoe', 'rebild',
  'mariagerfjord', 'jammerbugt', 'aalborg', 'hjoerring'
];

console.log('Comparing municipality names...\n');
console.log(`Library expects: ${libraryMunicipalities.length} municipalities`);
console.log(`We have mapped: ${ourMunicipalities.length} municipalities\n`);

// Find municipalities that we have but library doesn't expect
const notInLibrary = ourMunicipalities.filter(m => !libraryMunicipalities.includes(m));
console.log('❌ Municipalities in our mapping NOT found in library:');
if (notInLibrary.length > 0) {
  notInLibrary.forEach(m => {
    console.log(`  - "${m}"`);
    // Find similar names
    const similar = libraryMunicipalities.filter(lib => 
      lib.includes(m.substring(0, 4)) || m.includes(lib.substring(0, 4))
    );
    if (similar.length > 0) {
      console.log(`    → Possible match: ${similar.join(', ')}`);
    }
  });
} else {
  console.log('  None! ✓');
}

// Find municipalities that library expects but we don't have
const missingFromOurs = libraryMunicipalities.filter(m => !ourMunicipalities.includes(m));
console.log('\n✅ Municipalities expected by library but MISSING from our mapping:');
if (missingFromOurs.length > 0) {
  missingFromOurs.forEach(m => console.log(`  - "${m}"`));
} else {
  console.log('  None! All municipalities are mapped correctly.');
}

// Check for potential typos or case mismatches
console.log('\n🔍 Checking for potential typos or mismatches...');
notInLibrary.forEach(ourName => {
  libraryMunicipalities.forEach(libName => {
    if (ourName.toLowerCase() === libName.toLowerCase() && ourName !== libName) {
      console.log(`  Case mismatch: "${ourName}" should be "${libName}"`);
    }
  });
});

console.log('\n📊 Summary:');
console.log(`  - Incorrect names in our mapping: ${notInLibrary.length}`);
console.log(`  - Missing from our mapping: ${missingFromOurs.length}`);
console.log(`  - Total issues to fix: ${notInLibrary.length + missingFromOurs.length}`);