// Denmark electricity regions mapping
// DK1 (West Denmark): Jutland, Funen, Bornholm
// DK2 (East Denmark): Zealand, Lolland-Falster, Møn

export const DK1_MUNICIPALITIES = [
  // Jutland (Jylland)
  'aabenraa', 'aalborg', 'aarhus', 'billund', 'brønderslev', 'esbjerg', 
  'fanø', 'favrskov', 'fredericia', 'frederikshavn',
  'haderslev', 'hedensted', 'herning', 'hjørring', 'holstebro', 
  'horsens', 'ikast-brande', 'jammerbugt', 'kolding', 'læsø', 
  'lemvig', 'mariagerfjord', 'morsø', 'norddjurs', 
  'odder', 'randers', 'rebild', 'ringkøbing-skjern', 'samsø', 
  'silkeborg', 'skanderborg', 'skive', 'struer', 'syddjurs', 
  'sønderborg', 'thisted', 'tønder', 'varde', 'vejen', 'vejle', 
  'vesthimmerland', 'viborg',
  
  // Funen (Fyn)
  'assens', 'faaborg-midtfyn', 'kerteminde', 'langeland', 'middelfart',
  'nordfyns', 'nyborg', 'odense', 'svendborg', 'ærø',
  
  // Bornholm
  'bornholm'
];

export const DK2_MUNICIPALITIES = [
  // Zealand (Sjælland)
  'albertslund', 'allerød', 'ballerup', 'brøndby', 'dragør', 
  'egedal', 'fredensborg', 'frederiksberg', 'frederikssund', 
  'furesø', 'gentofte', 'gladsaxe', 'glostrup', 'greve', 
  'gribskov', 'halsnæs', 'helsingør', 'herlev', 'hillerød', 
  'holbæk', 'høje-taastrup', 'hørsholm', 'hvidovre', 'ishøj', 
  'kalundborg', 'københavn', 'køge', 'lejre', 'lyngby-taarbæk', 
  'næstved', 'odsherred', 'ringsted', 'roskilde', 'rudersdal', 
  'rødovre', 'slagelse', 'solrød', 'sorø', 'stevns', 'tårnby', 
  'vallensbæk', 'vordingborg',
  
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