import { DK1_MUNICIPALITIES, DK2_MUNICIPALITIES } from '../src/utils/denmarkRegions';

// All Danish municipalities (as of 2024)
const ALL_MUNICIPALITIES = [
  // Capital Region
  'albertslund', 'allerød', 'ballerup', 'bornholm', 'brøndby', 'dragør',
  'egedal', 'fredensborg', 'frederiksberg', 'frederikssund', 'furesø',
  'gentofte', 'gladsaxe', 'glostrup', 'gribskov', 'halsnæs', 'helsingør',
  'herlev', 'hillerød', 'hvidovre', 'høje-taastrup', 'hørsholm', 'ishøj',
  'københavn', 'lyngby-taarbæk', 'rudersdal', 'rødovre', 'tårnby', 'vallensbæk',
  
  // Zealand Region
  'greve', 'køge', 'lejre', 'roskilde', 'solrød', 'faxe', 'guldborgsund',
  'holbæk', 'kalundborg', 'lolland', 'næstved', 'odsherred', 'ringsted',
  'slagelse', 'sorø', 'stevns', 'vordingborg',
  
  // Southern Denmark Region
  'assens', 'billund', 'esbjerg', 'fanø', 'fredericia', 'faaborg-midtfyn',
  'haderslev', 'kerteminde', 'kolding', 'langeland', 'middelfart', 'nordfyns',
  'nyborg', 'odense', 'svendborg', 'sønderborg', 'tønder', 'varde', 'vejen',
  'vejle', 'ærø', 'aabenraa',
  
  // Central Jutland Region
  'favrskov', 'hedensted', 'herning', 'holstebro', 'horsens', 'ikast-brande',
  'lemvig', 'norddjurs', 'odder', 'randers', 'ringkøbing-skjern', 'samsø',
  'silkeborg', 'skanderborg', 'skive', 'struer', 'syddjurs', 'viborg', 'aarhus',
  
  // North Jutland Region
  'brønderslev', 'frederikshavn', 'hjørring', 'jammerbugt', 'læsø',
  'mariagerfjord', 'morsø', 'rebild', 'thisted', 'vesthimmerland', 'aalborg'
];

// Check which municipalities are not in either list
const mapped = new Set([...DK1_MUNICIPALITIES, ...DK2_MUNICIPALITIES]);
const missing = ALL_MUNICIPALITIES.filter(m => !mapped.has(m));

console.log('Missing municipalities:');
missing.forEach(m => console.log(`- ${m}`));

// Also check for ASCII variations
const asciiVariations: Record<string, string[]> = {
  'allerød': ['alleroed'],
  'brøndby': ['broendby'],
  'dragør': ['dragoer'],
  'furesø': ['furesoe'],
  'halsnæs': ['halsnaes'],
  'helsingør': ['helsingoer'],
  'hillerød': ['hilleroed'],
  'høje-taastrup': ['hoeje-taastrup'],
  'hørsholm': ['hoersholm'],
  'ishøj': ['ishoej'],
  'københavn': ['koebenhavn'],
  'køge': ['koege'],
  'lyngby-taarbæk': ['lyngby-taarbaek'],
  'næstved': ['naestved'],
  'rødovre': ['roedovre'],
  'solrød': ['solroed'],
  'sorø': ['soroe'],
  'tårnby': ['taarnby'],
  'vallensbæk': ['vallensbaek'],
  'ærø': ['aeroe', 'aerø'],
  'fanø': ['fanoe'],
  'hjørring': ['hjoerring'],
  'læsø': ['laesoe'],
  'morsø': ['morsoe'],
  'sønderborg': ['soenderborg'],
  'tønder': ['toender'],
  'ringkøbing-skjern': ['ringkoebing-skjern'],
  'samsø': ['samsoe'],
  'brønderslev': ['broenderslev'],
  'holbæk': ['holbaek']
};

console.log('\nMunicipalities that might need ASCII variations:');
ALL_MUNICIPALITIES.forEach(m => {
  if (m.includes('ø') || m.includes('å') || m.includes('æ')) {
    if (!asciiVariations[m]) {
      console.log(`- ${m} (no ASCII variation defined)`);
    }
  }
});