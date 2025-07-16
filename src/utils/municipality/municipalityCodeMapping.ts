/**
 * Mapping between Danish municipality codes and react-denmark-map IDs
 * The library uses lowercase municipality names as IDs
 */

export const MUNICIPALITY_CODE_TO_NAME: Record<string, string> = {
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

// Reverse mapping for convenience
export const MUNICIPALITY_NAME_TO_CODE: Record<string, string> = Object.entries(
  MUNICIPALITY_CODE_TO_NAME
).reduce((acc, [code, name]) => {
  acc[name] = code;
  return acc;
}, {} as Record<string, string>);

/**
 * Convert municipality code to react-denmark-map ID
 */
export function getMunicipalityNameFromCode(code: string): string | null {
  return MUNICIPALITY_CODE_TO_NAME[code] || null;
}

/**
 * Convert react-denmark-map ID to municipality code
 */
export function getMunicipalityCodeFromName(name: string): string | null {
  return MUNICIPALITY_NAME_TO_CODE[name] || null;
}