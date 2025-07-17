/**
 * Fixed municipality mapping that properly handles the flow:
 * API (Danish names) -> Municipality codes -> react-denmark-map (ASCII names)
 */

import { getMunicipalityAsciiName } from './municipalityNameConverter';

// Create a mapping structure to handle the data flow
export interface MunicipalityMapping {
  code: string;
  danishName: string;
  asciiName: string;
}

// Complete mapping of all Danish municipalities
export const MUNICIPALITY_MAPPINGS: MunicipalityMapping[] = [
  // Region Hovedstaden
  { code: '101', danishName: 'København', asciiName: 'koebenhavn' },
  { code: '147', danishName: 'Frederiksberg', asciiName: 'frederiksberg' },
  { code: '151', danishName: 'Ballerup', asciiName: 'ballerup' },
  { code: '153', danishName: 'Brøndby', asciiName: 'broendby' },
  { code: '155', danishName: 'Dragør', asciiName: 'dragoer' },
  { code: '157', danishName: 'Gentofte', asciiName: 'gentofte' },
  { code: '159', danishName: 'Gladsaxe', asciiName: 'gladsaxe' },
  { code: '161', danishName: 'Glostrup', asciiName: 'glostrup' },
  { code: '163', danishName: 'Herlev', asciiName: 'herlev' },
  { code: '165', danishName: 'Albertslund', asciiName: 'albertslund' },
  { code: '167', danishName: 'Hvidovre', asciiName: 'hvidovre' },
  { code: '169', danishName: 'Høje-Taastrup', asciiName: 'hoeje-taastrup' },
  { code: '173', danishName: 'Lyngby-Taarbæk', asciiName: 'lyngby-taarbaek' },
  { code: '175', danishName: 'Rødovre', asciiName: 'roedovre' },
  { code: '183', danishName: 'Ishøj', asciiName: 'ishoej' },
  { code: '185', danishName: 'Tårnby', asciiName: 'taarnby' },
  { code: '187', danishName: 'Vallensbæk', asciiName: 'vallensbaek' },
  { code: '190', danishName: 'Furesø', asciiName: 'furesoe' },
  { code: '201', danishName: 'Allerød', asciiName: 'alleroed' },
  { code: '210', danishName: 'Fredensborg', asciiName: 'fredensborg' },
  { code: '217', danishName: 'Helsingør', asciiName: 'helsingoer' },
  { code: '219', danishName: 'Hillerød', asciiName: 'hilleroed' },
  { code: '223', danishName: 'Hørsholm', asciiName: 'hoersholm' },
  { code: '230', danishName: 'Rudersdal', asciiName: 'rudersdal' },
  { code: '240', danishName: 'Egedal', asciiName: 'egedal' },
  { code: '250', danishName: 'Frederikssund', asciiName: 'frederikssund' },
  { code: '253', danishName: 'Greve', asciiName: 'greve' },
  { code: '259', danishName: 'Køge', asciiName: 'koege' },
  { code: '260', danishName: 'Halsnæs', asciiName: 'halsnaes' },
  { code: '265', danishName: 'Roskilde', asciiName: 'roskilde' },
  { code: '269', danishName: 'Solrød', asciiName: 'solroed' },
  { code: '270', danishName: 'Gribskov', asciiName: 'gribskov' },
  
  // Region Sjælland
  { code: '306', danishName: 'Odsherred', asciiName: 'odsherred' },
  { code: '316', danishName: 'Holbæk', asciiName: 'holbaek' },
  { code: '320', danishName: 'Faxe', asciiName: 'faxe' },
  { code: '326', danishName: 'Kalundborg', asciiName: 'kalundborg' },
  { code: '329', danishName: 'Ringsted', asciiName: 'ringsted' },
  { code: '330', danishName: 'Sorø', asciiName: 'soroe' },
  { code: '336', danishName: 'Stevns', asciiName: 'stevns' },
  { code: '340', danishName: 'Slagelse', asciiName: 'slagelse' },
  { code: '350', danishName: 'Lejre', asciiName: 'lejre' },
  { code: '360', danishName: 'Lolland', asciiName: 'lolland' },
  { code: '370', danishName: 'Næstved', asciiName: 'naestved' },
  { code: '376', danishName: 'Guldborgsund', asciiName: 'guldborgsund' },
  { code: '390', danishName: 'Vordingborg', asciiName: 'vordingborg' },
  { code: '400', danishName: 'Bornholm', asciiName: 'bornholm' },
  
  // Region Syddanmark
  { code: '410', danishName: 'Middelfart', asciiName: 'middelfart' },
  { code: '420', danishName: 'Assens', asciiName: 'assens' },
  { code: '430', danishName: 'Faaborg-Midtfyn', asciiName: 'faaborg-midtfyn' },
  { code: '440', danishName: 'Kerteminde', asciiName: 'kerteminde' },
  { code: '450', danishName: 'Nyborg', asciiName: 'nyborg' },
  { code: '461', danishName: 'Odense', asciiName: 'odense' },
  { code: '479', danishName: 'Svendborg', asciiName: 'svendborg' },
  { code: '480', danishName: 'Nordfyn', asciiName: 'nordfyn' },
  { code: '482', danishName: 'Langeland', asciiName: 'langeland' },
  { code: '492', danishName: 'Ærø', asciiName: 'aeroe' },
  { code: '510', danishName: 'Haderslev', asciiName: 'haderslev' },
  { code: '530', danishName: 'Billund', asciiName: 'billund' },
  { code: '540', danishName: 'Sønderborg', asciiName: 'soenderborg' },
  { code: '550', danishName: 'Tønder', asciiName: 'toender' },
  { code: '580', danishName: 'Aabenraa', asciiName: 'aabenraa' },
  { code: '561', danishName: 'Esbjerg', asciiName: 'esbjerg' },
  { code: '563', danishName: 'Fanø', asciiName: 'fanoe' },
  { code: '573', danishName: 'Varde', asciiName: 'varde' },
  { code: '575', danishName: 'Vejen', asciiName: 'vejen' },
  { code: '607', danishName: 'Fredericia', asciiName: 'fredericia' },
  { code: '615', danishName: 'Horsens', asciiName: 'horsens' },
  { code: '621', danishName: 'Kolding', asciiName: 'kolding' },
  { code: '630', danishName: 'Vejle', asciiName: 'vejle' },
  
  // Region Midtjylland
  { code: '657', danishName: 'Herning', asciiName: 'herning' },
  { code: '661', danishName: 'Holstebro', asciiName: 'holstebro' },
  { code: '665', danishName: 'Lemvig', asciiName: 'lemvig' },
  { code: '671', danishName: 'Struer', asciiName: 'struer' },
  { code: '706', danishName: 'Syddjurs', asciiName: 'syddjurs' },
  { code: '707', danishName: 'Norddjurs', asciiName: 'norddjurs' },
  { code: '710', danishName: 'Favrskov', asciiName: 'favrskov' },
  { code: '727', danishName: 'Odder', asciiName: 'odder' },
  { code: '730', danishName: 'Randers', asciiName: 'randers' },
  { code: '740', danishName: 'Silkeborg', asciiName: 'silkeborg' },
  { code: '741', danishName: 'Samsø', asciiName: 'samsoe' },
  { code: '746', danishName: 'Skanderborg', asciiName: 'skanderborg' },
  { code: '751', danishName: 'Aarhus', asciiName: 'aarhus' },
  { code: '756', danishName: 'Ikast-Brande', asciiName: 'ikast-brande' },
  { code: '760', danishName: 'Ringkøbing-Skjern', asciiName: 'ringkoebing-skjern' },
  { code: '766', danishName: 'Hedensted', asciiName: 'hedensted' },
  { code: '773', danishName: 'Morsø', asciiName: 'morsoe' },
  { code: '779', danishName: 'Skive', asciiName: 'skive' },
  { code: '787', danishName: 'Thisted', asciiName: 'thisted' },
  { code: '791', danishName: 'Viborg', asciiName: 'viborg' },
  
  // Region Nordjylland
  { code: '810', danishName: 'Brønderslev', asciiName: 'broenderslev' },
  { code: '813', danishName: 'Frederikshavn', asciiName: 'frederikshavn' },
  { code: '820', danishName: 'Vesthimmerlands', asciiName: 'vesthimmerlands' },
  { code: '825', danishName: 'Læsø', asciiName: 'laesoe' },
  { code: '840', danishName: 'Rebild', asciiName: 'rebild' },
  { code: '846', danishName: 'Mariagerfjord', asciiName: 'mariagerfjord' },
  { code: '849', danishName: 'Jammerbugt', asciiName: 'jammerbugt' },
  { code: '851', danishName: 'Aalborg', asciiName: 'aalborg' },
  { code: '860', danishName: 'Hjørring', asciiName: 'hjoerring' }
];

// Create lookup maps for efficient access
export const CODE_TO_MAPPING = new Map(
  MUNICIPALITY_MAPPINGS.map(m => [m.code, m])
);

export const ASCII_NAME_TO_MAPPING = new Map(
  MUNICIPALITY_MAPPINGS.map(m => [m.asciiName, m])
);

export const DANISH_NAME_TO_MAPPING = new Map(
  MUNICIPALITY_MAPPINGS.map(m => [m.danishName.toLowerCase(), m])
);

/**
 * Get municipality mapping by code
 */
export function getMunicipalityByCode(code: string): MunicipalityMapping | undefined {
  return CODE_TO_MAPPING.get(code);
}

/**
 * Get municipality mapping by ASCII name (from react-denmark-map)
 */
export function getMunicipalityByAsciiName(asciiName: string): MunicipalityMapping | undefined {
  return ASCII_NAME_TO_MAPPING.get(asciiName);
}

/**
 * Get municipality mapping by Danish name (case insensitive)
 */
export function getMunicipalityByDanishName(danishName: string): MunicipalityMapping | undefined {
  return DANISH_NAME_TO_MAPPING.get(danishName.toLowerCase());
}

/**
 * Map municipality data from API to react-denmark-map format
 */
export function mapApiDataToMapFormat(apiData: any): any {
  if (!apiData || !apiData.municipalityCode) return null;
  
  const mapping = getMunicipalityByCode(apiData.municipalityCode);
  if (!mapping) return null;
  
  return {
    ...apiData,
    mapId: mapping.asciiName,
    displayName: mapping.danishName
  };
}