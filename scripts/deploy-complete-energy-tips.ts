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

// Complete list of 50 Energy Saving Tips
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
    title: 'Gulvvarme på timer',
    slug: { current: 'gulvvarme-timer' },
    category: 'heating',
    shortDescription: 'Start 30 min før du står op. Sluk når du går på arbejde.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Timer',
    estimatedSavings: 'Spar 10-20%',
    implementationTime: '15 minutter',
    priority: 6
  },
  {
    title: 'Luk ubrugte rum',
    slug: { current: 'luk-ubrugte-rum' },
    category: 'heating',
    shortDescription: 'Hold døre lukket til kolde rum og sænk varmen der.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'DoorClosed',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: 'Øjeblikkelig',
    priority: 7
  },
  {
    title: 'Programmer ferietemperatur',
    slug: { current: 'programmer-ferietemperatur' },
    category: 'heating',
    shortDescription: 'Sænk til 15°C når du er væk mere end 2 dage.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Plane',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: '5 minutter',
    priority: 8
  },
  {
    title: 'Varmecheck hver sæson',
    slug: { current: 'varmecheck-hver-saeson' },
    category: 'heating',
    shortDescription: 'Rens radiatorer og udluft system for optimal ydelse.',
    savingsPotential: 'low',
    difficulty: 'medium',
    icon: 'Wrench',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '1 time',
    priority: 9
  },
  {
    title: 'Zoneopdelt varme',
    slug: { current: 'zoneopdelt-varme' },
    category: 'heating',
    shortDescription: 'Varm kun de rum du bruger med intelligente termostater.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Layout',
    estimatedSavings: 'Spar 15-25%',
    implementationTime: 'Professionel hjælp',
    priority: 10
  },

  // LIGHTING (8 tips)
  {
    title: 'Udskift til LED-pærer',
    slug: { current: 'udskift-led-paerer' },
    category: 'lighting',
    shortDescription: 'LED bruger 85% mindre strøm og holder 15-25 år.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Lightbulb',
    estimatedSavings: 'Spar 85%',
    implementationTime: '30 minutter',
    priority: 1
  },
  {
    title: 'Bevægelsessensorer',
    slug: { current: 'bevaegelsessensorer' },
    category: 'lighting',
    shortDescription: 'Automatisk lys i gang, gæstetoilet og kælder.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Activity',
    estimatedSavings: 'Spar 30-40%',
    implementationTime: '1-2 timer',
    priority: 2
  },
  {
    title: 'Lysdæmpere på stuer',
    slug: { current: 'lysdaempere-stuer' },
    category: 'lighting',
    shortDescription: 'Dæmp lys 25% og spar 20% strøm uden at mærke forskel.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Sliders',
    estimatedSavings: 'Spar 20%',
    implementationTime: '2 timer',
    priority: 3
  },
  {
    title: 'Solcellelamper i haven',
    slug: { current: 'solcellelamper-haven' },
    category: 'lighting',
    shortDescription: 'Gratis belysning hele sommeren uden ledninger.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Sun',
    estimatedSavings: '100% gratis',
    implementationTime: '1 time',
    priority: 4
  },
  {
    title: 'Timer på julelys',
    slug: { current: 'timer-julelys' },
    category: 'lighting',
    shortDescription: 'Tænd kun 16-23 i stedet for hele døgnet.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'TreePine',
    estimatedSavings: 'Spar 70%',
    implementationTime: '10 minutter',
    priority: 5
  },
  {
    title: 'Udnyt dagslys optimalt',
    slug: { current: 'udnyt-dagslys' },
    category: 'lighting',
    shortDescription: 'Lyse farver på vægge og spejle reflekterer naturligt lys.',
    savingsPotential: 'low',
    difficulty: 'medium',
    icon: 'Sunrise',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: 'Ved renovering',
    priority: 6
  },
  {
    title: 'Fokuseret arbejdslys',
    slug: { current: 'fokuseret-arbejdslys' },
    category: 'lighting',
    shortDescription: 'Skrivebordslampe frem for at lyse hele rummet op.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Lamp',
    estimatedSavings: 'Spar 50%',
    implementationTime: 'Øjeblikkelig',
    priority: 7
  },
  {
    title: 'Smart belysning',
    slug: { current: 'smart-belysning' },
    category: 'lighting',
    shortDescription: 'Styr alle lamper med app og skemaer.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Smartphone',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: '2-3 timer',
    priority: 8
  },

  // APPLIANCES (10 tips)
  {
    title: 'Vask ved 30°C',
    slug: { current: 'vask-30-grader' },
    category: 'appliances',
    shortDescription: '30°C bruger 40% mindre strøm end 40°C. Moderne sæbe renser fint.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Shirt',
    estimatedSavings: 'Spar 40%',
    implementationTime: 'Øjeblikkelig',
    priority: 1
  },
  {
    title: 'Fyld vaskemaskinen op',
    slug: { current: 'fyld-vaskemaskinen' },
    category: 'appliances',
    shortDescription: 'Fuld maskine bruger samme strøm som halvfuld.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Package',
    estimatedSavings: 'Spar 50%',
    implementationTime: 'Øjeblikkelig',
    priority: 2
  },
  {
    title: 'Tørretumbler kun vinter',
    slug: { current: 'torretumbler-kun-vinter' },
    category: 'appliances',
    shortDescription: 'Lufttørring er gratis og skåner tøjet bedre.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Wind',
    estimatedSavings: 'Spar 100% sommer',
    implementationTime: '30 minutter',
    priority: 3
  },
  {
    title: 'Opvaskemaskine vs håndvask',
    slug: { current: 'opvaskemaskine-vs-handvask' },
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
    icon: 'Droplet',
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
    icon: 'Layers',
    estimatedSavings: 'Spar 20-30%',
    implementationTime: 'Professionel hjælp',
    priority: 2
  },
  {
    title: 'Tætn vinduer og døre',
    slug: { current: 'taetn-vinduer-dore' },
    category: 'insulation',
    shortDescription: 'Tætningslister stopper træk og sparer 5-10% varme.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Square',
    estimatedSavings: 'Spar 5-10%',
    implementationTime: '2 timer',
    priority: 3
  },
  {
    title: 'Energiruder',
    slug: { current: 'energiruder' },
    category: 'insulation',
    shortDescription: '3-lags energiruder halverer varmetab vs. gamle termoruder.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Grid3x3',
    estimatedSavings: 'Spar 50%',
    implementationTime: 'Professionel hjælp',
    priority: 4
  },
  {
    title: 'Isoler rørføringer',
    slug: { current: 'isoler-rorforinger' },
    category: 'insulation',
    shortDescription: 'Isolering af varmerør i kælder sparer unødigt varmetab.',
    savingsPotential: 'low',
    difficulty: 'medium',
    icon: 'Pipette',
    estimatedSavings: 'Spar 3-5%',
    implementationTime: '3 timer',
    priority: 5
  },
  {
    title: 'Tyk gardin som isolering',
    slug: { current: 'tyk-gardin-isolering' },
    category: 'insulation',
    shortDescription: 'Termogardiner reducerer varmetab gennem vinduer med 10-15%.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Blinds',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: '1 time',
    priority: 6
  },

  // SMART TECH (6 tips)
  {
    title: 'Smart termostat',
    slug: { current: 'smart-termostat' },
    category: 'smart_tech',
    shortDescription: 'Lærer dine vaner og justerer automatisk. Spar 15-20%.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Thermometer',
    estimatedSavings: 'Spar 15-20%',
    implementationTime: '1-2 timer',
    priority: 1
  },
  {
    title: 'Timerfunktion på apparater',
    slug: { current: 'timer-funktion-apparater' },
    category: 'smart_tech',
    shortDescription: 'Start vaskemaskine når strømmen er billigst.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Clock',
    estimatedSavings: 'Spar 10-20%',
    implementationTime: '15 minutter',
    priority: 2
  },
  {
    title: 'Energimåler på eltavle',
    slug: { current: 'energimaaler-eltavle' },
    category: 'smart_tech',
    shortDescription: 'Se realtidsforbrug og find strømslugere øjeblikkeligt.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'BarChart',
    estimatedSavings: 'Spar 10-15%',
    implementationTime: 'Professionel hjælp',
    priority: 3
  },
  {
    title: 'Smart home automation',
    slug: { current: 'smart-home-automation' },
    category: 'smart_tech',
    shortDescription: 'Scenarier der slukker alt når du går hjemmefra.',
    savingsPotential: 'medium',
    difficulty: 'hard',
    icon: 'Home',
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

async function deployCompleteEnergyTips() {
  try {
    console.log('🚀 Starting comprehensive energy tips deployment...\n')
    
    // Step 1: Check and delete existing tips to avoid duplicates
    console.log('📋 Step 1: Checking for existing energy tips...')
    const existingTips = await client.fetch(`*[_type == "energyTip"]`)
    
    if (existingTips.length > 0) {
      console.log(`Found ${existingTips.length} existing tips. Deleting them to avoid duplicates...`)
      for (const tip of existingTips) {
        await client.delete(tip._id)
      }
      console.log('✅ Existing tips deleted.\n')
    } else {
      console.log('No existing tips found.\n')
    }
    
    // Step 2: Create all energy tip documents
    console.log('📋 Step 2: Creating 50 energy tip documents...')
    const createdTips = []
    const tipReferences = []
    
    for (const tip of energyTips) {
      console.log(`Creating: ${tip.title}`)
      
      const tipDocument = {
        _type: 'energyTip',
        title: tip.title,
        slug: tip.slug,
        category: tip.category,
        shortDescription: tip.shortDescription,
        savingsPotential: tip.savingsPotential,
        difficulty: tip.difficulty,
        icon: tip.icon,
        priority: tip.priority
      }
      
      try {
        const result = await client.create(tipDocument)
        createdTips.push(result)
        tipReferences.push({
          _type: 'reference',
          _ref: result._id,
          _key: `ref-${result._id}`
        })
        console.log(`✅ Created: ${tip.title}`)
      } catch (error) {
        console.error(`❌ Failed to create ${tip.title}:`, error)
      }
    }
    
    console.log(`\n✅ Successfully created ${createdTips.length} energy tips!\n`)
    
    // Step 3: Find pages with energyTipsSection and update them
    console.log('📋 Step 3: Finding pages with energyTipsSection to update...')
    
    const pagesWithEnergyTips = await client.fetch(
      `*[_type == "page" && contentBlocks[_type == "energyTipsSection"]]`
    )
    
    if (pagesWithEnergyTips.length === 0) {
      console.log('No pages found with energyTipsSection. Deployment complete!')
      return
    }
    
    console.log(`Found ${pagesWithEnergyTips.length} page(s) with energyTipsSection\n`)
    
    // Step 4: Update each page with tip references
    for (const page of pagesWithEnergyTips) {
      console.log(`Updating page: ${page.title || page.slug?.current || page._id}`)
      
      // Update contentBlocks to add tips references
      const updatedBlocks = page.contentBlocks.map((block: any) => {
        if (block._type === 'energyTipsSection') {
          console.log('  → Adding tip references to energyTipsSection')
          return {
            ...block,
            tips: tipReferences
          }
        }
        return block
      })
      
      // Update the page
      try {
        await client
          .patch(page._id)
          .set({ contentBlocks: updatedBlocks })
          .commit()
        
        console.log(`✅ Updated page successfully`)
        console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;${page._id}\n`)
      } catch (error) {
        console.error(`❌ Failed to update page:`, error)
      }
    }
    
    console.log('\n🎉 Complete deployment successful!')
    console.log('📊 Summary:')
    console.log(`   - Created ${createdTips.length} energy tip documents`)
    console.log(`   - Updated ${pagesWithEnergyTips.length} page(s) with tip references`)
    console.log('\nYou can now manage energy tips directly from Sanity Studio!')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

// Run the deployment
deployCompleteEnergyTips()