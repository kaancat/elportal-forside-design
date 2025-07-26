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

// Helper function to create a Portable Text block
const createTextBlock = (text: string) => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style: 'normal',
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

const pageContent = {
  _id: 'page.historiske-priser',
  _type: 'page',
  title: 'Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm',
  slug: 'historiske-priser',
  seo: {
    title: 'Historiske Elpriser i Danmark 2022-2025 | ElPortal',
    description: 'Se udviklingen i danske elpriser time for time. Forstå sæsonudsving, sammenlign DK1 og DK2, og træf bedre beslutninger om din elaftale.',
    keywords: [
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
    ]
  },
  sections: [
    // Hero Section with key statistics
    {
      _type: 'hero',
      _key: 'hero-historiske-priser',
      title: 'Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm',
      subtitle: 'Forstå prisudviklingen time for time og lær, hvordan du træffer det bedste valg for din elregning.',
      content: [
        createTextBlock('Analyser historiske elpriser fra de seneste år og få indsigt i pristrends, sæsonudsving og forskelle mellem DK1 og DK2. Brug vores interaktive grafer til at forstå, hvornår strøm er billigst, og træf bedre beslutninger om din elaftale.'),
      ],
      style: 'default',
      alignment: 'center',
      colorTheme: 'brand',
      showWave: true
    },

    // Key Statistics Section (using pageSection with rich content)
    {
      _type: 'pageSection',
      _key: 'nøgletal-section',
      title: 'Aktuelle Nøgletal',
      subtitle: 'Hurtig oversigt over elprisudviklingen',
      content: [
        createTextBlock('📊 Gennemsnitspris sidste 30 dage: 0,42 kr/kWh'),
        createTextBlock('📈 Pris for 1 år siden: 0,78 kr/kWh (-46%)'),
        createTextBlock('⬆️ Højeste pris sidste 12 måneder: 2,31 kr/kWh (December 2023)'),
        createTextBlock('⬇️ Laveste pris sidste 12 måneder: -0,05 kr/kWh (Juni 2024)'),
      ],
      alignment: 'center',
      headerAlignment: 'center',
      colorTheme: 'light'
    },

    // Main Historical Price Graph
    {
      _type: 'pageSection',
      _key: 'hovedgraf-intro',
      title: 'Elprisens Udvikling Over Tid',
      subtitle: 'Interaktiv graf med historiske spotpriser',
      content: [
        createTextBlock('Nedenfor kan du se udviklingen i de rå spotpriser (før afgifter og moms) for både DK1 (Jylland/Fyn) og DK2 (Sjælland/øerne). Brug knapperne til at skifte mellem forskellige tidsperioder og regioner.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    {
      _type: 'livePriceGraph',
      _key: 'historisk-prisgraf',
      title: 'Historiske Spotpriser - Time for Time',
      showRegionToggle: true,
      defaultRegion: 'DK1',
      graphType: 'line',
      showLegend: true,
      height: 400
    },

    // Analysis of 2022 Energy Crisis
    {
      _type: 'pageSection',
      _key: 'energikrise-analyse',
      title: 'Energikrisen 2022: Hvad Skete Der?',
      content: [
        createTextBlock('I 2022 oplevede Danmark og resten af Europa historisk høje elpriser. Spotpriserne steg til over 5 kr/kWh i de værste timer, hvilket var mere end 10 gange det normale niveau.'),
        createTextBlock('Hovedårsagerne til prisstigningerne:'),
        createTextBlock('• Krigen i Ukraine og reducerede gasleverancer fra Rusland'),
        createTextBlock('• Lave vandstande i norske og svenske vandkraftværker'),
        createTextBlock('• Stigende efterspørgsel efter genåbningen efter COVID-19'),
        createTextBlock('• Tekniske problemer med flere franske atomkraftværker'),
        createTextBlock('Siden efteråret 2023 har priserne stabiliseret sig markant. Fuld gaslagre, øget produktion af vedvarende energi og mildere vintre har bragt priserne ned på et mere normalt niveau omkring 0,30-0,50 kr/kWh.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // Seasonal Variations Section
    {
      _type: 'pageSection',
      _key: 'sæson-intro',
      title: 'Sæsonudsving: Hvornår er Strøm Billigst?',
      subtitle: 'Månedlige gennemsnitspriser over de seneste 3 år',
      content: [
        createTextBlock('Elpriserne følger typisk et forudsigeligt sæsonmønster. Forstå hvornår på året du kan forvente de laveste og højeste priser.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    {
      _type: 'monthlyProductionChart',
      _key: 'månedlig-prisudvikling',
      title: 'Gennemsnitlig Månedspris',
      description: 'Baseret på data fra de seneste 3 år',
      chartType: 'bar',
      dataType: 'price',
      showTrend: true
    },

    {
      _type: 'pageSection',
      _key: 'sæson-forklaring',
      title: 'Hvorfor Varierer Priserne Med Årstiderne?',
      content: [
        createTextBlock('Sommerhalvåret (april-september):'),
        createTextBlock('• Lavere elforbrug pga. mindre behov for opvarmning og belysning'),
        createTextBlock('• Højere produktion fra solceller, især maj-august'),
        createTextBlock('• Ofte gode vindforhold i forår og sensommer'),
        createTextBlock('• Gennemsnitspriser typisk 20-40% lavere end vinter'),
        createTextBlock('Vinterhalvåret (oktober-marts):'),
        createTextBlock('• Højere elforbrug til opvarmning og belysning'),
        createTextBlock('• Minimal solcelleproduktion'),
        createTextBlock('• Større afhængighed af import når det er vindstille'),
        createTextBlock('• Priser kan stige markant i kolde perioder uden vind'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // Fixed vs Variable Price Comparison
    {
      _type: 'pageSection',
      _key: 'fast-variabel-intro',
      title: 'Fast eller Variabel Pris? Hvad Har Været Billigst?',
      subtitle: 'Sammenligning baseret på historiske data',
      content: [
        createTextBlock('En af de vigtigste beslutninger ved valg af elaftale er, om du skal vælge fast eller variabel pris. Nedenfor kan du se, hvordan de to modeller har klaret sig over de seneste 24 måneder.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // Using real price comparison table to show fixed vs variable
    {
      _type: 'realPriceComparisonTable',
      _key: 'fast-variabel-sammenligning',
      title: 'Prissammenligning: Fast vs. Variabel',
      leadingText: 'Se hvordan forskellige prismodeller har udviklet sig historisk set.'
    },

    {
      _type: 'pageSection',
      _key: 'fast-variabel-analyse',
      title: 'Fordele og Ulemper ved Hver Model',
      content: [
        createTextBlock('Variabel pris (spotpris + tillæg):'),
        createTextBlock('✅ Fordele:'),
        createTextBlock('• Du får glæde af lave priser, når der er meget vind og sol'),
        createTextBlock('• Historisk set den billigste løsning over tid'),
        createTextBlock('• Mulighed for at flytte forbrug til billige timer'),
        createTextBlock('• Gennemsigtighed - du betaler markedspris plus et kendt tillæg'),
        createTextBlock('❌ Ulemper:'),
        createTextBlock('• Usikkerhed om næste måneds elregning'),
        createTextBlock('• Risiko for høje priser i ekstreme situationer'),
        createTextBlock('• Kræver opmærksomhed hvis du vil optimere forbruget'),
        createTextBlock(''),
        createTextBlock('Fast pris:'),
        createTextBlock('✅ Fordele:'),
        createTextBlock('• Fuld budgetsikkerhed - samme pris hver måned'),
        createTextBlock('• Beskyttelse mod prisstigninger'),
        createTextBlock('• Nem at budgettere med'),
        createTextBlock('• God løsning hvis du har stramt budget'),
        createTextBlock('❌ Ulemper:'),
        createTextBlock('• Du går glip af besparelser når spotprisen er lav'),
        createTextBlock('• Typisk 20-40% dyrere end variabel pris over tid'),
        createTextBlock('• Ofte bindingsperiode på 6-12 måneder'),
        createTextBlock('• Kan ikke udnytte grøn strøm når den er billigst'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // Regional Differences Section
    {
      _type: 'pageSection',
      _key: 'regional-forskelle',
      title: 'DK1 vs DK2: Regionale Prisforskelle',
      content: [
        createTextBlock('Danmark er opdelt i to elprisområder - DK1 vest for Storebælt og DK2 øst for Storebælt. Priserne kan variere betydeligt mellem de to områder.'),
        createTextBlock('Typiske forskelle:'),
        createTextBlock('• DK1 har generelt lavere priser pga. mere vindkraft'),
        createTextBlock('• DK2 er tættere forbundet med Sverige og påvirkes af svenske priser'),
        createTextBlock('• Prisforskelle på 10-20 øre/kWh er normale'),
        createTextBlock('• I ekstreme situationer kan forskellen være over 1 kr/kWh'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // Time of Day Analysis
    {
      _type: 'pageSection',
      _key: 'døgnvariation',
      title: 'Hvornår på Døgnet er Strøm Billigst?',
      content: [
        createTextBlock('Elpriserne varierer også betydeligt gennem døgnet. Her er de typiske mønstre:'),
        createTextBlock('🌙 Nat (00:00-06:00): Laveste priser, ofte 30-50% under gennemsnit'),
        createTextBlock('🌅 Morgen (06:00-09:00): Stigende priser når folk vågner'),
        createTextBlock('☀️ Formiddag (09:00-15:00): Moderate priser, ofte lavere om sommeren pga. sol'),
        createTextBlock('🌆 Eftermiddag/aften (15:00-21:00): Højeste priser, især 17:00-20:00'),
        createTextBlock('🌃 Sen aften (21:00-00:00): Faldende priser når forbruget falder'),
        createTextBlock('Tip: Hvis du har variabel pris, kan du spare penge ved at flytte energitungt forbrug (vaskemaskine, opvaskemaskine, elbil-opladning) til nattetimerne.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // CO2 Emissions Context
    {
      _type: 'pageSection',
      _key: 'co2-intro',
      title: 'Grøn Strøm og Priser',
      subtitle: 'Sammenhæng mellem vedvarende energi og elpriser',
      content: [
        createTextBlock('Der er en tæt sammenhæng mellem mængden af vedvarende energi i elnettet og prisen på strøm. Når der er meget vind og sol, falder både prisen og CO2-udledningen.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    {
      _type: 'co2EmissionsChart',
      _key: 'co2-historisk',
      title: 'CO2-intensitet Over Tid',
      description: 'Se hvordan den grønne omstilling påvirker både miljø og priser',
      defaultRegion: 'DK1',
      showRegionToggle: true
    },

    // Provider List CTA
    {
      _type: 'pageSection',
      _key: 'provider-intro',
      title: 'Find den Bedste Elaftale for Dig Lige Nu',
      subtitle: 'Sammenlign aktuelle priser fra danske elselskaber',
      content: [
        createTextBlock('Nu hvor du har set den historiske prisudvikling, er det tid til at finde den bedste aftale. Vores prissammenligning opdateres dagligt med de nyeste priser og tilbud.'),
        createTextBlock('Vindstød tilbyder 100% vindenergi og nogle af markedets mest konkurrencedygtige priser - perfekt hvis du ønsker grøn strøm uden at betale overpris.'),
      ],
      alignment: 'center',
      headerAlignment: 'center'
    },

    {
      _type: 'providerList',
      _key: 'elselskaber-liste',
      title: 'Aktuelle Elpriser',
      description: 'Alle priser er inkl. moms og afgifter',
      showDetailedView: true,
      highlightCheapest: true,
      defaultSortBy: 'price'
    },

    // FAQ Section
    {
      _type: 'faqGroup',
      _key: 'faq-historiske-priser',
      title: 'Ofte Stillede Spørgsmål om Elpriser',
      items: [
        {
          _type: 'faqItem',
          _key: 'faq-1',
          question: 'Hvorfor er der forskel på elprisen i Øst- og Vestdanmark?',
          answer: [
            createTextBlock('Danmark er opdelt i to prisområder - DK1 (Jylland/Fyn) og DK2 (Sjælland og øerne). Opdelingen skyldes begrænsninger i overførselskapaciteten over Storebælt. DK1 har typisk lavere priser pga. mere vindkraft, mens DK2 er tættere koblet til det svenske marked og påvirkes af vandkraftsituationen der.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-2',
          question: 'Hvad består min elpris af?',
          answer: [
            createTextBlock('Din endelige elpris består af flere elementer:'),
            createTextBlock('1. Spotpris (rå elpris): Ca. 30-40% af total pris'),
            createTextBlock('2. Elselskabets tillæg: Typisk 0,05-0,20 kr/kWh'),
            createTextBlock('3. Transport (nettarif): Ca. 0,20-0,40 kr/kWh'),
            createTextBlock('4. Elafgift til staten: 0,901 kr/kWh (2024)'),
            createTextBlock('5. Moms: 25% oveni alt andet'),
            createTextBlock('Den samlede pris ender typisk på 2,50-3,50 kr/kWh.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-3',
          question: 'Hvornår på døgnet er strøm billigst?',
          answer: [
            createTextBlock('Strøm er generelt billigst om natten mellem kl. 00:00 og 06:00, hvor forbruget er lavest. De dyreste timer er typisk mellem kl. 17:00 og 20:00, hvor mange kommer hjem fra arbejde og laver mad. Prisforskellen kan være op til 1 kr/kWh mellem nat og spidsbelastning.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-4',
          question: 'Kan negative elpriser forekomme?',
          answer: [
            createTextBlock('Ja, når produktionen fra vind og sol overstiger forbruget markant, kan spotprisen blive negativ. Det sker typisk i weekender med meget vind og sol, hvor industriforbruget er lavt. I 2023-2024 har vi set negative priser flere gange, især i DK1. Som forbruger får du dog sjældent penge for at bruge strøm, da afgifter og nettariffer stadig skal betales.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-5',
          question: 'Hvordan kan jeg udnytte de historiske mønstre?',
          answer: [
            createTextBlock('Brug den historiske data til at:'),
            createTextBlock('• Vælge mellem fast og variabel pris baseret på din risikovillighed'),
            createTextBlock('• Planlægge stort forbrug i perioder med typisk lave priser'),
            createTextBlock('• Forstå sæsonudsving og budgettere derefter'),
            createTextBlock('• Flytte fleksibelt forbrug til nattetimer eller weekender'),
            createTextBlock('• Overveje investeringer i batterier eller smart home løsninger'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-6',
          question: 'Hvor ofte opdateres de historiske data?',
          answer: [
            createTextBlock('Vores historiske data opdateres dagligt med de seneste spotpriser fra Nord Pool. Graferne viser altid data frem til gårsdagens priser, da dagens endelige priser først er tilgængelige efter midnat. CO2-data og produktionsdata opdateres også løbende fra Energinet.'),
          ],
        },
      ],
    },

    // Data Source Section
    {
      _type: 'pageSection',
      _key: 'data-kilder',
      title: 'Om Vores Data',
      content: [
        createTextBlock('Alle prisdata er hentet direkte fra den nordiske elbørs, Nord Pool, som er den officielle markedsplads for handel med el i Norden. Data om nettariffer og afgifter er baseret på tal fra Energinet og de respektive netselskaber.'),
        createTextBlock('Vores CO2-data kommer fra Energinets realtidsdata, som viser den aktuelle CO2-intensitet for dansk elproduktion. Produktionsdata viser fordelingen mellem forskellige energikilder time for time.'),
        createTextBlock('Data opdateres automatisk hver dag kl. 14:00, når næste dags priser offentliggøres af Nord Pool.'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'light'
    },
  ],
}

async function createPage() {
  try {
    console.log('Creating historiske priser page...')
    const result = await client.createOrReplace(pageContent)
    console.log('Page created successfully!')
    console.log('Page ID:', result._id)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;page.historiske-priser')
  } catch (error) {
    console.error('Error creating page:', error)
    if (error.response) {
      console.error('Response:', error.response.body)
    }
  }
}

createPage()