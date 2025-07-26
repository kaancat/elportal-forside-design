import { getMunicipalityRegion } from './denmarkRegions';

// List of all Danish municipalities as they might appear in react-denmark-map
const ALL_MUNICIPALITIES = [
  // With special characters
  'københavn', 'ærø', 'høje-taastrup', 'hørsholm', 'rødovre', 'læsø',
  'brønderslev', 'hjørring', 'mariagerfjord', 'rebild', 'vesthimmerland',
  'morsø', 'thisted', 'brøndby', 'dragør', 'tårnby', 'vallensbæk',
  'allerød', 'egedal', 'fredensborg', 'frederikssund', 'furesø',
  'gribskov', 'halsnæs', 'helsingør', 'hillerød', 'hørsholm',
  'lyngby-taarbæk', 'rudersdal', 'holbæk', 'kalundborg', 'odsherred',
  'sorø', 'slagelse', 'køge', 'ringsted', 'solrød', 'stevns',
  'faxe', 'greve', 'næstved', 'vordingborg', 'bornholm', 'guldborgsund',
  'lolland', 'aabenraa', 'haderslev', 'sønderborg', 'tønder',
  'billund', 'esbjerg', 'fanø', 'varde', 'vejen', 'fredericia',
  'kolding', 'vejle', 'herning', 'holstebro', 'ikast-brande',
  'lemvig', 'ringkøbing-skjern', 'skive', 'struer', 'viborg',
  'favrskov', 'hedensted', 'horsens', 'norddjurs', 'odder',
  'randers', 'samsø', 'silkeborg', 'skanderborg', 'syddjurs',
  'aarhus', 'aalborg', 'jammerbugt', 'frederikshavn', 'hjørring',
  'assens', 'faaborg-midtfyn', 'kerteminde', 'langeland', 'middelfart',
  'nordfyns', 'nyborg', 'odense', 'svendborg', 'ærø',
  // Without special characters (ASCII versions)
  'koebenhavn', 'aeroe', 'hoeje-taastrup', 'hoersholm', 'roedovre', 'laesoe',
  'broenderslev', 'hjoerring', 'mariagerfjord', 'rebild', 'vesthimmerland',
  'morsoe', 'thisted', 'broendby', 'dragoer', 'taarnby', 'vallensbaek',
  'alleroed', 'egedal', 'fredensborg', 'frederikssund', 'furesoe',
  'gribskov', 'halsnaes', 'helsingoer', 'hilleroed', 'hoersholm',
  'lyngby-taarbaek', 'rudersdal', 'holbaek', 'kalundborg', 'odsherred',
  'soroe', 'slagelse', 'koege', 'ringsted', 'solroed', 'stevns',
  'faxe', 'greve', 'naestved', 'vordingborg', 'bornholm', 'guldborgsund',
  'lolland', 'aabenraa', 'haderslev', 'soenderborg', 'toender',
  'billund', 'esbjerg', 'fanoe', 'varde', 'vejen', 'fredericia',
  'kolding', 'vejle', 'herning', 'holstebro', 'ikast-brande',
  'lemvig', 'ringkoebing-skjern', 'skive', 'struer', 'viborg',
  'favrskov', 'hedensted', 'horsens', 'norddjurs', 'odder',
  'randers', 'samsoe', 'silkeborg', 'skanderborg', 'syddjurs',
  'aarhus', 'aalborg', 'jammerbugt', 'frederikshavn', 'hjoerring',
  'assens', 'faaborg-midtfyn', 'kerteminde', 'langeland', 'middelfart',
  'nordfyns', 'nyborg', 'odense', 'svendborg', 'aeroe'
];

export function debugMunicipalityRegions() {
  const unmatched: string[] = [];
  const dk1Matches: string[] = [];
  const dk2Matches: string[] = [];

  ALL_MUNICIPALITIES.forEach(municipality => {
    const region = getMunicipalityRegion(municipality);
    if (!region) {
      unmatched.push(municipality);
    } else if (region === 'DK1') {
      dk1Matches.push(municipality);
    } else {
      dk2Matches.push(municipality);
    }
  });

  console.log('=== MUNICIPALITY REGION DEBUG ===');
  console.log('\nUNMATCHED (will appear grey):', unmatched.length);
  unmatched.forEach(m => console.log(`  - ${m}`));
  
  console.log('\nDK1 matches:', dk1Matches.length);
  console.log('\nDK2 matches:', dk2Matches.length);
  
  return { unmatched, dk1Matches, dk2Matches };
}