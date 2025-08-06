// Energy saving tips for Danish households
// 50 unique, practical tips distributed across 6 categories
// Tailored for Danish climate, electricity market, and home types

export type Difficulty = 'let' | 'medium' | 'svær';
export type SavingsPotential = 'lav' | 'medium' | 'høj';
export type Category = 'daily_habits' | 'heating' | 'lighting' | 'appliances' | 'insulation' | 'smart_tech';

export interface EnergyTip {
  title: string; // Max 35 characters
  description: string; // 50-80 characters
  difficulty: Difficulty;
  savingsPotential: SavingsPotential;
  icon: string; // Lucide React icon name
  category: Category;
}

export const energyTips: EnergyTip[] = [
  // DAILY HABITS (10 tips)
  {
    title: 'Flyt forbrug til billige timer',
    description: 'Brug strøm 12-16 når prisen er lavest. Spar 20-30% på regningen.',
    difficulty: 'let',
    savingsPotential: 'høj',
    icon: 'Clock',
    category: 'daily_habits'
  },
  {
    title: 'Sluk for standby-strøm',
    description: 'Elspareskinne kan spare 5-10% af årligt elforbrug på elektronik.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'PlugZap',
    category: 'daily_habits'
  },
  {
    title: 'Lad døre stå åbne',
    description: 'Spred varmen mellem rum i stedet for individuel opvarmning.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'DoorOpen',
    category: 'daily_habits'
  },
  {
    title: 'Træk opladeren ud',
    description: 'Mange opladere bruger 1-5W selv uden tilsluttede enheder.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'Unplug',
    category: 'daily_habits'
  },
  {
    title: 'Brug gardiner strategisk',
    description: 'Luk for natten, åbn for sol. Reducer varmetab med 10-25%.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Blinds',
    category: 'daily_habits'
  },
  {
    title: 'Luft ud effektivt',
    description: '5-10 min gennemtræk i stedet for vinduer på klem hele dagen.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Wind',
    category: 'daily_habits'
  },
  {
    title: 'Oplad om natten',
    description: 'Planlæg opladning af elbil og enheder til nattetimerne (22-06).',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'BatteryCharging',
    category: 'daily_habits'
  },
  {
    title: 'Sluk lys efter dig',
    description: 'LED-pærer holder længere og sparer strøm ved konsekvent slukning.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'LightbulbOff',
    category: 'daily_habits'
  },
  {
    title: 'Brug eftervarme fra ovn',
    description: 'Sluk ovn 5-10 min før færdig og lad eftervarmen gøre arbejdet.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'ChefHat',
    category: 'daily_habits'
  },
  {
    title: 'Følg dit elforbrug dagligt',
    description: 'Brug app til at identificere strømslugere og ændre vaner.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'TrendingDown',
    category: 'daily_habits'
  },

  // HEATING (10 tips)
  {
    title: 'Sænk temperatur med 1°C',
    description: 'Hver grad sparer 5-7% på varmeregningen. Fra 22°C til 21°C.',
    difficulty: 'let',
    savingsPotential: 'høj',
    icon: 'Thermometer',
    category: 'heating'
  },
  {
    title: 'Nattemodus på termostat',
    description: 'Sænk til 18°C om natten. Programmer timer for automatisk drift.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Moon',
    category: 'heating'
  },
  {
    title: 'Fri radiatorer for hindringer',
    description: 'Møbler foran radiatorer reducerer varmeeffekten med op til 40%.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Home',
    category: 'heating'
  },
  {
    title: 'Juster radiatorventiler',
    description: 'Balancér system så alle radiatorer varmer jævnt og effektivt.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Settings',
    category: 'heating'
  },
  {
    title: 'Reflektér varme fra radiatorer',
    description: 'Refleksfolie bag radiatorer sender varme ind i rummet i stedet for væg.',
    difficulty: 'medium',
    savingsPotential: 'lav',
    icon: 'Mirror',
    category: 'heating'
  },
  {
    title: 'Service dit fyr årligt',
    description: 'Velholdt kedel kører 5-10% mere effektivt og holder længere.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Wrench',
    category: 'heating'
  },
  {
    title: 'Isolér varmerør i kælder',
    description: 'Uisolerede rør i kolde rum spilde 10-15% af energien.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'PipeSlash',
    category: 'heating'
  },
  {
    title: 'Udskift gamle termostatventiler',
    description: 'Præcise ventiler giver bedre temperaturkontrol og mindre spild.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Gauge',
    category: 'heating'
  },
  {
    title: 'Luk for varme i ubrugte rum',
    description: 'Sænk til 15°C i gæsteværelser og andre sjældent brugte rum.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'DoorClosed',
    category: 'heating'
  },
  {
    title: 'Tjek og udskift tætningslister',
    description: 'Utætte døre og vinduer giver op til 15% ekstra varmetab.',
    difficulty: 'medium',
    savingsPotential: 'høj',
    icon: 'Shield',
    category: 'heating'
  },

  // LIGHTING (8 tips)
  {
    title: 'Udskift alle til LED-pærer',
    description: 'LED bruger 85% mindre strøm og holder 25 gange længere.',
    difficulty: 'let',
    savingsPotential: 'høj',
    icon: 'Lightbulb',
    category: 'lighting'
  },
  {
    title: 'Brug dæmpbare LED-pærer',
    description: 'Dæmp belysning til 70% og spar 20% strøm med samme komfort.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'SunDim',
    category: 'lighting'
  },
  {
    title: 'Installer bevægelsessensorer',
    description: 'Automatisk tænd/sluk i entre og badeværelser sparer 30-50%.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Sensor',
    category: 'lighting'
  },
  {
    title: 'Brug naturligt lys om dagen',
    description: 'Sluk kunstigt lys når dagslys er tilstrækkeligt til opgaverne.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'Sun',
    category: 'lighting'
  },
  {
    title: 'Vælg spot-belysning',
    description: 'Belys kun hvor det bruges i stedet for at oplyse hele rummet.',
    difficulty: 'medium',
    savingsPotential: 'lav',
    icon: 'Flashlight',
    category: 'lighting'
  },
  {
    title: 'Timer på udendørslys',
    description: 'Automatisk styring sikrer lys kun tændt når det er nødvendigt.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Timer',
    category: 'lighting'
  },
  {
    title: 'Rengør lamper og vinduer',
    description: 'Snavs reducerer lysudbytte med op til 30%. Rengør månedligt.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'Sparkles',
    category: 'lighting'
  },
  {
    title: 'Varm belysning om aftenen',
    description: '2700K LED om aftenen bruger mindre strøm end kold hvidt lys.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'Sunset',
    category: 'lighting'
  },

  // APPLIANCES (10 tips)
  {
    title: 'Fyld opvaskemaskine helt op',
    description: 'Fuld maskine bruger samme strøm og vand som halvt fyldt.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Utensils',
    category: 'appliances'
  },
  {
    title: 'Brug ECO-program på hvidevarer',
    description: 'Eco-programmer sparer 20-40% strøm ved lidt længere køretid.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Leaf',
    category: 'appliances'
  },
  {
    title: 'Korrekt køleskab temperatur',
    description: 'Hold køleskab på 5°C og fryser på -18°C for optimal effekt.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Refrigerator',
    category: 'appliances'
  },
  {
    title: 'Afrim fryser når islag >5mm',
    description: '5mm is øger forbruget med 30%. Afrim regelmæssigt.',
    difficulty: 'medium',
    savingsPotential: 'høj',
    icon: 'Snowflake',
    category: 'appliances'
  },
  {
    title: 'Vask tøj ved 30°C',
    description: 'Moderne vaskemiddel virker ved lav temperatur. Spar 90% energi.',
    difficulty: 'let',
    savingsPotential: 'høj',
    icon: 'WashingMachine',
    category: 'appliances'
  },
  {
    title: 'Tør tøj på snor frem for tumbler',
    description: 'Tørretumbler er blandt de mest strømkrævende husholdningsapparater.',
    difficulty: 'let',
    savingsPotential: 'høj',
    icon: 'Shirt',
    category: 'appliances'
  },
  {
    title: 'Brug låg når du koger',
    description: 'Låg på gryder reducerer kogetid og energiforbrug med op til 50%.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'ChefHat',
    category: 'appliances'
  },
  {
    title: 'Vælg A-mærkede apparater',
    description: 'A-mærkning bruger 20-50% mindre strøm end ældre mærkninger.',
    difficulty: 'medium',
    savingsPotential: 'høj',
    icon: 'Award',
    category: 'appliances'
  },
  {
    title: 'Brug elkedel til kogning',
    description: 'Elkedel er 50% mere effektiv end at koge vand på komfur.',
    difficulty: 'let',
    savingsPotential: 'lav',
    icon: 'Coffee',
    category: 'appliances'
  },
  {
    title: 'Rengør filter i tørretumbler',
    description: 'Tilstoppet filter øger tørretid og energiforbrug betydeligt.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Filter',
    category: 'appliances'
  },

  // INSULATION (6 tips)
  {
    title: 'Efterisoler loft til 300mm',
    description: 'Loft-isolering giver størst effekt. Reducer varmetab med 25%.',
    difficulty: 'medium',
    savingsPotential: 'høj',
    icon: 'Home',
    category: 'insulation'
  },
  {
    title: 'Udskift til 3-lags energiruder',
    description: 'Moderne vinduer reducerer varmetab gennem glas med 70%.',
    difficulty: 'svær',
    savingsPotential: 'høj',
    icon: 'Square',
    category: 'insulation'
  },
  {
    title: 'Isolér hulrum i ydervægge',
    description: 'Billig isolering der kan spare 10-15% på varmeregningen.',
    difficulty: 'svær',
    savingsPotential: 'høj',
    icon: 'Layers',
    category: 'insulation'
  },
  {
    title: 'Tæt revner og sprækker',
    description: 'Brug fugemasse omkring vindueskarme og dørrammer.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Paintbrush',
    category: 'insulation'
  },
  {
    title: 'Isolér krybekælder/kælderlag',
    description: 'Kold kælder under giver kolde gulve og øget varmebehov.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'ArrowDown',
    category: 'insulation'
  },
  {
    title: 'Installér smart ventilation',
    description: 'Ventilation med varmegenvinding sikrer frisk luft uden tab.',
    difficulty: 'svær',
    savingsPotential: 'høj',
    icon: 'Fan',
    category: 'insulation'
  },

  // SMART TECH (6 tips)
  {
    title: 'Installer smart termostat',
    description: 'Automatisk temperaturkontrol baseret på rutiner sparer 10-15%.',
    difficulty: 'medium',
    savingsPotential: 'høj',
    icon: 'Thermometer',
    category: 'smart_tech'
  },
  {
    title: 'Smarte kontakter til elektronik',
    description: 'Automatisk slukning af standby-strøm når du forlader hjemmet.',
    difficulty: 'let',
    savingsPotential: 'medium',
    icon: 'Plug',
    category: 'smart_tech'
  },
  {
    title: 'Smart styring af belysning',
    description: 'Timer og automatisk dæmpning reducerer lysforbrug med 20%.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Lightbulb',
    category: 'smart_tech'
  },
  {
    title: 'Energimonitorering system',
    description: 'Real-time indsigt i forbrug hjælper med at identificere spild.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'BarChart3',
    category: 'smart_tech'
  },
  {
    title: 'Smart elbil-opladning',
    description: 'Automatisk opladning når strømmen er billigst og grønnest.',
    difficulty: 'medium',
    savingsPotential: 'høj',
    icon: 'Car',
    category: 'smart_tech'
  },
  {
    title: 'Intelligente radiatorventiler',
    description: 'Individuel rumstyring og tidsplaner for optimal varmefördeling.',
    difficulty: 'medium',
    savingsPotential: 'medium',
    icon: 'Settings2',
    category: 'smart_tech'
  }
];

// Export categories for filtering
export const energyTipCategories = [
  { key: 'daily_habits', label: 'Daglige vaner' },
  { key: 'heating', label: 'Opvarmning' },
  { key: 'lighting', label: 'Belysning' },
  { key: 'appliances', label: 'Hvidevarer' },
  { key: 'insulation', label: 'Isolering' },
  { key: 'smart_tech', label: 'Smart teknologi' }
] as const;

// Utility functions for filtering and sorting
export const getEnergyTipsByCategory = (category: Category): EnergyTip[] => {
  return energyTips.filter(tip => tip.category === category);
};

export const getEnergyTipsByDifficulty = (difficulty: Difficulty): EnergyTip[] => {
  return energyTips.filter(tip => tip.difficulty === difficulty);
};

export const getEnergyTipsBySavings = (savings: SavingsPotential): EnergyTip[] => {
  return energyTips.filter(tip => tip.savingsPotential === savings);
};