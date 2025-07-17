/**
 * Converts Danish municipality names to ASCII format expected by react-denmark-map
 */

// Map of municipality codes to their ASCII names as expected by react-denmark-map
export const MUNICIPALITY_CODE_TO_ASCII_NAME: Record<string, string> = {
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
  '350': 'lejre',
  '360': 'lolland',
  '370': 'naestved',
  '376': 'guldborgsund',
  '390': 'vordingborg',
  '400': 'bornholm',
  
  // Region Syddanmark
  '410': 'middelfart',
  '420': 'assens',
  '430': 'faaborg-midtfyn',
  '440': 'kerteminde',
  '450': 'nyborg',
  '461': 'odense',
  '479': 'svendborg',
  '480': 'nordfyn',
  '482': 'langeland',
  '492': 'aeroe',
  '510': 'haderslev',
  '530': 'billund',
  '540': 'soenderborg',
  '550': 'toender',
  '580': 'aabenraa',
  '561': 'esbjerg',
  '563': 'fanoe',
  '573': 'varde',
  '575': 'vejen',
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
  '773': 'morsoe',
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

// Map of municipality codes to their proper Danish display names
export const MUNICIPALITY_CODE_TO_DANISH_NAME: Record<string, string> = {
  // Region Hovedstaden
  '101': 'København',
  '147': 'Frederiksberg',
  '151': 'Ballerup',
  '153': 'Brøndby',
  '155': 'Dragør',
  '157': 'Gentofte',
  '159': 'Gladsaxe',
  '161': 'Glostrup',
  '163': 'Herlev',
  '165': 'Albertslund',
  '167': 'Hvidovre',
  '169': 'Høje-Taastrup',
  '173': 'Lyngby-Taarbæk',
  '175': 'Rødovre',
  '183': 'Ishøj',
  '185': 'Tårnby',
  '187': 'Vallensbæk',
  '190': 'Furesø',
  '201': 'Allerød',
  '210': 'Fredensborg',
  '217': 'Helsingør',
  '219': 'Hillerød',
  '223': 'Hørsholm',
  '230': 'Rudersdal',
  '240': 'Egedal',
  '250': 'Frederikssund',
  '253': 'Greve',
  '259': 'Køge',
  '260': 'Halsnæs',
  '265': 'Roskilde',
  '269': 'Solrød',
  '270': 'Gribskov',
  
  // Region Sjælland
  '306': 'Odsherred',
  '316': 'Holbæk',
  '320': 'Faxe',
  '326': 'Kalundborg',
  '329': 'Ringsted',
  '330': 'Sorø',
  '336': 'Stevns',
  '340': 'Slagelse',
  '350': 'Lejre',
  '360': 'Lolland',
  '370': 'Næstved',
  '376': 'Guldborgsund',
  '390': 'Vordingborg',
  '400': 'Bornholm',
  
  // Region Syddanmark
  '410': 'Middelfart',
  '420': 'Assens',
  '430': 'Faaborg-Midtfyn',
  '440': 'Kerteminde',
  '450': 'Nyborg',
  '461': 'Odense',
  '479': 'Svendborg',
  '480': 'Nordfyn',
  '482': 'Langeland',
  '492': 'Ærø',
  '510': 'Haderslev',
  '530': 'Billund',
  '540': 'Sønderborg',
  '550': 'Tønder',
  '580': 'Aabenraa',
  '561': 'Esbjerg',
  '563': 'Fanø',
  '573': 'Varde',
  '575': 'Vejen',
  '607': 'Fredericia',
  '615': 'Horsens',
  '621': 'Kolding',
  '630': 'Vejle',
  
  // Region Midtjylland
  '657': 'Herning',
  '661': 'Holstebro',
  '665': 'Lemvig',
  '671': 'Struer',
  '706': 'Syddjurs',
  '707': 'Norddjurs',
  '710': 'Favrskov',
  '727': 'Odder',
  '730': 'Randers',
  '740': 'Silkeborg',
  '741': 'Samsø',
  '746': 'Skanderborg',
  '751': 'Aarhus',
  '756': 'Ikast-Brande',
  '760': 'Ringkøbing-Skjern',
  '766': 'Hedensted',
  '773': 'Morsø',
  '779': 'Skive',
  '787': 'Thisted',
  '791': 'Viborg',
  
  // Region Nordjylland
  '810': 'Brønderslev',
  '813': 'Frederikshavn',
  '820': 'Vesthimmerlands',
  '825': 'Læsø',
  '840': 'Rebild',
  '846': 'Mariagerfjord',
  '849': 'Jammerbugt',
  '851': 'Aalborg',
  '860': 'Hjørring'
};

/**
 * Get the ASCII municipality name for react-denmark-map from a municipality code
 */
export function getMunicipalityAsciiName(code: string): string {
  return MUNICIPALITY_CODE_TO_ASCII_NAME[code] || `municipality-${code}`;
}

/**
 * Get the proper Danish display name for a municipality from its code
 */
export function getMunicipalityDanishName(code: string): string {
  return MUNICIPALITY_CODE_TO_DANISH_NAME[code] || `Kommune ${code}`;
}

/**
 * Convert Danish characters to ASCII format
 */
export function normalizeToAscii(name: string): string {
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