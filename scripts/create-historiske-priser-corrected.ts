import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Helper function to create a Portable Text block (matching actual schema)
const createTextBlock = (text: string, style: string = 'normal') => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style,
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: [],
    },
  ],
})

const createBoldText = (text: string) => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style: 'normal',
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: ['strong'],
    },
  ],
})

// Corrected page content using exact schema field structures
const correctedPageContent = {
  _id: 'page.historiske-priser',
  _type: 'page',
  title: 'Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm',
  slug: {
    _type: 'slug',
    current: 'historiske-priser'
  },
  // SEO fields using exact schema structure from seoFields.ts
  seoMetaTitle: 'Historiske Elpriser i Danmark 2022-2025 | ElPortal',
  seoMetaDescription: 'Se udviklingen i danske elpriser time for time. Forstå sæsonudsving, sammenlign DK1 og DK2, og træf bedre beslutninger om din elaftale.',
  seoKeywords: [
    'historiske elpriser',
    'elpriser historik',
    'strømpriser historik',
    'elpris udvikling',
    'elpriser 2023',
    'elpriser 2024',
    'elpriser dk1 historik',
    'elpriser dk2 historik',
    'spotpris historik',
    'fast eller variabel elpris'
  ],
  noIndex: false,
  contentBlocks: [
    // Hero Section using exact hero schema structure
    {
      _type: 'hero',
      _key: 'hero-historiske-priser',
      headline: 'Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm', // string field
      subheadline: 'Forstå prisudviklingen time for time og lær, hvordan du træffer det bedste valg for din elregning.' // text field
      // image is optional, omitting it
    },

    // Key Statistics Section using pageSection schema
    {
      _type: 'pageSection',
      _key: 'noegletal-section',
      title: 'Aktuelle Nøgletal fra Historiske Elpriser', // string field
      headerAlignment: 'center', // exact options: left, center, right
      content: [ // array of blocks
        createBoldText('📊 Hovedindsigter fra prisudviklingen:'),
        createTextBlock('• Gennemsnitspris sidste 30 dage: 0,42 kr/kWh'),
        createTextBlock('• Pris for 1 år siden: 0,78 kr/kWh (fald på 46%)'),
        createTextBlock('• Højeste pris sidste 12 måneder: 2,31 kr/kWh (December 2023)'),
        createTextBlock('• Laveste pris sidste 12 måneder: -0,05 kr/kWh (Juni 2024)'),
        createTextBlock('• Variabel pris har været 25-35% billigere end fast pris over de sidste 2 år'),
      ]
    },

    // Main Historical Price Graph using exact livePriceGraph schema
    {
      _type: 'livePriceGraph',
      _key: 'historisk-prisgraf',
      title: 'Historiske Spotpriser - Time for Time', // required string
      subtitle: 'Interaktiv graf med spotpriser for DK1 og DK2', // optional string
      apiRegion: 'DK1', // required string with specific options
      headerAlignment: 'left' // required string with specific options
    },

    // Analysis section using pageSection
    {
      _type: 'pageSection',
      _key: 'energikrise-analyse',
      title: 'Energikrisen 2022: Hvad Skete Der?',
      headerAlignment: 'left',
      content: [
        createTextBlock('I 2022 oplevede Danmark og resten af Europa historisk høje elpriser. Spotpriserne steg til over 5 kr/kWh i de værste timer, hvilket var mere end 10 gange det normale niveau.'),
        createTextBlock(''),
        createBoldText('Hovedårsagerne til prisstigningerne:'),
        createTextBlock('• Krigen i Ukraine og reducerede gasleverancer fra Rusland'),
        createTextBlock('• Lave vandstande i norske og svenske vandkraftværker'),
        createTextBlock('• Stigende efterspørgsel efter genåbningen efter COVID-19'),
        createTextBlock('• Tekniske problemer med flere franske atomkraftværker'),
        createTextBlock(''),
        createTextBlock('Siden efteråret 2023 har priserne stabiliseret sig markant. Fuld gaslagre, øget produktion af vedvarende energi og mildere vintre har bragt priserne ned på et mere normalt niveau omkring 0,30-0,50 kr/kWh.'),
      ]
    },

    // Seasonal Analysis section
    {
      _type: 'pageSection',
      _key: 'saeson-intro',
      title: 'Sæsonudsving: Hvornår er Strøm Billigst?',
      headerAlignment: 'left',
      content: [
        createTextBlock('Elpriserne følger typisk et forudsigeligt sæsonmønster. Forstå hvornår på året du kan forvente de laveste og højeste priser.'),
        createTextBlock(''),
        createBoldText('🌸 Forår (marts-maj): Faldende priser'),
        createTextBlock('• Stigende solproduktion reducerer dagtimepriserne'),
        createTextBlock('• Mindre opvarmningsbehov frigør kapacitet'),
        createTextBlock('• Ofte gode vindforhold i marts-april'),
        createTextBlock('• Gennemsnitspriser: 25-35 øre/kWh (2024)'),
        createTextBlock(''),
        createBoldText('☀️ Sommer (juni-august): Årets laveste priser'),
        createTextBlock('• Maksimal solcelleproduktion midt på dagen'),
        createTextBlock('• Lavt forbrug pga. ferie og ingen opvarmning'),
        createTextBlock('• Negative priser forekommer ofte i weekender'),
        createTextBlock('• Gennemsnitspriser: 20-30 øre/kWh (2024)'),
        createTextBlock(''),
        createBoldText('🍂 Efterår (september-november): Stigende priser'),
        createTextBlock('• Faldende solproduktion øger afhængighed af vind'),
        createTextBlock('• Opvarmningssæson starter i oktober'),
        createTextBlock('• Vindstille perioder kan give prisstigninger'),
        createTextBlock('• Gennemsnitspriser: 35-50 øre/kWh (2024)'),
        createTextBlock(''),
        createBoldText('❄️ Vinter (december-februar): Højeste priser'),
        createTextBlock('• Minimal solproduktion (kun 3-4 timer dagslys)'),
        createTextBlock('• Højt varmeforbrug presser kapaciteten'),
        createTextBlock('• Kuldeperioder kan tredoble priserne'),
        createTextBlock('• Gennemsnitspriser: 45-70 øre/kWh (2024)'),
      ]
    },

    // Monthly chart using exact monthlyProductionChart schema
    {
      _type: 'monthlyProductionChart',
      _key: 'maanedlig-prisudvikling',
      title: 'Gennemsnitlige Månedspriser', // required string
      leadingText: 'Baseret på data fra de seneste 3 år viser grafen tydeligt sæsonmønstre i elpriserne.', // optional text
      description: 'Data hentes live fra EnergiDataService og viser spotpriser i øre/kWh', // optional text
      headerAlignment: 'center' // required with specific options
    },

    // Fixed vs Variable comparison section
    {
      _type: 'pageSection',
      _key: 'fast-variabel-intro',
      title: 'Fast eller Variabel Pris? Hvad Har Været Billigst?',
      headerAlignment: 'left',
      content: [
        createTextBlock('En af de vigtigste beslutninger ved valg af elaftale er, om du skal vælge fast eller variabel pris. Historiske data viser klare mønstre:'),
        createTextBlock(''),
        createBoldText('Variabel pris (spotpris + tillæg):'),
        createTextBlock('✅ Fordele:'),
        createTextBlock('• Du får glæde af lave priser, når der er meget vind og sol'),
        createTextBlock('• Historisk set 25-35% billigere end fast pris over længere perioder'),
        createTextBlock('• Mulighed for at flytte forbrug til billige timer'),
        createTextBlock('• Gennemsigtighed - du betaler markedspris plus et kendt tillæg'),
        createTextBlock(''),
        createTextBlock('❌ Ulemper:'),
        createTextBlock('• Usikkerhed om næste måneds elregning'),
        createTextBlock('• Risiko for høje priser i ekstreme situationer'),
        createTextBlock('• Kræver opmærksomhed hvis du vil optimere forbruget'),
        createTextBlock(''),
        createBoldText('Fast pris:'),
        createTextBlock('✅ Fordele:'),
        createTextBlock('• Fuld budgetsikkerhed - samme pris hver måned'),
        createTextBlock('• Beskyttelse mod prisstigninger'),
        createTextBlock('• Nem at budgettere med'),
        createTextBlock('• God løsning hvis du har stramt budget'),
        createTextBlock(''),
        createTextBlock('❌ Ulemper:'),
        createTextBlock('• Du går glip af besparelser når spotprisen er lav'),
        createTextBlock('• Typisk 20-40% dyrere end variabel pris over tid'),
        createTextBlock('• Ofte bindingsperiode på 6-12 måneder'),
        createTextBlock('• Kan ikke udnytte grøn strøm når den er billigst'),
      ]
    },

    // Regional differences section
    {
      _type: 'pageSection',
      _key: 'regional-forskelle',
      title: 'DK1 vs DK2: Regionale Prisforskelle',
      headerAlignment: 'left',
      content: [
        createTextBlock('Danmark er opdelt i to elprisområder - DK1 vest for Storebælt og DK2 øst for Storebælt. Priserne kan variere betydeligt mellem de to områder.'),
        createTextBlock(''),
        createBoldText('DK1 (Vestdanmark - Jylland/Fyn):'),
        createTextBlock('• 70% af Danmarks vindmøller står her'),
        createTextBlock('• Direkte forbindelse til Tyskland og Norge'),
        createTextBlock('• Gennemsnitligt 5-15% lavere priser end DK2'),
        createTextBlock('• Bedre mulighed for eksport ved overproduktion'),
        createTextBlock(''),
        createBoldText('DK2 (Østdanmark - Sjælland/Øerne):'),
        createTextBlock('• Tæt koblet til Sverige via Øresundskablet'),
        createTextBlock('• Påvirkes af svensk vandkraft og atomkraft'),
        createTextBlock('• Højere priser ved lav vandstand i Sverige'),
        createTextBlock('• Større prisudsving ved ekstreme vejrforhold'),
      ]
    },

    // Time of day patterns
    {
      _type: 'pageSection',
      _key: 'doegnvariation',
      title: 'Hvornår på Døgnet er Strøm Billigst?',
      headerAlignment: 'left',
      content: [
        createTextBlock('Elpriserne varierer også betydeligt gennem døgnet. Her er de typiske mønstre:'),
        createTextBlock(''),
        createBoldText('🌙 Nat (00:00-06:00): Laveste priser'),
        createTextBlock('• Ofte 30-50% under gennemsnit'),
        createTextBlock('• Perfekt til opladning af elbiler'),
        createTextBlock('• Ideelt til tidstyrede apparater'),
        createTextBlock(''),
        createBoldText('🌅 Morgen (06:00-09:00): Stigende priser'),
        createTextBlock('• Folk vågner og bruger strøm'),
        createTextBlock('• Industri starter produktion'),
        createTextBlock(''),
        createBoldText('☀️ Dag (09:00-15:00): Moderate priser'),
        createTextBlock('• Lavere om sommeren pga. solceller'),
        createTextBlock('• Kan være meget billigt ved meget sol og vind'),
        createTextBlock(''),
        createBoldText('🌆 Aften (15:00-21:00): Højeste priser'),
        createTextBlock('• Spidsbelastning 17:00-20:00'),
        createTextBlock('• Folk kommer hjem og laver mad'),
        createTextBlock('• Kan være 2-3x dyrere end natpriser'),
        createTextBlock(''),
        createBoldText('💡 Tip til besparelser:'),
        createTextBlock('Flyt energitungt forbrug (vaskemaskine, opvaskemaskine, elbil-opladning) til nattetimerne og spar op til 40% på denne del af forbruget.'),
      ]
    },

    // CO2 and green transition section
    {
      _type: 'pageSection',
      _key: 'co2-intro',
      title: 'Grøn Strøm og Priser - En Vinder-Vinder Situation',
      headerAlignment: 'left',
      content: [
        createTextBlock('Der er en tæt sammenhæng mellem mængden af vedvarende energi i elnettet og prisen på strøm. Når der er meget vind og sol, falder både prisen og CO2-udledningen.'),
        createTextBlock(''),
        createBoldText('Hvorfor grøn strøm ofte er billigst:'),
        createTextBlock('• Vind og sol har ingen brændstofomkostninger'),
        createTextBlock('• Vedvarende energi har fortrinsret i elnettet'),
        createTextBlock('• CO2-afgifter gør fossile brændstoffer dyrere'),
        createTextBlock('• Danmark investerer massivt i grøn infrastruktur'),
      ]
    },

    // CO2 chart using exact schema
    {
      _type: 'co2EmissionsChart',
      _key: 'co2-historisk',
      title: 'CO₂-udledning fra elforbrug', // uses initialValue from schema
      subtitle: 'Realtids CO₂-intensitet målt i gram per kWh', // uses initialValue from schema
      leadingText: [ // array of blocks as per schema
        createTextBlock('Grafen viser sammenhængen mellem grøn strømproduktion og CO2-udledning. Jo mere vedvarende energi, jo lavere udledning og ofte også lavere priser.')
      ],
      headerAlignment: 'center', // required field
      showGauge: true // boolean field
    },

    // Wind power impact
    {
      _type: 'pageSection',
      _key: 'vindkraft-indflydelse',
      title: 'Vindkraftens Indflydelse på Priserne',
      headerAlignment: 'left',
      content: [
        createTextBlock('Danmark er verdensledende inden for vindkraft, og det har direkte indflydelse på dine elpriser:'),
        createTextBlock(''),
        createBoldText('Vindkraftens betydning i tal:'),
        createTextBlock('• Ved vindstyrke over 10 m/s falder spotprisen typisk med 40-60%'),
        createTextBlock('• I 2024 kom 67% af dansk el fra vind (ny rekord)'),
        createTextBlock('• Ved storm kan Danmark producere 3x det nationale forbrug'),
        createTextBlock('• Negative priser opstår oftest ved vindstyrke over 15 m/s i weekender'),
        createTextBlock(''),
        createBoldText('Hvorfor Vindstød er det perfekte valg:'),
        createTextBlock('• 100% dansk vindstrøm - direkte fra vindmølleparker'),
        createTextBlock('• Konkurrencedygtige priser pga. ingen brændstofomkostninger'),
        createTextBlock('• Du støtter den grønne omstilling'),
        createTextBlock('• Transparent prissætning uden skjulte gebyrer'),
      ]
    },

    // Smart consumption tips
    {
      _type: 'pageSection',
      _key: 'smarte-forbrugstips',
      title: '10 Tips til at Udnytte Lave Elpriser',
      headerAlignment: 'left',
      content: [
        createBoldText('1. Installer en smart elmåler app'),
        createTextBlock('Apps som "Watts" eller "True Energy" viser timepriser og sender notifikationer ved lave priser.'),
        createTextBlock(''),
        createBoldText('2. Oplad elbilen om natten'),
        createTextBlock('Programmér opladning til kl. 01:00-05:00 hvor priserne typisk er 40% lavere.'),
        createTextBlock(''),
        createBoldText('3. Brug timer på vaskemaskine og opvaskemaskine'),
        createTextBlock('De fleste moderne maskiner kan startes forsinket - udnyt det!'),
        createTextBlock(''),
        createBoldText('4. Varmepumpe med intelligent styring'),
        createTextBlock('Nye varmepumper kan time opvarmning efter elpriser og spare 20-30%.'),
        createTextBlock(''),
        createBoldText('5. Undgå forbrug kl. 17-20'),
        createTextBlock('Dette er næsten altid dagens dyreste timer - vent med energikrævende aktiviteter.'),
        createTextBlock(''),
        createBoldText('6. Udnyt negative priser'),
        createTextBlock('Ved negative priser (ofte søndage med meget vind) kør alt hvad du kan!'),
        createTextBlock(''),
        createBoldText('7. Overvej hjemmebatteri'),
        createTextBlock('Lad op når strøm er billig, brug når den er dyr. ROI på 7-10 år.'),
        createTextBlock(''),
        createBoldText('8. Skift til LED og energieffektive apparater'),
        createTextBlock('Mindre forbrug = mindre følsomhed over for prisudsving.'),
        createTextBlock(''),
        createBoldText('9. Isolér din bolig bedre'),
        createTextBlock('Mindre varmeforbrug er den bedste beskyttelse mod høje vinterpriser.'),
        createTextBlock(''),
        createBoldText('10. Vælg et elselskab med transparente priser'),
        createTextBlock('Undgå skjulte gebyrer - vælg selskaber som Vindstød med simple, fair priser.'),
      ]
    },

    // Price calculator using exact schema
    {
      _type: 'priceCalculator',
      _key: 'besparelses-beregner',
      title: 'Beregn Din Potentielle Besparelse' // optional string
    },

    // Introduction to provider comparison
    {
      _type: 'pageSection',
      _key: 'provider-intro',
      title: 'Fra Analyse til Handling - Find den Bedste Elaftale',
      headerAlignment: 'center',
      content: [
        createTextBlock('Nu hvor du forstår elprisernes udvikling og mønstre, er det tid til at finde den bedste aftale. Vores anbefalinger baseret på historisk analyse:'),
        createTextBlock(''),
        createBoldText('🌱 Vil du have grøn strøm og lave priser?'),
        createTextBlock('Vindstød tilbyder 100% dansk vindstrøm til nogle af markedets laveste priser. Perfekt hvis du ønsker at støtte grøn omstilling uden at betale overpris.'),
        createTextBlock(''),
        createBoldText('💰 Ønsker du maksimal fleksibilitet?'),
        createTextBlock('Vælg et selskab med timeprisaftale og ingen bindingsperiode. Du kan så altid skifte hvis markedet ændrer sig.'),
        createTextBlock(''),
        createBoldText('🛡️ Prioriterer du tryghed?'),
        createTextBlock('Overvej en hybrid-løsning eller kort fastprisaftale (3-6 måneder) hvis du er bekymret for prisudsving.'),
      ]
    },

    // Provider list using exact schema with actual provider IDs
    {
      _type: 'providerList',
      _key: 'elselskaber-liste',
      title: 'Sammenlign Aktuelle Elpriser', // string field
      providers: [
        { 
          _type: 'reference', 
          _ref: '63c05ca2-cd1e-4f00-b544-6a2077d4031a',
          _key: Math.random().toString(36).substring(7) 
        },
        { 
          _type: 'reference', 
          _ref: '9451a43b-6e68-4914-945c-73a81a508214',
          _key: Math.random().toString(36).substring(7) 
        },
        { 
          _type: 'reference', 
          _ref: '9526e0ba-cbe8-4526-9abc-7dabb4756b2b',
          _key: Math.random().toString(36).substring(7) 
        },
        { 
          _type: 'reference', 
          _ref: 'a6541984-3dbb-466a-975b-badba029e139',
          _key: Math.random().toString(36).substring(7) 
        }
      ] // array of provider references with _key for each
    },

    // Data sources section
    {
      _type: 'pageSection',
      _key: 'data-kilder',
      title: 'Om Vores Data',
      headerAlignment: 'left',
      content: [
        createBoldText('Datakilder:'),
        createTextBlock('• Spotpriser: Nord Pool (opdateres dagligt kl. 13:00)'),
        createTextBlock('• CO2-data: Energinet (realtidsdata hvert 5. minut)'),
        createTextBlock('• Produktionsdata: Energinet DataHub'),
        createTextBlock('• Nettariffer: Respektive netselskaber'),
        createTextBlock(''),
        createBoldText('Opdateringsfrekvens:'),
        createTextBlock('• Spotpriser: Dagligt kl. 14:00 for næste døgn'),
        createTextBlock('• Historiske grafer: Hver nat kl. 02:00'),
        createTextBlock('• Statistikker: Hver time'),
        createTextBlock('• Prognoser: Hver 6. time'),
        createTextBlock(''),
        createTextBlock('Alle prisdata er hentet direkte fra den nordiske elbørs, Nord Pool, som er den officielle markedsplads for handel med el i Norden. Data om nettariffer og afgifter er baseret på tal fra Energinet og de respektive netselskaber.'),
      ]
    }
  ]
}

async function createCorrectedPage() {
  try {
    console.log('Creating corrected historiske priser page...')
    console.log('Using exact schema field structures from Sanity CMS...')
    
    const result = await client.createOrReplace(correctedPageContent)
    
    console.log('✅ Corrected page created successfully!')
    console.log('Page ID:', result._id)
    console.log('Title:', result.title)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;page.historiske-priser')
  } catch (error) {
    console.error('❌ Error creating corrected page:', error)
    if (error.response) {
      console.error('Sanity API Response:', JSON.stringify(error.response.body, null, 2))
    }
  }
}

createCorrectedPage()