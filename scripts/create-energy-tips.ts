import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

const energyTips = [
  // DAILY HABITS (10 tips)
  {
    _type: 'energyTip',
    title: 'Flyt forbrug til billige timer',
    slug: { current: 'flyt-forbrug-til-billige-timer' },
    category: 'daily_habits',
    shortDescription: 'Brug strøm 12-16 når prisen er lavest. Spar 20-30% på regningen.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Clock',
    priority: 1
  },
  {
    _type: 'energyTip',
    title: 'Sluk for standby-strøm',
    slug: { current: 'sluk-for-standby-strom' },
    category: 'daily_habits',
    shortDescription: 'Elspareskinne kan spare 5-10% af årligt elforbrug på elektronik.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'PlugZap',
    priority: 2
  },
  {
    _type: 'energyTip',
    title: 'Lad døre stå åbne',
    slug: { current: 'lad-dore-sta-abne' },
    category: 'daily_habits',
    shortDescription: 'Spred varmen mellem rum i stedet for individuel opvarmning.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'DoorOpen',
    priority: 3
  },
  {
    _type: 'energyTip',
    title: 'Træk opladeren ud',
    slug: { current: 'traek-opladeren-ud' },
    category: 'daily_habits',
    shortDescription: 'Mange opladere bruger 1-5W selv uden tilsluttede enheder.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Unplug',
    priority: 4
  },
  {
    _type: 'energyTip',
    title: 'Brug gardiner strategisk',
    slug: { current: 'brug-gardiner-strategisk' },
    category: 'daily_habits',
    shortDescription: 'Luk for natten, åbn for sol. Reducer varmetab med 10-25%.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Blinds',
    priority: 5
  },
  {
    _type: 'energyTip',
    title: 'Luft ud effektivt',
    slug: { current: 'luft-ud-effektivt' },
    category: 'daily_habits',
    shortDescription: '5-10 min gennemtræk i stedet for vinduer på klem hele dagen.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Wind',
    priority: 6
  },
  {
    _type: 'energyTip',
    title: 'Oplad om natten',
    slug: { current: 'oplad-om-natten' },
    category: 'daily_habits',
    shortDescription: 'Planlæg opladning af elbil og enheder til nattetimerne (22-06).',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'BatteryCharging',
    priority: 7
  },
  {
    _type: 'energyTip',
    title: 'Sluk lys efter dig',
    slug: { current: 'sluk-lys-efter-dig' },
    category: 'daily_habits',
    shortDescription: 'LED-pærer holder længere og sparer strøm ved konsekvent slukning.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'LightbulbOff',
    priority: 8
  },
  {
    _type: 'energyTip',
    title: 'Brug eftervarme fra ovn',
    slug: { current: 'brug-eftervarme-fra-ovn' },
    category: 'daily_habits',
    shortDescription: 'Sluk ovn 5-10 min før færdig og lad eftervarmen gøre arbejdet.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'ChefHat',
    priority: 9
  },
  {
    _type: 'energyTip',
    title: 'Følg dit elforbrug dagligt',
    slug: { current: 'folg-dit-elforbrug-dagligt' },
    category: 'daily_habits',
    shortDescription: 'Brug app til at identificere strømslugere og ændre vaner.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'TrendingDown',
    priority: 10
  },

  // HEATING (10 tips)
  {
    _type: 'energyTip',
    title: 'Sænk temperatur med 1°C',
    slug: { current: 'saenk-temperatur-med-1-grad' },
    category: 'heating',
    shortDescription: 'Hver grad sparer 5-7% på varmeregningen. Fra 22°C til 21°C.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Thermometer',
    priority: 1
  },
  {
    _type: 'energyTip',
    title: 'Nattemodus på termostat',
    slug: { current: 'nattemodus-pa-termostat' },
    category: 'heating',
    shortDescription: 'Sænk til 18°C om natten. Programmer timer for automatisk drift.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Moon',
    priority: 2
  },
  {
    _type: 'energyTip',
    title: 'Fri radiatorer for hindringer',
    slug: { current: 'fri-radiatorer-for-hindringer' },
    category: 'heating',
    shortDescription: 'Møbler foran radiatorer reducerer varmeeffekten med op til 40%.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Home',
    priority: 3
  },
  {
    _type: 'energyTip',
    title: 'Juster radiatorventiler',
    slug: { current: 'juster-radiatorventiler' },
    category: 'heating',
    shortDescription: 'Balancér system så alle radiatorer varmer jævnt og effektivt.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Settings',
    priority: 4
  },
  {
    _type: 'energyTip',
    title: 'Reflektér varme fra radiatorer',
    slug: { current: 'reflekter-varme-fra-radiatorer' },
    category: 'heating',
    shortDescription: 'Refleksfolie bag radiatorer sender varme ind i rummet.',
    savingsPotential: 'low',
    difficulty: 'medium',
    icon: 'Mirror',
    priority: 5
  },
  {
    _type: 'energyTip',
    title: 'Service dit fyr årligt',
    slug: { current: 'service-dit-fyr-arligt' },
    category: 'heating',
    shortDescription: 'Velholdt kedel kører 5-10% mere effektivt og holder længere.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Wrench',
    priority: 6
  },
  {
    _type: 'energyTip',
    title: 'Isolér varmerør i kælder',
    slug: { current: 'isoler-varmeror-i-kaelder' },
    category: 'heating',
    shortDescription: 'Uisolerede rør i kolde rum spilde 10-15% af energien.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'PipeSlash',
    priority: 7
  },
  {
    _type: 'energyTip',
    title: 'Udskift gamle termostatventiler',
    slug: { current: 'udskift-gamle-termostatventiler' },
    category: 'heating',
    shortDescription: 'Præcise ventiler giver bedre temperaturkontrol og mindre spild.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Gauge',
    priority: 8
  },
  {
    _type: 'energyTip',
    title: 'Luk for varme i ubrugte rum',
    slug: { current: 'luk-for-varme-i-ubrugte-rum' },
    category: 'heating',
    shortDescription: 'Sænk til 15°C i gæsteværelser og andre sjældent brugte rum.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'DoorClosed',
    priority: 9
  },
  {
    _type: 'energyTip',
    title: 'Tjek og udskift tætningslister',
    slug: { current: 'tjek-og-udskift-taetningslister' },
    category: 'heating',
    shortDescription: 'Utætte døre og vinduer giver op til 15% ekstra varmetab.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Shield',
    priority: 10
  },

  // LIGHTING (8 tips)
  {
    _type: 'energyTip',
    title: 'Udskift alle til LED-pærer',
    slug: { current: 'udskift-alle-til-led-paerer' },
    category: 'lighting',
    shortDescription: 'LED bruger 85% mindre strøm og holder 25 gange længere.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Lightbulb',
    priority: 1
  },
  {
    _type: 'energyTip',
    title: 'Brug dæmpbare LED-pærer',
    slug: { current: 'brug-daempbare-led-paerer' },
    category: 'lighting',
    shortDescription: 'Dæmp belysning til 70% og spar 20% strøm med samme komfort.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'SunDim',
    priority: 2
  },
  {
    _type: 'energyTip',
    title: 'Installer bevægelsessensorer',
    slug: { current: 'installer-bevaegelsessensorer' },
    category: 'lighting',
    shortDescription: 'Automatisk tænd/sluk i entre og badeværelser sparer 30-50%.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Sensor',
    priority: 3
  },
  {
    _type: 'energyTip',
    title: 'Brug naturligt lys om dagen',
    slug: { current: 'brug-naturligt-lys-om-dagen' },
    category: 'lighting',
    shortDescription: 'Sluk kunstigt lys når dagslys er tilstrækkeligt til opgaverne.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Sun',
    priority: 4
  },
  {
    _type: 'energyTip',
    title: 'Vælg spot-belysning',
    slug: { current: 'vaelg-spot-belysning' },
    category: 'lighting',
    shortDescription: 'Belys kun hvor det bruges i stedet for at oplyse hele rummet.',
    savingsPotential: 'low',
    difficulty: 'medium',
    icon: 'Flashlight',
    priority: 5
  },
  {
    _type: 'energyTip',
    title: 'Timer på udendørslys',
    slug: { current: 'timer-pa-udendorslys' },
    category: 'lighting',
    shortDescription: 'Automatisk styring sikrer lys kun tændt når det er nødvendigt.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Timer',
    priority: 6
  },
  {
    _type: 'energyTip',
    title: 'Rengør lamper og vinduer',
    slug: { current: 'rengor-lamper-og-vinduer' },
    category: 'lighting',
    shortDescription: 'Snavs reducerer lysudbytte med op til 30%. Rengør månedligt.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Sparkles',
    priority: 7
  },
  {
    _type: 'energyTip',
    title: 'Varm belysning om aftenen',
    slug: { current: 'varm-belysning-om-aftenen' },
    category: 'lighting',
    shortDescription: '2700K LED om aftenen bruger mindre strøm end kold hvidt lys.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Sunset',
    priority: 8
  },

  // APPLIANCES (10 tips)
  {
    _type: 'energyTip',
    title: 'Fyld opvaskemaskine helt op',
    slug: { current: 'fyld-opvaskemaskine-helt-op' },
    category: 'appliances',
    shortDescription: 'Fuld maskine bruger samme strøm og vand som halvt fyldt.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Utensils',
    priority: 1
  },
  {
    _type: 'energyTip',
    title: 'Brug ECO-program på hvidevarer',
    slug: { current: 'brug-eco-program-pa-hvidevarer' },
    category: 'appliances',
    shortDescription: 'Eco-programmer sparer 20-40% strøm ved lidt længere køretid.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Leaf',
    priority: 2
  },
  {
    _type: 'energyTip',
    title: 'Korrekt køleskab temperatur',
    slug: { current: 'korrekt-koleskab-temperatur' },
    category: 'appliances',
    shortDescription: 'Hold køleskab på 5°C og fryser på -18°C for optimal effekt.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Refrigerator',
    priority: 3
  },
  {
    _type: 'energyTip',
    title: 'Afrim fryser når islag >5mm',
    slug: { current: 'afrim-fryser-nar-islag-5mm' },
    category: 'appliances',
    shortDescription: '5mm is øger forbruget med 30%. Afrim regelmæssigt.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Snowflake',
    priority: 4
  },
  {
    _type: 'energyTip',
    title: 'Vask tøj ved 30°C',
    slug: { current: 'vask-toj-ved-30-grader' },
    category: 'appliances',
    shortDescription: 'Moderne vaskemiddel virker ved lav temperatur. Spar 90% energi.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'WashingMachine',
    priority: 5
  },
  {
    _type: 'energyTip',
    title: 'Tør tøj på snor frem for tumbler',
    slug: { current: 'tor-toj-pa-snor-frem-for-tumbler' },
    category: 'appliances',
    shortDescription: 'Tørretumbler er blandt de mest strømkrævende husholdningsapparater.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Shirt',
    priority: 6
  },
  {
    _type: 'energyTip',
    title: 'Brug låg når du koger',
    slug: { current: 'brug-lag-nar-du-koger' },
    category: 'appliances',
    shortDescription: 'Låg på gryder reducerer kogetid og energiforbrug med op til 50%.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'ChefHat',
    priority: 7
  },
  {
    _type: 'energyTip',
    title: 'Vælg A-mærkede apparater',
    slug: { current: 'vaelg-a-maerkede-apparater' },
    category: 'appliances',
    shortDescription: 'A-mærkning bruger 20-50% mindre strøm end ældre mærkninger.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Award',
    priority: 8
  },
  {
    _type: 'energyTip',
    title: 'Brug elkedel til kogning',
    slug: { current: 'brug-elkedel-til-kogning' },
    category: 'appliances',
    shortDescription: 'Elkedel er 50% mere effektiv end at koge vand på komfur.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Coffee',
    priority: 9
  },
  {
    _type: 'energyTip',
    title: 'Rengør filter i tørretumbler',
    slug: { current: 'rengor-filter-i-torretumbler' },
    category: 'appliances',
    shortDescription: 'Tilstoppet filter øger tørretid og energiforbrug betydeligt.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Filter',
    priority: 10
  },

  // INSULATION (6 tips)
  {
    _type: 'energyTip',
    title: 'Efterisoler loft til 300mm',
    slug: { current: 'efterisoler-loft-til-300mm' },
    category: 'insulation',
    shortDescription: 'Loft-isolering giver størst effekt. Reducer varmetab med 25%.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Home',
    priority: 1
  },
  {
    _type: 'energyTip',
    title: 'Udskift til 3-lags energiruder',
    slug: { current: 'udskift-til-3-lags-energiruder' },
    category: 'insulation',
    shortDescription: 'Moderne vinduer reducerer varmetab gennem glas med 70%.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Square',
    priority: 2
  },
  {
    _type: 'energyTip',
    title: 'Isolér hulrum i ydervægge',
    slug: { current: 'isoler-hulrum-i-ydervaegge' },
    category: 'insulation',
    shortDescription: 'Billig isolering der kan spare 10-15% på varmeregningen.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Layers',
    priority: 3
  },
  {
    _type: 'energyTip',
    title: 'Tæt revner og sprækker',
    slug: { current: 'taet-revner-og-spraekker' },
    category: 'insulation',
    shortDescription: 'Brug fugemasse omkring vindueskarme og dørrammer.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Paintbrush',
    priority: 4
  },
  {
    _type: 'energyTip',
    title: 'Isolér krybekælder/kælderlag',
    slug: { current: 'isoler-krybekaelder-kaelderlag' },
    category: 'insulation',
    shortDescription: 'Kold kælder under giver kolde gulve og øget varmebehov.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'ArrowDown',
    priority: 5
  },
  {
    _type: 'energyTip',
    title: 'Installer smart ventilation',
    slug: { current: 'installer-smart-ventilation' },
    category: 'insulation',
    shortDescription: 'Ventilation med varmegenvinding sikrer frisk luft uden tab.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Fan',
    priority: 6
  },

  // SMART TECH (6 tips)
  {
    _type: 'energyTip',
    title: 'Installer smart termostat',
    slug: { current: 'installer-smart-termostat' },
    category: 'smart_tech',
    shortDescription: 'Automatisk temperaturkontrol baseret på rutiner sparer 10-15%.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Thermometer',
    priority: 1
  },
  {
    _type: 'energyTip',
    title: 'Smarte kontakter til elektronik',
    slug: { current: 'smarte-kontakter-til-elektronik' },
    category: 'smart_tech',
    shortDescription: 'Automatisk slukning af standby-strøm når du forlader hjemmet.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Plug',
    priority: 2
  },
  {
    _type: 'energyTip',
    title: 'Smart styring af belysning',
    slug: { current: 'smart-styring-af-belysning' },
    category: 'smart_tech',
    shortDescription: 'Timer og automatisk dæmpning reducerer lysforbrug med 20%.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Lightbulb',
    priority: 3
  },
  {
    _type: 'energyTip',
    title: 'Energimonitorering system',
    slug: { current: 'energimonitorering-system' },
    category: 'smart_tech',
    shortDescription: 'Real-time indsigt i forbrug hjælper med at identificere spild.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'BarChart3',
    priority: 4
  },
  {
    _type: 'energyTip',
    title: 'Smart elbil-opladning',
    slug: { current: 'smart-elbil-opladning' },
    category: 'smart_tech',
    shortDescription: 'Automatisk opladning når strømmen er billigst og grønnest.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Car',
    priority: 5
  },
  {
    _type: 'energyTip',
    title: 'Intelligente radiatorventiler',
    slug: { current: 'intelligente-radiatorventiler' },
    category: 'smart_tech',
    shortDescription: 'Individuel rumstyring og tidsplaner for optimal varmefordeling.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Settings2',
    priority: 6
  }
]

async function createEnergyTips() {
  console.log('Creating 50 energy tips in Sanity...')
  
  let created = 0
  let errors = 0
  
  for (const tip of energyTips) {
    try {
      const result = await client.createOrReplace({
        _id: `energyTip.${tip.slug.current}`,
        ...tip
      })
      created++
      console.log(`✓ Created tip ${created}/50: ${tip.title}`)
    } catch (error) {
      errors++
      console.error(`✗ Error creating tip "${tip.title}":`, error)
    }
  }
  
  console.log(`\n✅ Completed: ${created} tips created, ${errors} errors`)
}

createEnergyTips().catch(console.error)