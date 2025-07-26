// Denmark electricity regions mapping
// DK1 (West Denmark): Jutland, Funen, Bornholm
// DK2 (East Denmark): Zealand, Lolland-Falster, Møn

export const DK1_MUNICIPALITIES = [
  // Jutland (Jylland) - with special characters
  'aabenraa', 'aalborg', 'aarhus', 'billund', 'brønderslev', 'esbjerg', 
  'fanø', 'favrskov', 'fredericia', 'frederikshavn',
  'haderslev', 'hedensted', 'herning', 'hjørring', 'holstebro', 
  'horsens', 'ikast-brande', 'jammerbugt', 'kolding', 'læsø', 
  'lemvig', 'mariagerfjord', 'morsø', 'norddjurs', 
  'odder', 'randers', 'rebild', 'ringkøbing-skjern', 'samsø', 
  'silkeborg', 'skanderborg', 'skive', 'struer', 'syddjurs', 
  'sønderborg', 'thisted', 'tønder', 'varde', 'vejen', 'vejle', 
  'vesthimmerland', 'vesthimmerlands', 'viborg',
  
  // Jutland - ASCII versions
  'broenderslev', 'fanoe', 'hjoerring', 'laesoe', 'morsoe',
  'ringkoebing-skjern', 'samsoe', 'soenderborg', 'toender',
  
  // Funen (Fyn) - with special characters
  'assens', 'faaborg-midtfyn', 'kerteminde', 'langeland', 'middelfart',
  'nordfyn', 'nordfyns', 'nyborg', 'odense', 'svendborg', 'ærø',
  
  // Funen - ASCII versions
  'aeroe', 'aerø',
  
  // Bornholm
  'bornholm'
];

export const DK2_MUNICIPALITIES = [
  // Zealand (Sjælland) - with special characters
  'albertslund', 'allerød', 'ballerup', 'brøndby', 'dragør', 
  'egedal', 'fredensborg', 'frederiksberg', 'frederikssund', 
  'furesø', 'gentofte', 'gladsaxe', 'glostrup', 'greve', 
  'gribskov', 'halsnæs', 'helsingør', 'herlev', 'hillerød', 
  'holbæk', 'høje-taastrup', 'hørsholm', 'hvidovre', 'ishøj', 
  'kalundborg', 'københavn', 'køge', 'lejre', 'lyngby-taarbæk', 
  'næstved', 'odsherred', 'ringsted', 'roskilde', 'rudersdal', 
  'rødovre', 'slagelse', 'solrød', 'sorø', 'stevns', 'tårnby', 
  'vallensbæk', 'vordingborg', 'faxe',
  
  // Zealand - ASCII versions
  'alleroed', 'broendby', 'dragoer', 'furesoe', 'halsnaes',
  'helsingoer', 'hilleroed', 'holbaek', 'hoeje-taastrup', 
  'hoersholm', 'ishoej', 'koebenhavn', 'koege', 'lyngby-taarbaek',
  'naestved', 'roedovre', 'solroed', 'soroe', 'taarnby', 'vallensbaek',
  
  // Lolland-Falster
  'guldborgsund', 'lolland'
];

export function getMunicipalityRegion(municipalityName: string): 'DK1' | 'DK2' | null {
  const normalized = municipalityName.toLowerCase().trim();
  
  if (DK1_MUNICIPALITIES.includes(normalized)) {
    return 'DK1';
  }
  
  if (DK2_MUNICIPALITIES.includes(normalized)) {
    return 'DK2';
  }
  
  return null;
}