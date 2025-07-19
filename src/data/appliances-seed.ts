// Seed data for appliances - to be imported into Sanity CMS
// Based on data from Energistyrelsen and EU energy labels

export const appliancesSeedData = [
  // Kitchen appliances
  {
    name: 'Kaffemaskine (filter)',
    category: 'kitchen',
    powerWatts: 1000,
    usageUnit: 'minutes_per_day',
    defaultUsage: 15,
    icon: 'Coffee',
    energyTip: 'Sluk kaffemaskinen efter brug. En varmeplade bruger 40-60W konstant.',
    popularityScore: 10
  },
  {
    name: 'Espressomaskine',
    category: 'kitchen',
    powerWatts: 1400,
    usageUnit: 'minutes_per_day',
    defaultUsage: 10,
    icon: 'Coffee',
    energyTip: 'Sluk maskinen helt efter brug - standby kan bruge 1-2W konstant.',
    popularityScore: 8
  },
  {
    name: 'Elkedel',
    category: 'kitchen',
    powerWatts: 2200,
    usageUnit: 'minutes_per_day',
    defaultUsage: 5,
    icon: 'Flame',
    energyTip: 'Kog kun den mængde vand du skal bruge for at spare energi.',
    popularityScore: 9
  },
  {
    name: 'Mikroovn',
    category: 'kitchen',
    powerWatts: 800,
    powerRangeMin: 600,
    powerRangeMax: 1200,
    usageUnit: 'minutes_per_day',
    defaultUsage: 10,
    icon: 'Zap',
    energyTip: 'Mikroovne er ofte mere energieffektive end almindelige ovne til opvarmning.',
    popularityScore: 9
  },
  {
    name: 'Opvaskemaskine',
    category: 'kitchen',
    powerWatts: 1800,
    usageUnit: 'cycles_per_week',
    defaultUsage: 4,
    icon: 'Droplets',
    energyTip: 'Kør kun opvaskemaskinen når den er fuld og brug eco-program.',
    popularityScore: 9
  },

  // Entertainment
  {
    name: 'Smart TV 43-55"',
    category: 'entertainment',
    powerWatts: 100,
    powerRangeMin: 80,
    powerRangeMax: 150,
    usageUnit: 'hours_per_day',
    defaultUsage: 4,
    icon: 'Tv',
    energyTip: 'Reducer lysstyrken og sluk TV helt i stedet for standby (spar 1-5W).',
    popularityScore: 10
  },
  {
    name: 'Smart TV 65-75"',
    category: 'entertainment',
    powerWatts: 150,
    powerRangeMin: 120,
    powerRangeMax: 250,
    usageUnit: 'hours_per_day',
    defaultUsage: 4,
    icon: 'Tv2',
    energyTip: 'Større skærme bruger mere strøm - overvej om du virkelig behøver den størrelse.',
    popularityScore: 8
  },
  {
    name: 'Gaming PC',
    category: 'entertainment',
    powerWatts: 450,
    powerRangeMin: 300,
    powerRangeMax: 800,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Gamepad2',
    energyTip: 'Aktiver strømsparetilstand og luk spil når du holder pause.',
    popularityScore: 7
  },
  {
    name: 'PlayStation 5',
    category: 'entertainment',
    powerWatts: 150,
    powerRangeMin: 100,
    powerRangeMax: 200,
    usageUnit: 'hours_per_day',
    defaultUsage: 2,
    icon: 'Gamepad',
    energyTip: 'Rest mode bruger 0.5W - sluk helt hvis du ikke downloader.',
    popularityScore: 8
  },
  {
    name: 'Xbox Series X',
    category: 'entertainment',
    powerWatts: 150,
    powerRangeMin: 100,
    powerRangeMax: 180,
    usageUnit: 'hours_per_day',
    defaultUsage: 2,
    icon: 'Gamepad',
    energyTip: 'Instant-on mode bruger 10-15W konstant - brug energy-saving mode.',
    popularityScore: 7
  },

  // Lighting
  {
    name: 'LED pære 10W',
    category: 'lighting',
    powerWatts: 10,
    usageUnit: 'hours_per_day',
    defaultUsage: 5,
    icon: 'Lightbulb',
    energyTip: 'LED pærer bruger 80% mindre strøm end glødepærer.',
    popularityScore: 10
  },
  {
    name: 'Halogenspot 50W',
    category: 'lighting',
    powerWatts: 50,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Lightbulb',
    energyTip: 'Udskift til LED spots - de fås nu i alle varmegrader.',
    popularityScore: 6
  },

  // Cooling & Heating
  {
    name: 'Køleskab A+++',
    category: 'cooling',
    powerWatts: 100,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Hold 5°C i køleskab og -18°C i fryser for optimal drift.',
    popularityScore: 10
  },
  {
    name: 'Køleskab (ældre)',
    category: 'cooling',
    powerWatts: 200,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Ældre køleskabe kan bruge dobbelt så meget strøm - overvej udskiftning.',
    popularityScore: 8
  },
  {
    name: 'Fryser',
    category: 'cooling',
    powerWatts: 150,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Afrim fryseren regelmæssigt - is reducerer effektiviteten.',
    popularityScore: 9
  },
  {
    name: 'Aircondition',
    category: 'heating',
    powerWatts: 1000,
    powerRangeMin: 500,
    powerRangeMax: 2000,
    usageUnit: 'hours_per_day',
    defaultUsage: 2,
    icon: 'Wind',
    energyTip: 'Sæt temperaturen til 24-26°C og brug timer-funktion.',
    popularityScore: 6
  },
  {
    name: 'Elradiator',
    category: 'heating',
    powerWatts: 2000,
    powerRangeMin: 1000,
    powerRangeMax: 2500,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Thermometer',
    energyTip: 'Brug kun som supplement - varmepumper er 3-4x mere effektive.',
    popularityScore: 7
  },

  // Cooking
  {
    name: 'Induktionskogeplade',
    category: 'cooking',
    powerWatts: 2000,
    powerRangeMin: 1000,
    powerRangeMax: 3500,
    usageUnit: 'hours_per_day',
    defaultUsage: 1,
    icon: 'ChefHat',
    energyTip: 'Induktion er 40% mere effektivt end keramiske kogeplader.',
    popularityScore: 8
  },
  {
    name: 'Ovn',
    category: 'cooking',
    powerWatts: 2500,
    powerRangeMin: 2000,
    powerRangeMax: 3500,
    usageUnit: 'hours_per_day',
    defaultUsage: 0.5,
    icon: 'ChefHat',
    energyTip: 'Brug varmluft og udnyt restvarmen - sluk 5-10 min før tid.',
    popularityScore: 9
  },
  {
    name: 'Airfryer',
    category: 'cooking',
    powerWatts: 1400,
    usageUnit: 'minutes_per_day',
    defaultUsage: 20,
    icon: 'ChefHat',
    energyTip: 'Bruger op til 50% mindre energi end en almindelig ovn.',
    popularityScore: 8
  },
  {
    name: 'Brødrister',
    category: 'cooking',
    powerWatts: 850,
    usageUnit: 'minutes_per_day',
    defaultUsage: 3,
    icon: 'ChefHat',
    energyTip: 'Mere effektiv end ovn til små portioner.',
    popularityScore: 7
  },

  // Cleaning
  {
    name: 'Vaskemaskine A+++',
    category: 'cleaning',
    powerWatts: 2000,
    usageUnit: 'cycles_per_week',
    defaultUsage: 3,
    icon: 'Shirt',
    energyTip: 'Vask ved 30°C i stedet for 60°C - spar 40% energi.',
    popularityScore: 10
  },
  {
    name: 'Tørretumbler',
    category: 'cleaning',
    powerWatts: 2500,
    usageUnit: 'cycles_per_week',
    defaultUsage: 2,
    icon: 'Wind',
    energyTip: 'Lufttørring er gratis - brug tumbler kun når nødvendigt.',
    popularityScore: 8
  },
  {
    name: 'Støvsuger',
    category: 'cleaning',
    powerWatts: 1600,
    powerRangeMin: 600,
    powerRangeMax: 2200,
    usageUnit: 'minutes_per_day',
    defaultUsage: 10,
    icon: 'Wind',
    energyTip: 'Nye modeller er mere effektive - max 900W fra 2017.',
    popularityScore: 9
  },
  {
    name: 'Robotstøvsuger',
    category: 'cleaning',
    powerWatts: 30,
    usageUnit: 'hours_per_day',
    defaultUsage: 1,
    icon: 'Bot',
    energyTip: 'Bruger meget mindre strøm end almindelige støvsugere.',
    popularityScore: 7
  },

  // Standby & Always-on
  {
    name: 'WiFi router',
    category: 'standby',
    powerWatts: 10,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Wifi',
    energyTip: 'Overvej timer til at slukke WiFi om natten.',
    popularityScore: 10
  },
  {
    name: 'Smart højttaler',
    category: 'standby',
    powerWatts: 3,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Speaker',
    energyTip: 'Altid på standby - sluk hvis ikke i brug.',
    popularityScore: 7
  },
  {
    name: 'Laptop (standby)',
    category: 'standby',
    powerWatts: 50,
    powerRangeMin: 20,
    powerRangeMax: 90,
    usageUnit: 'hours_per_day',
    defaultUsage: 8,
    icon: 'Laptop',
    energyTip: 'Luk låget eller sæt i dvale når ikke i brug.',
    popularityScore: 9
  },
  {
    name: 'Desktop PC (standby)',
    category: 'standby',
    powerWatts: 100,
    powerRangeMin: 50,
    powerRangeMax: 200,
    usageUnit: 'hours_per_day',
    defaultUsage: 6,
    icon: 'Monitor',
    energyTip: 'Sluk helt eller brug dvale - standby bruger stadig strøm.',
    popularityScore: 8
  },

  // Other
  {
    name: 'Hårtørrer',
    category: 'other',
    powerWatts: 1800,
    usageUnit: 'minutes_per_day',
    defaultUsage: 5,
    icon: 'Wind',
    energyTip: 'Brug lavere varme og kortere tid når muligt.',
    popularityScore: 8
  },
  {
    name: 'Elektrisk tandbørste',
    category: 'other',
    powerWatts: 2,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Zap',
    energyTip: 'Tag opladeren ud når ikke i brug.',
    popularityScore: 7
  },
  {
    name: 'Mobillader',
    category: 'other',
    powerWatts: 5,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Smartphone',
    energyTip: 'Moderne ladere bruger næsten ingen strøm i tomgang.',
    popularityScore: 10
  }
]