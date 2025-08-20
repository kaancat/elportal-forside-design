'use client'

import React from 'react'
import { ApplianceCalculator } from './appliance-calculator/ApplianceCalculator'
import { Appliance } from '@/types/appliance'

// Hardcoded appliance data - comprehensive list for Danish households
const APPLIANCES_DATA: Appliance[] = [
  // Kitchen appliances
  {
    _id: '1',
    name: 'Kaffemaskine (filter)',
    slug: { current: 'kaffemaskine-filter' },
    category: 'kitchen',
    powerWatts: 1000,
    usageUnit: 'minutes_per_day',
    defaultUsage: 15,
    icon: 'Coffee',
    energyTip: 'Sluk kaffemaskinen efter brug. En varmeplade bruger 40-60W konstant.',
    popularityScore: 10
  },
  {
    _id: '2',
    name: 'Espressomaskine',
    slug: { current: 'espressomaskine' },
    category: 'kitchen',
    powerWatts: 1400,
    usageUnit: 'minutes_per_day',
    defaultUsage: 10,
    icon: 'Coffee',
    energyTip: 'Sluk maskinen helt efter brug - standby kan bruge 1-2W konstant.',
    popularityScore: 8
  },
  {
    _id: '3',
    name: 'Elkedel',
    slug: { current: 'elkedel' },
    category: 'kitchen',
    powerWatts: 2200,
    usageUnit: 'minutes_per_day',
    defaultUsage: 5,
    icon: 'Flame',
    energyTip: 'Kog kun den mængde vand du skal bruge for at spare energi.',
    popularityScore: 9
  },
  {
    _id: '4',
    name: 'Mikroovn',
    slug: { current: 'mikroovn' },
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
    _id: '5',
    name: 'Opvaskemaskine',
    slug: { current: 'opvaskemaskine' },
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
    _id: '6',
    name: 'Smart TV 43-55"',
    slug: { current: 'smart-tv-43-55' },
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
    _id: '7',
    name: 'Smart TV 65-75"',
    slug: { current: 'smart-tv-65-75' },
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
    _id: '8',
    name: 'Gaming PC',
    slug: { current: 'gaming-pc' },
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
    _id: '9',
    name: 'PlayStation 5',
    slug: { current: 'playstation-5' },
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

  // Lighting
  {
    _id: '10',
    name: 'LED pære 10W',
    slug: { current: 'led-paere-10w' },
    category: 'lighting',
    powerWatts: 10,
    usageUnit: 'hours_per_day',
    defaultUsage: 5,
    icon: 'Lightbulb',
    energyTip: 'LED pærer bruger 80% mindre strøm end glødepærer.',
    popularityScore: 10
  },
  {
    _id: '11',
    name: 'Halogenspot 50W',
    slug: { current: 'halogenspot-50w' },
    category: 'lighting',
    powerWatts: 50,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Lightbulb',
    energyTip: 'Udskift til LED spots - de fås nu i alle varmegrader.',
    popularityScore: 6
  },

  // Cooling
  {
    _id: '12',
    name: 'Køleskab A+++',
    slug: { current: 'koeleskab-a-plus' },
    category: 'cooling',
    powerWatts: 100,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Hold 5°C i køleskab og -18°C i fryser for optimal drift.',
    popularityScore: 10
  },
  {
    _id: '13',
    name: 'Køleskab (ældre)',
    slug: { current: 'koeleskab-aeldre' },
    category: 'cooling',
    powerWatts: 200,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Ældre køleskabe kan bruge dobbelt så meget strøm - overvej udskiftning.',
    popularityScore: 8
  },
  {
    _id: '14',
    name: 'Fryser',
    slug: { current: 'fryser' },
    category: 'cooling',
    powerWatts: 150,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Afrim fryseren regelmæssigt - is reducerer effektiviteten.',
    popularityScore: 9
  },

  // Cooking
  {
    _id: '15',
    name: 'Induktionskogeplade',
    slug: { current: 'induktionskogeplade' },
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
    _id: '16',
    name: 'Ovn',
    slug: { current: 'ovn' },
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
    _id: '17',
    name: 'Airfryer',
    slug: { current: 'airfryer' },
    category: 'cooking',
    powerWatts: 1400,
    usageUnit: 'minutes_per_day',
    defaultUsage: 20,
    icon: 'ChefHat',
    energyTip: 'Bruger op til 50% mindre energi end en almindelig ovn.',
    popularityScore: 8
  },

  // Cleaning
  {
    _id: '18',
    name: 'Vaskemaskine A+++',
    slug: { current: 'vaskemaskine-a-plus' },
    category: 'cleaning',
    powerWatts: 2000,
    usageUnit: 'cycles_per_week',
    defaultUsage: 3,
    icon: 'Shirt',
    energyTip: 'Vask ved 30°C i stedet for 60°C - spar 40% energi.',
    popularityScore: 10
  },
  {
    _id: '19',
    name: 'Tørretumbler',
    slug: { current: 'toerretumbler' },
    category: 'cleaning',
    powerWatts: 2500,
    usageUnit: 'cycles_per_week',
    defaultUsage: 2,
    icon: 'Wind',
    energyTip: 'Lufttørring er gratis - brug tumbler kun når nødvendigt.',
    popularityScore: 8
  },
  {
    _id: '20',
    name: 'Støvsuger',
    slug: { current: 'stoevsuger' },
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

  // Heating
  {
    _id: '21',
    name: 'Aircondition',
    slug: { current: 'aircondition' },
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
    _id: '22',
    name: 'Elradiator',
    slug: { current: 'elradiator' },
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

  // Standby
  {
    _id: '23',
    name: 'WiFi router',
    slug: { current: 'wifi-router' },
    category: 'standby',
    powerWatts: 10,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Wifi',
    energyTip: 'Overvej timer til at slukke WiFi om natten.',
    popularityScore: 10
  },
  {
    _id: '24',
    name: 'Smart højttaler',
    slug: { current: 'smart-hoejttaler' },
    category: 'standby',
    powerWatts: 3,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Speaker',
    energyTip: 'Altid på standby - sluk hvis ikke i brug.',
    popularityScore: 7
  },
  {
    _id: '25',
    name: 'Laptop (standby)',
    slug: { current: 'laptop-standby' },
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

  // Other
  {
    _id: '26',
    name: 'Hårtørrer',
    slug: { current: 'haartoerrer' },
    category: 'other',
    powerWatts: 1800,
    usageUnit: 'minutes_per_day',
    defaultUsage: 5,
    icon: 'Wind',
    energyTip: 'Brug lavere varme og kortere tid når muligt.',
    popularityScore: 8
  },
  {
    _id: '27',
    name: 'Elektrisk tandbørste',
    slug: { current: 'elektrisk-tandboerste' },
    category: 'other',
    powerWatts: 2,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Zap',
    energyTip: 'Tag opladeren ud når ikke i brug.',
    popularityScore: 7
  },
  {
    _id: '28',
    name: 'Mobillader',
    slug: { current: 'mobillader' },
    category: 'other',
    powerWatts: 5,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Smartphone',
    energyTip: 'Moderne ladere bruger næsten ingen strøm i tomgang.',
    popularityScore: 10
  }
]

interface ApplianceCalculatorSectionProps {
  block: {
    _type: 'applianceCalculator'
    title?: string
    subtitle?: string
    showCategories?: string[]
    showSavingsCallToAction?: boolean
    defaultElectricityPrice?: number
  }
}

export function ApplianceCalculatorSection({ block }: ApplianceCalculatorSectionProps) {
  // Filter appliances based on selected categories
  const filteredAppliances = block.showCategories && block.showCategories.length > 0
    ? APPLIANCES_DATA.filter(appliance => block.showCategories!.includes(appliance.category))
    : APPLIANCES_DATA

  return (
    <ApplianceCalculator
      appliances={filteredAppliances}
      defaultElectricityPrice={block.defaultElectricityPrice}
    />
  )
}