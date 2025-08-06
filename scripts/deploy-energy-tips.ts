import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// 50 Energy Saving Tips Data
const energyTips = [
  // DAILY HABITS (10 tips)
  {
    title: 'Flyt forbrug til billige timer',
    slug: { current: 'flyt-forbrug-billige-timer' },
    category: 'daily_habits',
    shortDescription: 'Brug strøm 12-16 når prisen er lavest. Spar 20-30% på regningen.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Clock',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: '5 minutter',
    priority: 1
  },
  {
    title: 'Sluk for standby-strøm',
    slug: { current: 'sluk-standby-strom' },
    category: 'daily_habits',
    shortDescription: 'Elspareskinne kan spare 5-10% af årligt elforbrug på elektronik.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'PlugZap',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '10 minutter',
    priority: 2
  },
  {
    title: 'Lad døre stå åbne',
    slug: { current: 'lad-dore-sta-abne' },
    category: 'daily_habits',
    shortDescription: 'Spred varmen mellem rum i stedet for individuel opvarmning.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'DoorOpen',
    estimatedSavings: 'Spar 2-5%',
    implementationTime: 'Øjeblikkelig',
    priority: 3
  },
  {
    title: 'Træk opladeren ud',
    slug: { current: 'traek-opladeren-ud' },
    category: 'daily_habits',
    shortDescription: 'Mange opladere bruger 1-5W selv uden tilsluttede enheder.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Unplug',
    estimatedSavings: '50-100 kr/år',
    implementationTime: 'Øjeblikkelig',
    priority: 4
  },
  {
    title: 'Brug gardiner strategisk',
    slug: { current: 'brug-gardiner-strategisk' },
    category: 'daily_habits',
    shortDescription: 'Luk for natten, åbn for sol. Reducer varmetab med 10-25%.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Blinds',
    estimatedSavings: 'Spar 10-25%',
    implementationTime: '5 minutter',
    priority: 5
  },
  {
    title: 'Luft ud effektivt',
    slug: { current: 'luft-ud-effektivt' },
    category: 'daily_habits',
    shortDescription: '5-10 min gennemtræk i stedet for vinduer på klem hele dagen.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Wind',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '5 minutter',
    priority: 6
  },
  {
    title: 'Oplad om natten',
    slug: { current: 'oplad-om-natten' },
    category: 'daily_habits',
    shortDescription: 'Planlæg opladning af elbil og enheder til nattetimerne (22-06).',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'BatteryCharging',
    estimatedSavings: 'Spar 15-25%',
    implementationTime: '10 minutter',
    priority: 7
  },
  {
    title: 'Sluk lys efter dig',
    slug: { current: 'sluk-lys-efter-dig' },
    category: 'daily_habits',
    shortDescription: 'LED-pærer holder længere og sparer strøm ved konsekvent slukning.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'LightbulbOff',
    estimatedSavings: '100-200 kr/år',
    implementationTime: 'Øjeblikkelig',
    priority: 8
  },
  {
    title: 'Brug eftervarme fra ovn',
    slug: { current: 'brug-eftervarme-fra-ovn' },
    category: 'daily_habits',
    shortDescription: 'Sluk ovn 5-10 min før færdig og lad eftervarmen gøre arbejdet.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'ChefHat',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: 'Øjeblikkelig',
    priority: 9
  },
  {
    title: 'Følg dit elforbrug dagligt',
    slug: { current: 'folg-elforbrug-dagligt' },
    category: 'daily_habits',
    shortDescription: 'Brug app til at identificere strømslugere og ændre vaner.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'TrendingDown',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: '15 minutter',
    priority: 10
  },

  // HEATING (10 tips)
  {
    title: 'Sænk temperatur med 1°C',
    slug: { current: 'saenk-temperatur-1-grad' },
    category: 'heating',
    shortDescription: 'Hver grad sparer 5-7% på varmeregningen. Fra 22°C til 21°C.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Thermometer',
    estimatedSavings: 'Spar 5-7% per grad',
    implementationTime: '2 minutter',
    priority: 1
  },
  {
    title: 'Nattemodus på termostat',
    slug: { current: 'nattemodus-termostat' },
    category: 'heating',
    shortDescription: 'Sænk til 18°C om natten. Programmer timer for automatisk drift.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Moon',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: '10 minutter',
    priority: 2
  },
  {
    title: 'Fri radiatorer for hindringer',
    slug: { current: 'fri-radiatorer-hindringer' },
    category: 'heating',
    shortDescription: 'Møbler foran radiatorer reducerer varmeeffekten med op til 40%.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Home',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '30 minutter',
    priority: 3
  },
  {
    title: 'Juster radiatorventiler',
    slug: { current: 'juster-radiatorventiler' },
    category: 'heating',
    shortDescription: 'Balancér system så alle radiatorer varmer jævnt og effektivt.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Settings',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '1-2 timer',
    priority: 4
  },
  {
    title: 'Reflektér varme fra radiatorer',
    slug: { current: 'reflekter-varme-radiatorer' },
    category: 'heating',
    shortDescription: 'Refleksfolie bag radiatorer sender varme ind i rummet.',
    savingsPotential: 'low',
    difficulty: 'medium',
    icon: 'Shield',
    estimatedSavings: 'Spar 2-5%',
    implementationTime: '2 timer',
    priority: 5
  },
  {
    title: 'Service dit fyr årligt',
    slug: { current: 'service-fyr-arligt' },
    category: 'heating',
    shortDescription: 'Velholdt kedel kører 5-10% mere effektivt og holder længere.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Wrench',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: 'Professionel hjælp',
    priority: 6
  },
  {
    title: 'Isolér varmerør i kælder',
    slug: { current: 'isoler-varmeror-kaelder' },
    category: 'heating',
    shortDescription: 'Uisolerede rør i kolde rum spilder 10-15% af energien.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Home',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: '3-4 timer',
    priority: 7
  },
  {
    title: 'Udskift gamle termostatventiler',
    slug: { current: 'udskift-termostatventiler' },
    category: 'heating',
    shortDescription: 'Præcise ventiler giver bedre temperaturkontrol og mindre spild.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Gauge',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '2-3 timer',
    priority: 8
  },
  {
    title: 'Luk for varme i ubrugte rum',
    slug: { current: 'luk-varme-ubrugte-rum' },
    category: 'heating',
    shortDescription: 'Sænk til 15°C i gæsteværelser og andre sjældent brugte rum.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'DoorClosed',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '5 minutter',
    priority: 9
  },
  {
    title: 'Tjek og udskift tætningslister',
    slug: { current: 'tjek-udskift-taetningslister' },
    category: 'heating',
    shortDescription: 'Utætte døre og vinduer giver op til 15% ekstra varmetab.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Shield',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: '2-3 timer',
    priority: 10
  },

  // LIGHTING (8 tips)
  {
    title: 'Udskift alle til LED-pærer',
    slug: { current: 'udskift-led-paerer' },
    category: 'lighting',
    shortDescription: 'LED bruger 85% mindre strøm og holder 25 gange længere.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Lightbulb',
    estimatedSavings: 'Spar 85%',
    implementationTime: '30 minutter',
    priority: 1
  },
  {
    title: 'Brug dæmpbare LED-pærer',
    slug: { current: 'brug-daempbare-led' },
    category: 'lighting',
    shortDescription: 'Dæmp belysning til 70% og spar 20% strøm med samme komfort.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'SunDim',
    estimatedSavings: 'Spar 20%',
    implementationTime: '30 minutter',
    priority: 2
  },
  {
    title: 'Tidsstyring af udendørslys',
    slug: { current: 'tidsstyring-udendorslys' },
    category: 'lighting',
    shortDescription: 'Automatisk tænd/sluk efter solnedgang sparer 30-40% på udendørslys.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'CalendarClock',
    estimatedSavings: 'Spar 30-40%',
    implementationTime: '1 time',
    priority: 3
  },
  {
    title: 'Dagslyssensorer i kontorer',
    slug: { current: 'dagslyssensorer-kontorer' },
    category: 'lighting',
    shortDescription: 'Juster automatisk belysning efter naturligt lys. Spar 20-30%.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Sun',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Professionel hjælp',
    priority: 4
  },
  {
    title: 'Zonebelysning i store rum',
    slug: { current: 'zonebelysning-store-rum' },
    category: 'lighting',
    shortDescription: 'Belys kun arbejdsområder i stedet for hele rummet.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'MonitorSpeaker',
    estimatedSavings: 'Spar 15-25%',
    implementationTime: '1 time',
    priority: 5
  },
  {
    title: 'Rengør lamper og pærer',
    slug: { current: 'rengor-lamper-paerer' },
    category: 'lighting',
    shortDescription: 'Støv reducerer lysudbytte med 20%. Rengør hver 3. måned.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Lightbulb',
    estimatedSavings: 'Bedre lysudbytte',
    implementationTime: '30 minutter',
    priority: 6
  },
  {
    title: 'Vælg lyse farver på vægge',
    slug: { current: 'vaelg-lyse-farver' },
    category: 'lighting',
    shortDescription: 'Lyse vægge reflekterer mere lys og kræver mindre belysning.',
    savingsPotential: 'medium',
    difficulty: 'hard',
    icon: 'Sun',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: 'Professionel hjælp',
    priority: 7
  },
  {
    title: 'Brug bevægelsessensorer',
    slug: { current: 'brug-bevaegelsessensorer' },
    category: 'lighting',
    shortDescription: 'Automatisk tænd/sluk i gange og lager sparer 30-50% strøm.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Activity',
    estimatedSavings: 'Spar 30-50%',
    implementationTime: '2 timer',
    priority: 8
  },

  // APPLIANCES (10 tips)
  {
    title: 'Vask ved 30°C',
    slug: { current: 'vask-ved-30-grader' },
    category: 'appliances',
    shortDescription: 'Spar 40% strøm sammenlignet med 60°C vask. Moderne sæbe er effektiv.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Shirt',
    estimatedSavings: 'Spar 40%',
    implementationTime: 'Øjeblikkelig',
    priority: 1
  },
  {
    title: 'Fyldt vaskemaskine',
    slug: { current: 'fyldt-vaskemaskine' },
    category: 'appliances',
    shortDescription: 'Vask kun med fuld maskine. Halvfyldt bruger næsten samme strøm.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'WashingMachine',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Øjeblikkelig',
    priority: 2
  },
  {
    title: 'Spring tørretumbler over',
    slug: { current: 'spring-torretumbler-over' },
    category: 'appliances',
    shortDescription: 'Lufttørring sparer 3-5 kWh per vask. Brug tørresnor eller stativ.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Wind',
    estimatedSavings: '10-15 kr/vask',
    implementationTime: '10 minutter',
    priority: 3
  },
  {
    title: 'Opvask ved fuld maskine',
    slug: { current: 'opvask-fuld-maskine' },
    category: 'appliances',
    shortDescription: 'Moderne opvaskemaskiner bruger mindre vand og strøm end håndvask.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'UtensilsCrossed',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Øjeblikkelig',
    priority: 4
  },
  {
    title: 'Eco-program på opvasker',
    slug: { current: 'eco-program-opvasker' },
    category: 'appliances',
    shortDescription: 'Eco tager længere tid men bruger 30-40% mindre strøm og vand.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'DropletIcon',
    estimatedSavings: 'Spar 30-40%',
    implementationTime: '2 minutter',
    priority: 5
  },
  {
    title: 'Køleskab ved 5°C',
    slug: { current: 'koleskab-5-grader' },
    category: 'appliances',
    shortDescription: 'Hver grad koldere bruger 5% mere strøm. 5°C er ideelt.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Refrigerator',
    estimatedSavings: 'Spar 5% per grad',
    implementationTime: '2 minutter',
    priority: 6
  },
  {
    title: 'Fryser ved -18°C',
    slug: { current: 'fryser-minus-18' },
    category: 'appliances',
    shortDescription: 'Koldere end -18°C er unødvendigt og koster 5% ekstra per grad.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Snowflake',
    estimatedSavings: 'Spar 5% per grad',
    implementationTime: '2 minutter',
    priority: 7
  },
  {
    title: 'Afrim fryser kvartalsvis',
    slug: { current: 'afrim-fryser-kvartalsvis' },
    category: 'appliances',
    shortDescription: '3mm is øger strømforbrug med 20%. Afrim hver 3. måned.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Snowflake',
    estimatedSavings: 'Spar 20%',
    implementationTime: '3 timer',
    priority: 8
  },
  {
    title: 'Brug elkedel frem for komfur',
    slug: { current: 'brug-elkedel' },
    category: 'appliances',
    shortDescription: 'Elkedel er 80% effektiv vs. 40% for komfur ved vandkogning.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Coffee',
    estimatedSavings: 'Spar 50%',
    implementationTime: 'Øjeblikkelig',
    priority: 9
  },
  {
    title: 'Luk låg på gryder',
    slug: { current: 'luk-lag-gryder' },
    category: 'appliances',
    shortDescription: 'Låg holder varmen og reducerer kogetid med 25-30%.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Soup',
    estimatedSavings: 'Spar 25-30%',
    implementationTime: 'Øjeblikkelig',
    priority: 10
  },

  // INSULATION (6 tips)
  {
    title: 'Efterisoler loft',
    slug: { current: 'efterisoler-loft' },
    category: 'insulation',
    shortDescription: '300mm isolering på loft kan spare 15-20% på varmeregning.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Home',
    estimatedSavings: 'Spar 15-20%',
    implementationTime: 'Professionel hjælp',
    priority: 1
  },
  {
    title: 'Hulmursisolering',
    slug: { current: 'hulmursisolering' },
    category: 'insulation',
    shortDescription: 'Fyld hulrum i ydermure. Reducer varmetab med 20-30%.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Building2',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Professionel hjælp',
    priority: 2
  },
  {
    title: 'Energiruder i vinduer',
    slug: { current: 'energiruder-vinduer' },
    category: 'insulation',
    shortDescription: '3-lags energiruder halverer varmetab vs. gamle termoruder.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Shield',
    estimatedSavings: 'Spar 50%',
    implementationTime: 'Professionel hjælp',
    priority: 3
  },
  {
    title: 'Tætningslister ved døre',
    slug: { current: 'taetningslister-dore' },
    category: 'insulation',
    shortDescription: 'Stop træk og spar 5-10% på varme. Udskift hvert 5. år.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Shield',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '1 time',
    priority: 4
  },
  {
    title: 'Isolér gulv mod kælder',
    slug: { current: 'isoler-gulv-kaelder' },
    category: 'insulation',
    shortDescription: 'Uisoleret gulv over kold kælder taber 10-15% varme.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Home',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: 'Professionel hjælp',
    priority: 5
  },
  {
    title: 'Forsatsvinduer om vinteren',
    slug: { current: 'forsatsvinduer-vinteren' },
    category: 'insulation',
    shortDescription: 'Midlertidig ekstra rude reducerer varmetab med 30-40%.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Shield',
    estimatedSavings: 'Spar 30-40%',
    implementationTime: '2-3 timer',
    priority: 6
  },

  // SMART TECH (6 tips)
  {
    title: 'Smart termostat',
    slug: { current: 'smart-termostat' },
    category: 'smart_tech',
    shortDescription: 'Lærer dine vaner og justerer automatisk. Spar 15-20% på varme.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Smartphone',
    estimatedSavings: 'Spar 15-20%',
    implementationTime: '1-2 timer',
    priority: 1
  },
  {
    title: 'Smart elmåler med app',
    slug: { current: 'smart-elmaler-app' },
    category: 'smart_tech',
    shortDescription: 'Se forbrug i realtid og få advarsler ved højt forbrug.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'BarChart3',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: '30 minutter',
    priority: 2
  },
  {
    title: 'Wifi-kontakter til apparater',
    slug: { current: 'wifi-kontakter' },
    category: 'smart_tech',
    shortDescription: 'Fjernstyr og tidsstyr apparater. Sluk automatisk standby.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Wifi',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '30 minutter',
    priority: 3
  },
  {
    title: 'Varmepumpe med AI-styring',
    slug: { current: 'varmepumpe-ai' },
    category: 'smart_tech',
    shortDescription: 'AI optimerer drift efter vejr og elpris. Spar 20-30%.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Cpu',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Professionel hjælp',
    priority: 4
  },
  {
    title: 'Smart belysningssystem',
    slug: { current: 'smart-belysningssystem' },
    category: 'smart_tech',
    shortDescription: 'Automatisk justering efter dagslys og tilstedeværelse.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Lightbulb',
    estimatedSavings: 'Spar 15-25%',
    implementationTime: '2-3 timer',
    priority: 5
  },
  {
    title: 'Elbil som batteribank',
    slug: { current: 'elbil-batteribank' },
    category: 'smart_tech',
    shortDescription: 'V2H teknologi bruger bilens batteri til at lagre billig natstrøm.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'BatteryCharging',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Professionel hjælp',
    priority: 6
  }
]

async function deployEnergyTips() {
  try {
    console.log('Starting deployment of 50 energy saving tips...')
    
    const createdTips = []
    const tipIds = []
    
    // Create all tips
    for (const tip of energyTips) {
      console.log(`Creating tip: ${tip.title}`)
      
      const tipDocument = {
        _type: 'energyTip',
        ...tip,
        detailedDescription: [
          {
            _type: 'block',
            _key: `block-${tip.slug.current}`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: `span-${tip.slug.current}`,
                text: tip.shortDescription,
                marks: []
              }
            ]
          }
        ]
      }
      
      try {
        const result = await client.create(tipDocument)
        createdTips.push(result)
        tipIds.push({
          _type: 'reference',
          _ref: result._id,
          _key: `ref-${result._id}`
        })
        console.log(`✅ Created: ${tip.title} (ID: ${result._id})`)
      } catch (error) {
        console.error(`❌ Failed to create ${tip.title}:`, error)
      }
    }
    
    console.log(`\n✅ Successfully created ${createdTips.length} energy tips!`)
    
    // Now update the energyTipsSection on the page
    console.log('\nUpdating Energibesparende Tips page with references...')
    
    const pageQuery = `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0]`
    const page = await client.fetch(pageQuery)
    
    if (page) {
      // Find the energyTipsSection block
      const updatedBlocks = page.contentBlocks.map((block: any) => {
        if (block._type === 'energyTipsSection') {
          return {
            ...block,
            tips: tipIds // Add all tip references
          }
        }
        return block
      })
      
      // Update the page
      await client
        .patch(page._id)
        .set({ contentBlocks: updatedBlocks })
        .commit()
      
      console.log('✅ Updated page with tip references!')
    }
    
    console.log('\n🎉 Deployment complete!')
    console.log('View tips at: https://dinelportal.sanity.studio/structure/energyTip')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

deployEnergyTips()