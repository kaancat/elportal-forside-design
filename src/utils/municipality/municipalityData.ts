export interface MunicipalityInfo {
  code: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  population?: number;
  area?: number; // km²
}

export const DANISH_MUNICIPALITIES: Record<string, MunicipalityInfo> = {
  '101': {
    code: '101',
    name: 'København',
    region: 'Hovedstaden',
    coordinates: [12.5683, 55.6761],
    population: 664263,
    area: 86.4
  },
  '147': {
    code: '147',
    name: 'Frederiksberg',
    region: 'Hovedstaden',
    coordinates: [12.5346, 55.6773],
    population: 103192,
    area: 8.7
  },
  '151': {
    code: '151',
    name: 'Ballerup',
    region: 'Hovedstaden',
    coordinates: [12.3661, 55.7316],
    population: 48602,
    area: 34.0
  },
  '153': {
    code: '153',
    name: 'Brøndby',
    region: 'Hovedstaden',
    coordinates: [12.4134, 55.6465],
    population: 36030,
    area: 20.7
  },
  '155': {
    code: '155',
    name: 'Dragør',
    region: 'Hovedstaden',
    coordinates: [12.6737, 55.5930],
    population: 14872,
    area: 18.4
  },
  '157': {
    code: '157',
    name: 'Gentofte',
    region: 'Hovedstaden',
    coordinates: [12.5519, 55.7464],
    population: 74833,
    area: 25.6
  },
  '159': {
    code: '159',
    name: 'Gladsaxe',
    region: 'Hovedstaden',
    coordinates: [12.4848, 55.7330],
    population: 69077,
    area: 25.2
  },
  '161': {
    code: '161',
    name: 'Glostrup',
    region: 'Hovedstaden',
    coordinates: [12.4037, 55.6676],
    population: 23630,
    area: 13.3
  },
  '163': {
    code: '163',
    name: 'Herlev',
    region: 'Hovedstaden',
    coordinates: [12.4414, 55.7314],
    population: 28617,
    area: 12.0
  },
  '165': {
    code: '165',
    name: 'Albertslund',
    region: 'Hovedstaden',
    coordinates: [12.3647, 55.6571],
    population: 27602,
    area: 23.0
  },
  '167': {
    code: '167',
    name: 'Hvidovre',
    region: 'Hovedstaden',
    coordinates: [12.4734, 55.6572],
    population: 53530,
    area: 22.0
  },
  '169': {
    code: '169',
    name: 'Høje-Taastrup',
    region: 'Hovedstaden',
    coordinates: [12.2886, 55.6539],
    population: 51018,
    area: 78.4
  },
  '173': {
    code: '173',
    name: 'Lyngby-Taarbæk',
    region: 'Hovedstaden',
    coordinates: [12.5063, 55.7704],
    population: 58041,
    area: 39.3
  },
  '175': {
    code: '175',
    name: 'Rødovre',
    region: 'Hovedstaden',
    coordinates: [12.4542, 55.6809],
    population: 41925,
    area: 12.3
  },
  '183': {
    code: '183',
    name: 'Ishøj',
    region: 'Hovedstaden',
    coordinates: [12.3517, 55.6155],
    population: 22709,
    area: 26.0
  },
  '185': {
    code: '185',
    name: 'Tårnby',
    region: 'Hovedstaden',
    coordinates: [12.6027, 55.6299],
    population: 42194,
    area: 65.3
  },
  '187': {
    code: '187',
    name: 'Vallensbæk',
    region: 'Hovedstaden',
    coordinates: [12.3837, 55.6303],
    population: 16399,
    area: 9.2
  },
  '190': {
    code: '190',
    name: 'Furesø',
    region: 'Hovedstaden',
    coordinates: [12.3721, 55.7681],
    population: 41157,
    area: 56.6
  },
  '201': {
    code: '201',
    name: 'Allerød',
    region: 'Hovedstaden',
    coordinates: [12.3586, 55.8686],
    population: 25467,
    area: 67.0
  },
  '210': {
    code: '210',
    name: 'Fredensborg',
    region: 'Hovedstaden',
    coordinates: [12.4008, 55.9672],
    population: 40325,
    area: 112.1
  },
  '217': {
    code: '217',
    name: 'Helsingør',
    region: 'Hovedstaden',
    coordinates: [12.6136, 56.0361],
    population: 63373,
    area: 122.0
  },
  '219': {
    code: '219',
    name: 'Hillerød',
    region: 'Hovedstaden',
    coordinates: [12.3007, 55.9286],
    population: 52078,
    area: 212.0
  },
  '223': {
    code: '223',
    name: 'Hørsholm',
    region: 'Hovedstaden',
    coordinates: [12.4988, 55.8849],
    population: 25158,
    area: 31.4
  },
  '230': {
    code: '230',
    name: 'Rudersdal',
    region: 'Hovedstaden',
    coordinates: [12.4515, 55.8247],
    population: 57318,
    area: 73.3
  },
  '240': {
    code: '240',
    name: 'Egedal',
    region: 'Hovedstaden',
    coordinates: [12.1883, 55.7744],
    population: 44017,
    area: 126.0
  },
  '250': {
    code: '250',
    name: 'Frederikssund',
    region: 'Hovedstaden',
    coordinates: [12.0696, 55.8403],
    population: 46257,
    area: 250.0
  },
  '253': {
    code: '253',
    name: 'Greve',
    region: 'Hovedstaden',
    coordinates: [12.2959, 55.5834],
    population: 50469,
    area: 60.0
  },
  '259': {
    code: '259',
    name: 'Køge',
    region: 'Hovedstaden',
    coordinates: [12.1818, 55.4584],
    population: 61191,
    area: 255.0
  },
  '260': {
    code: '260',
    name: 'Halsnæs',
    region: 'Hovedstaden',
    coordinates: [12.0870, 55.9687],
    population: 31074,
    area: 122.0
  },
  '265': {
    code: '265',
    name: 'Roskilde',
    region: 'Hovedstaden',
    coordinates: [12.0803, 55.6415],
    population: 89021,
    area: 212.0
  },
  '269': {
    code: '269',
    name: 'Solrød',
    region: 'Hovedstaden',
    coordinates: [12.2191, 55.5339],
    population: 22695,
    area: 40.0
  },
  '270': {
    code: '270',
    name: 'Gribskov',
    region: 'Hovedstaden',
    coordinates: [12.3136, 56.0876],
    population: 41979,
    area: 278.0
  },
  // Add more municipalities as needed...
  '751': {
    code: '751',
    name: 'Aarhus',
    region: 'Midtjylland',
    coordinates: [10.2039, 56.1629],
    population: 349983,
    area: 468.0
  },
  '851': {
    code: '851',
    name: 'Aalborg',
    region: 'Nordjylland',
    coordinates: [9.9187, 57.0488],
    population: 220629,
    area: 1,137.0
  },
  '561': {
    code: '561',
    name: 'Esbjerg',
    region: 'Syddanmark',
    coordinates: [8.4522, 55.4669],
    population: 115465,
    area: 741.0
  },
  '450': {
    code: '450',
    name: 'Odense',
    region: 'Syddanmark',
    coordinates: [10.4024, 55.4038],
    population: 205332,
    area: 304.0
  }
};

export const DANISH_REGIONS = {
  'Hovedstaden': { name: 'Hovedstaden', color: '#3b82f6' },
  'Sjælland': { name: 'Sjælland', color: '#10b981' },
  'Syddanmark': { name: 'Syddanmark', color: '#f59e0b' },
  'Midtjylland': { name: 'Midtjylland', color: '#ef4444' },
  'Nordjylland': { name: 'Nordjylland', color: '#8b5cf6' }
};

export const HOUSING_CATEGORIES = {
  'Etfamiliehus': 'Single family house',
  'Tofamiliehus': 'Two family house',
  'Rækkehus': 'Terraced house',
  'Etageejendom': 'Apartment building',
  'Kollegium': 'Student housing',
  'Andet': 'Other'
};

export const HEATING_CATEGORIES = {
  'Fjernvarme': 'District heating',
  'Elvarme og varmepumpe': 'Electric heating and heat pump',
  'Olie': 'Oil',
  'Gas': 'Gas',
  'Andet': 'Other'
};