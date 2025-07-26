import { createPage, addPageToNavigation, createTextBlock, createBoldTextBlock } from '../src/lib/sanity-helpers'

// Get provider IDs from the actual production data
const providerIds = [
  '63c05ca2-cd1e-4f00-b544-6a2077d4031a', // Vindstød - DanskVind
  '9451a43b-6e68-4914-945c-73a81a508214', // Andel Energi - TimeEnergi
  '9526e0ba-cbe8-4526-9abc-7dabb4756b2b', // Norlys - FlexEl - Vest
  'a6541984-3dbb-466a-975b-badba029e139', // Vindstød2 - DanskVind
]

// Page content without _id - let Sanity generate it
const pageContent = {
  title: 'Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm',
  slug: {
    _type: 'slug',
    current: 'historiske-priser'
  },
  // SEO fields at root level
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
    // Hero Section
    {
      _type: 'hero',
      _key: 'hero-historiske',
      headline: 'Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm',
      subheadline: 'Forstå prisudviklingen time for time og lær, hvordan du træffer det bedste valg for din elregning.'
    },
    
    // Introduction Section
    {
      _type: 'pageSection',
      _key: 'intro-section',
      title: 'Forstå de historiske elpriser',
      headerAlignment: 'center',
      content: [
        createTextBlock('Elpriser i Danmark har gennemgået dramatiske ændringer de seneste år. Fra stabile priser omkring 30-40 øre/kWh før 2021 til rekordniveauer over 5 kr/kWh i 2022, og nu tilbage til mere normale niveauer.'),
        createTextBlock('Ved at forstå de historiske elpriser kan du:'),
        createTextBlock('• Se mønstre og sæsonudsving i priserne'),
        createTextBlock('• Forstå forskellen mellem DK1 (Jylland/Fyn) og DK2 (Sjælland)'),
        createTextBlock('• Træffe bedre beslutninger om fast eller variabel pris'),
        createTextBlock('• Planlægge dit elforbrug efter prisudsving')
      ]
    },
    
    // Live Price Graph
    {
      _type: 'livePriceGraph',
      _key: 'current-prices',
      title: 'Aktuelle elpriser time for time',
      subtitle: 'Se dagens og morgendagens elpriser i realtid',
      apiRegion: 'both',
      headerAlignment: 'center'
    },
    
    // Historical Overview Section
    {
      _type: 'pageSection',
      _key: 'historical-overview',
      title: 'Elprisernes udvikling 2021-2025',
      headerAlignment: 'left',
      content: [
        createBoldTextBlock('2021: Normale priser bliver fortid'),
        createTextBlock('Året startede med normale priser omkring 30-40 øre/kWh, men i løbet af efteråret begyndte priserne at stige markant. Årsagerne var flere: Lav vindproduktion, høje gaspriser og øget efterspørgsel efter genåbningen fra COVID-19.'),
        
        createBoldTextBlock('2022: Energikrise og rekordpriser'),
        createTextBlock('Krigen i Ukraine sendte energipriserne i vejret. Elpriser over 5 kr/kWh blev almindelige, og mange danskere oplevede elregninger, der var 3-4 gange højere end normalt. Regeringen indførte elafgiftslempelser for at hjælpe forbrugerne.'),
        
        createBoldTextBlock('2023: Stabilisering på højt niveau'),
        createTextBlock('Priserne faldt fra de ekstreme niveauer, men forblev høje sammenlignet med årene før 2021. Gennemsnitsprisen lå omkring 1-2 kr/kWh, med store udsving afhængigt af vindproduktion.'),
        
        createBoldTextBlock('2024-2025: Tilbage mod normale priser'),
        createTextBlock('Med øget udbygning af vedvarende energi og stabilisering af gasmarkedet er priserne faldet betydeligt. Vindrige perioder giver nu ofte negative priser, mens vindstille perioder stadig kan give høje priser.')
      ]
    },
    
    // Monthly Production Chart
    {
      _type: 'monthlyProductionChart',
      _key: 'production-history',
      title: 'Månedlig elproduktion i Danmark',
      leadingText: 'Se hvordan Danmarks elproduktion fordeler sig på forskellige energikilder gennem året.',
      headerAlignment: 'center'
    },
    
    // Regional Differences Section
    {
      _type: 'pageSection',
      _key: 'regional-differences',
      title: 'DK1 vs DK2: Regionale prisforskelle',
      headerAlignment: 'left',
      content: [
        createTextBlock('Danmark er opdelt i to elprisområder: DK1 (Vestdanmark) omfatter Jylland og Fyn, mens DK2 (Østdanmark) omfatter Sjælland og øerne.'),
        createBoldTextBlock('Hvorfor er der forskel?'),
        createTextBlock('• DK1 har flere vindmøller og bedre forbindelser til Tyskland og Norge'),
        createTextBlock('• DK2 er forbundet til Sverige og har mindre vindkapacitet'),
        createTextBlock('• Flaskehalse i elnettet mellem landsdelene begrænser udveksling'),
        createTextBlock('Historisk set har DK1 ofte haft lavere priser end DK2, særligt i vindrige perioder. Forskellen kan være 10-20 øre/kWh i gennemsnit, men i ekstreme situationer op til flere kroner.')
      ]
    },
    
    // Price Comparison Table
    {
      _type: 'realPriceComparisonTable',
      _key: 'price-comparison',
      title: 'Sammenlign aktuelle elpriser',
      leadingText: 'Se hvordan forskellige elselskaber prissætter deres produkter baseret på de aktuelle spotpriser.'
    },
    
    // Fixed vs Variable Section
    {
      _type: 'pageSection',
      _key: 'fixed-vs-variable',
      title: 'Fast eller variabel elpris?',
      headerAlignment: 'center',
      content: [
        createTextBlock('De historiske elpriser viser tydeligt fordele og ulemper ved både faste og variable priser:'),
        
        createBoldTextBlock('Fast pris'),
        createTextBlock('• Sikkerhed: Du ved præcis, hvad du betaler'),
        createTextBlock('• Budgetsikkerhed: Ingen overraskelser på elregningen'),
        createTextBlock('• Dyrere i normale perioder: Du betaler for sikkerheden'),
        createTextBlock('• Misser besparelser: Kan ikke udnytte lave spotpriser'),
        
        createBoldTextBlock('Variabel pris (spotpris)'),
        createTextBlock('• Billigere over tid: Historisk set 20-30% billigere'),
        createTextBlock('• Fleksibilitet: Kan udnytte lave priser ved at flytte forbrug'),
        createTextBlock('• Risiko: Elregningen kan variere meget'),
        createTextBlock('• Kræver opmærksomhed: Du skal følge med i prisudviklingen'),
        
        createTextBlock('Baseret på de historiske data anbefaler vi variabel pris til de fleste, men fast pris kan give mening hvis du har et stramt budget eller ikke kan flytte dit forbrug.')
      ]
    },
    
    // CO2 Emissions Chart
    {
      _type: 'co2EmissionsChart',
      _key: 'co2-emissions',
      title: 'CO2-udledning fra elproduktion',
      subtitle: 'Se hvordan grøn den danske el er time for time',
      leadingText: 'Danmarks elimport og -eksport påvirker CO2-intensiteten betydeligt.',
      headerAlignment: 'center',
      showGauge: true
    },
    
    // Provider List
    {
      _type: 'providerList',
      _key: 'provider-comparison',
      title: 'Find det bedste elselskab til dine behov',
      providers: providerIds.map(id => ({
        _type: 'reference',
        _ref: id,
        _key: `ref-${id}`
      }))
    },
    
    // Tips Section
    {
      _type: 'pageSection',
      _key: 'tips-section',
      title: 'Sådan udnytter du de historiske data',
      headerAlignment: 'left',
      content: [
        createBoldTextBlock('1. Identificer mønstre'),
        createTextBlock('Elpriser følger ofte forudsigelige mønstre. Priser er typisk lavest om natten (kl. 00-06) og i weekender. Vindrige perioder giver lave priser, mens vindstille perioder giver høje priser.'),
        
        createBoldTextBlock('2. Planlæg stort forbrug'),
        createTextBlock('Brug vaskemaskine, opvaskemaskine og elbil-opladning når priserne historisk set er lavest. Med timeafregning kan du spare 30-50% på disse aktiviteter.'),
        
        createBoldTextBlock('3. Vælg den rette aftale'),
        createTextBlock('Hvis de historiske priser viser store udsving i dit område, kan fast pris give tryghed. Men husk at du historisk set betaler 20-30% mere for denne sikkerhed.'),
        
        createBoldTextBlock('4. Følg med i udviklingen'),
        createTextBlock('Energimarkedet ændrer sig konstant. Mere vindkraft betyder flere timer med lave priser, mens nedlukning af kraftværker kan give højere priser i spidsbelastning.')
      ]
    },
    
    // FAQ Section
    {
      _type: 'faqGroup',
      _key: 'faq-section',
      heading: 'Ofte stillede spørgsmål om historiske elpriser',
      items: [
        {
          _type: 'faqItem',
          _key: 'faq-1',
          question: 'Hvor langt tilbage kan jeg se elpriser?',
          answer: [
            createTextBlock('Energinet gemmer detaljerede timepriser tilbage til 2017. På ElPortal viser vi typisk data fra de seneste 2-3 år, da dette er mest relevant for at forstå aktuelle prismønstre og træffe beslutninger om din elaftale.')
          ]
        },
        {
          _type: 'faqItem',
          _key: 'faq-2',
          question: 'Hvorfor var elpriserne så høje i 2022?',
          answer: [
            createTextBlock('2022 var et perfekt storm af faktorer: Krigen i Ukraine skabte usikkerhed om gasforsyninger, tørke reducerede vandkraft i Norge, flere atomkraftværker var lukket for vedligeholdelse, og den generelle inflation påvirkede alle energipriser. Dette førte til elpriser over 5 kr/kWh i de værste perioder.')
          ]
        },
        {
          _type: 'faqItem',
          _key: 'faq-3',
          question: 'Kan historiske priser forudsige fremtidige priser?',
          answer: [
            createTextBlock('Historiske priser viser mønstre og trends, men kan ikke forudsige præcise fremtidige priser. Dog kan du se at priser typisk er højere om vinteren, lavere om natten, og at vindrige perioder giver lave priser. Disse mønstre gentager sig år efter år.')
          ]
        },
        {
          _type: 'faqItem',
          _key: 'faq-4',
          question: 'Hvordan påvirker vejret elpriserne?',
          answer: [
            createTextBlock('Vejret har enorm indflydelse på elpriserne i Danmark. Meget vind giver lav produktion og dermed lave priser - nogle gange endda negative priser. Vindstille perioder kræver dyr produktion fra gas- eller kulkraftværker. Kolde perioder øger forbruget og dermed priserne.')
          ]
        },
        {
          _type: 'faqItem',
          _key: 'faq-5',
          question: 'Er der forskel på sommer- og vinterpriser?',
          answer: [
            createTextBlock('Ja, der er markant forskel. Vinterpriser er typisk 30-50% højere end sommerpriser på grund af højere forbrug (opvarmning og lys) og mindre solcelleproduktion. De historiske data viser at december-februar har de højeste priser, mens maj-august har de laveste.')
          ]
        }
      ]
    }
  ]
}

// Deploy the page
async function deployPage() {
  try {
    console.log('Creating historiske priser page with proper ID generation...')
    
    // Create the page - Sanity will generate a unique ID
    const page = await createPage(pageContent)
    
    // Add to navigation
    console.log('\nAdding page to navigation...')
    await addPageToNavigation(page._id, 'Historiske priser', 2) // Position after "Elpriser"
    
    console.log('\n✅ Page deployed successfully!')
    console.log('🎯 Important: The page now has a proper auto-generated ID')
    console.log('🔗 Frontend URL: /historiske-priser')
    console.log('📝 No more page.{slug} pattern issues!')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

// Execute deployment
deployPage()