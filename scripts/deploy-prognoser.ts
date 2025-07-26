import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function deployPrognoserPage() {
  console.log('🚀 Starting deployment of comprehensive Prognoser page...')

  // Create FAQ items first
  const faqItems = [
    {
      _id: 'faq-prognoser-1',
      _type: 'faqItem',
      question: 'Hvordan beregnes elpriser i morgen?',
      answer: 'Elpriser for næste dag fastsættes dagligt kl. 13:00 på Nord Pool elbørsen. Priserne bestemmes af udbud og efterspørgsel, hvor faktorer som vejr, vindproduktion, solenergi, og forventet forbrug spiller ind. Vores prognoser analyserer disse faktorer for at give dig det bedste overblik.'
    },
    {
      _id: 'faq-prognoser-2',
      _type: 'faqItem',
      question: 'Hvornår er strømmen billigst?',
      answer: 'Typisk er strømmen billigst om natten (kl. 00-06) og når vindproduktionen er høj. I weekender er priserne ofte lavere pga. mindre industriforbrug. Vores time for time prognose viser præcis, hvornår du kan spare mest på dit elforbrug.'
    },
    {
      _id: 'faq-prognoser-3',
      _type: 'faqItem',
      question: 'Kan jeg stole på elpris prognoser?',
      answer: 'Vores prognoser er baseret på avancerede modeller og realtidsdata. For næste dag er nøjagtigheden meget høj (95%+), da priserne allerede er fastsat. For længere prognoser (2-7 dage) er der større usikkerhed, især omkring vejrforhold.'
    },
    {
      _id: 'faq-prognoser-4',
      _type: 'faqItem',
      question: 'Hvad er forskellen på DK1 og DK2 priser?',
      answer: 'Danmark er delt i to elprisområder - DK1 (Jylland/Fyn) og DK2 (Sjælland/Bornholm). Priserne kan variere mellem områderne pga. forskellige produktionsforhold og forbindelser til nabolande. Vores prognose viser begge områder.'
    }
  ]

  // Create value proposition items
  const valuePropositionItems = [
    {
      _id: 'value-prop-wind-1',
      _type: 'valuePropositionItem',
      title: 'Vindkraft sænker priserne',
      description: 'Når det blæser meget, falder elpriserne markant. Danmark har nogle af Europas laveste elpriser takket være vores store vindmøllekapacitet.',
      icon: 'Wind'
    },
    {
      _id: 'value-prop-wind-2',
      _type: 'valuePropositionItem',
      title: 'Grøn strøm når det passer dig',
      description: 'Vores prognoser viser, hvornår strømmen er mest grøn. Planlæg dit forbrug i timer med høj vedvarende energi.',
      icon: 'Leaf'
    },
    {
      _id: 'value-prop-wind-3',
      _type: 'valuePropositionItem',
      title: 'Støt den grønne omstilling',
      description: 'Ved at vælge en leverandør med fokus på vindkraft, støtter du direkte udbygningen af vedvarende energi i Danmark.',
      icon: 'TrendingUp'
    }
  ]

  // Deploy FAQ items
  console.log('📝 Creating FAQ items...')
  for (const faq of faqItems) {
    await client.createOrReplace(faq)
  }

  // Deploy value proposition items
  console.log('💡 Creating value proposition items...')
  for (const item of valuePropositionItems) {
    await client.createOrReplace(item)
  }

  // Create the comprehensive page
  const prognoserPage = {
    _id: 'page.prognoser',
    _type: 'page',
    title: 'Elpris Prognose 2025 • Elpriser i Morgen • Time for Time',
    slug: {
      _type: 'slug',
      current: 'prognoser'
    },
    description: 'Se elpriser i morgen og få præcise elpris prognoser. Time for time oversigt hjælper dig med at planlægge forbrug når strømmen er billigst. Opdateres dagligt.',
    contentBlocks: [
      {
        _key: 'hero-1',
        _type: 'hero',
        heading: 'Se Elpriser i Morgen og Spar Penge',
        subheading: 'Få præcise elpris prognoser time for time. Planlæg dit elforbrug smart og spar op til 50% på din elregning.',
        ctaText: 'Se morgendagens priser',
        ctaLink: '#daily-timeline',
        variant: 'centered'
      },
      {
        _key: 'timeline-1',
        _type: 'dailyPriceTimeline',
        title: 'Elpriser Time for Time - Næste 48 Timer',
        description: 'Se præcis hvornår strømmen er billigst i morgen. Grønne timer viser lav pris, røde timer viser høj pris.',
        showAveragePrice: true,
        showPeakHours: true,
        region: 'both'
      },
      {
        _key: 'education-1',
        _type: 'pageSection',
        heading: 'Hvordan Dannes Elpriser i Danmark?',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'block1',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Elpriser i Danmark fastsættes dagligt på ',
                _key: 'span1'
              },
              {
                _type: 'span',
                text: 'Nord Pool elbørsen',
                _key: 'span2',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: ', Nordeuropas største elmarked. Hver dag kl. 13:00 offentliggøres næste dags spotpriser baseret på forventet udbud og efterspørgsel.',
                _key: 'span3'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block2',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Priserne påvirkes primært af:',
                _key: 'span4'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block3',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: '• ',
                _key: 'span5',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: 'Vindproduktion',
                _key: 'span6',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: ' - Når det blæser kraftigt, falder priserne markant. Danmark har nogle af Europas laveste elpriser takket være vores omfattende vindmøllekapacitet.',
                _key: 'span7'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block4',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: '• ',
                _key: 'span8',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: 'Solenergi',
                _key: 'span9',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: ' - Særligt om sommeren bidrager solceller til lavere middagspriser.',
                _key: 'span10'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block5',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: '• ',
                _key: 'span11',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: 'Forbrug',
                _key: 'span12',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: ' - Morgen og aften ser typisk de højeste priser pga. øget efterspørgsel.',
                _key: 'span13'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block6',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: '• ',
                _key: 'span14',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: 'Import/Eksport',
                _key: 'span15',
                marks: ['strong']
              },
              {
                _type: 'span',
                text: ' - Forbindelser til Tyskland, Norge og Sverige påvirker priserne.',
                _key: 'span16'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block7',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Vores elpris prognose analyserer alle disse faktorer for at give dig det bedste overblik over kommende priser.',
                _key: 'span17'
              }
            ]
          }
        ]
      },
      {
        _key: 'renewable-1',
        _type: 'renewableEnergyForecast',
        title: 'Grøn Energi Prognose - Næste 7 Dage',
        description: 'Se hvornår strømmen er mest klimavenlig. Høj vindproduktion betyder både lavere priser og mindre CO2.',
        showPercentages: true,
        showTrend: true
      },
      {
        _key: 'calculator-1',
        _type: 'priceCalculator',
        variant: 'standalone',
        heading: 'Beregn Din Besparelse med Smart Planlægning',
        description: 'Se hvor meget du kan spare ved at flytte dit forbrug til billige timer.'
      },
      {
        _key: 'weekly-trends',
        _type: 'pageSection',
        heading: 'Ugentlige Mønstre i Elpriser',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: 'block8',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Elpriserne følger tydelige mønstre gennem ugen, som du kan udnytte til din fordel:',
                _key: 'span18'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block9',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Hverdage (Mandag-Fredag)',
                _key: 'span19'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block10',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'På hverdage ser vi typisk de højeste priser om morgenen (kl. 07-09) og igen om aftenen (kl. 17-20), når danskerne kommer hjem fra arbejde. Industrien bruger mest strøm i dagtimerne, hvilket holder priserne oppe.',
                _key: 'span20'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block11',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Weekender',
                _key: 'span21'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block12',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'I weekender falder priserne ofte med 15-30% sammenlignet med hverdage. Industriens reducerede forbrug kombineret med fortsat vindproduktion skaber gunstige priser - perfekt til vask, opvask og opladning.',
                _key: 'span22'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block13',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Nattetimer',
                _key: 'span23'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block14',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Mellem kl. 00:00 og 06:00 er priserne næsten altid lavest. Smart home-udstyr kan automatisk udnytte disse timer til opvaskemaskine, vaskemaskine og elbil-opladning.',
                _key: 'span24'
              }
            ]
          }
        ]
      },
      {
        _key: 'monthly-production',
        _type: 'monthlyProductionChart',
        title: 'Historisk Produktion og Prismønstre',
        description: 'Se hvordan forskellige energikilder påvirker priserne gennem året.',
        showComparison: true,
        comparisonType: 'lastYear'
      },
      {
        _key: 'co2-chart',
        _type: 'co2EmissionsChart',
        title: 'CO2-Udledning og Elpriser',
        description: 'Lavere CO2-udledning betyder ofte lavere priser - takket være vindkraft.',
        showForecast: true,
        region: 'DK'
      },
      {
        _key: 'provider-list',
        _type: 'providerList',
        title: 'Vælg Den Rette Elleverandør til Variable Priser',
        description: 'Med gode prognoser kan variable priser spare dig mange penge. Vælg en leverandør med fokus på grøn energi.',
        showDetailedPricing: true,
        showGreenEnergy: true,
        maxProviders: 6
      },
      {
        _key: 'info-cards',
        _type: 'infoCardsSection',
        heading: 'Vigtige Fakta om Elpris Prognoser',
        cards: [
          {
            _key: 'card1',
            _type: 'infoCard',
            title: 'Daglig Opdatering',
            description: 'Elpriser for næste dag offentliggøres hver dag kl. 13:00',
            icon: 'Clock'
          },
          {
            _key: 'card2',
            _type: 'infoCard',
            title: '48 Timers Horisont',
            description: 'Vi viser altid priser for i dag og i morgen time for time',
            icon: 'Calendar'
          },
          {
            _key: 'card3',
            _type: 'infoCard',
            title: 'Vejrbaseret',
            description: 'Vindprognoser er afgørende for præcise prisprognoser',
            icon: 'Cloud'
          }
        ]
      },
      {
        _key: 'practical-tips',
        _type: 'pageSection',
        heading: 'Praktiske Tips: Udnyt Elpris Prognoser Optimalt',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'block15',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: '1. Planlæg Store Apparater',
                _key: 'span25'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block16',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Vaskemaskine, tørretumbler og opvaskemaskine bruger meget strøm. Ved at køre dem i billige timer (typisk nat eller weekend) kan en familie spare 2.000-3.000 kr årligt.',
                _key: 'span26'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block17',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: '2. Oplad Elbilen Smart',
                _key: 'span27'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block18',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'En elbil bruger typisk 15-20 kWh per 100 km. Ved at oplade når prisen er under 1 kr/kWh frem for 3 kr/kWh, sparer du 30-40 kr per opladning. Med smart opladning kan du spare over 5.000 kr årligt.',
                _key: 'span28'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block19',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: '3. Brug Timere og Smart Home',
                _key: 'span29'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block20',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Moderne apparater har ofte timer-funktioner. Smart home-udstyr kan automatisk tænde og slukke baseret på elpriser. Investeringen tjener sig ofte hjem på under et år.',
                _key: 'span30'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block21',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: '4. Forstå Sæsonvariationer',
                _key: 'span31'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block22',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Vinter har generelt højere priser pga. øget forbrug og mindre sol. Forår og efterår har ofte de laveste priser pga. god vindproduktion og moderat forbrug.',
                _key: 'span32'
              }
            ]
          }
        ]
      },
      {
        _key: 'technical-deep-dive',
        _type: 'pageSection',
        heading: 'Teknisk Forklaring: Sådan Laves Elpris Prognoser',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: 'block23',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Moderne elpris prognoser bruger avancerede matematiske modeller, der kombinerer flere datakilder:',
                _key: 'span33'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block24',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Vejrdata og Vindprognoser',
                _key: 'span34'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block25',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Danmarks Meteorologiske Institut (DMI) leverer præcise vindprognoser, som er afgørende for at forudsige vindmølleproduktion. En vindhastighedsændring på blot 1 m/s kan påvirke elprisen med 10-20 øre/kWh.',
                _key: 'span35'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block26',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Machine Learning og AI',
                _key: 'span36'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block27',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Moderne prognosesystemer bruger kunstig intelligens til at analysere historiske mønstre. Modellerne lærer sammenhænge mellem vejr, forbrug, ugedag, årstid og priser.',
                _key: 'span37'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block28',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Markedsanalyse',
                _key: 'span38'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block29',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Priser i nabolande, planlagte vedligeholdelser af kraftværker, og brændselspriser indgår alle i de komplekse modeller. Selv politiske beslutninger kan påvirke priserne.',
                _key: 'span39'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block30',
            style: 'h3',
            children: [
              {
                _type: 'span',
                text: 'Nøjagtighed',
                _key: 'span40'
              }
            ]
          },
          {
            _type: 'block',
            _key: 'block31',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'For næste dag er prognoserne meget præcise (95%+ nøjagtighed), da markedspriserne allerede er fastsat. For 2-7 dage frem er nøjagtigheden typisk 70-85%, primært afhængig af vejrprognosernes præcision.',
                _key: 'span41'
              }
            ]
          }
        ]
      },
      {
        _key: 'regional-differences',
        _type: 'regionalComparison',
        title: 'DK1 vs DK2: Regionale Prisforskelle',
        description: 'Se hvordan elpriser varierer mellem Vest- og Østdanmark.',
        showHistoricalTrend: true,
        showPriceDifference: true
      },
      {
        _key: 'faq-section',
        _type: 'faqGroup',
        title: 'Ofte Stillede Spørgsmål om Elpris Prognoser',
        description: 'Find svar på de mest almindelige spørgsmål om elpriser og prognoser.',
        faqItems: [
          { _type: 'reference', _ref: 'faq-prognoser-1' },
          { _type: 'reference', _ref: 'faq-prognoser-2' },
          { _type: 'reference', _ref: 'faq-prognoser-3' },
          { _type: 'reference', _ref: 'faq-prognoser-4' }
        ]
      },
      {
        _key: 'value-prop-1',
        _type: 'valueProposition',
        heading: 'Vindkraft Gør Forskellen',
        subheading: 'Danmark har Europas bedste forudsætninger for billig, grøn strøm',
        items: [
          { _type: 'reference', _ref: 'value-prop-wind-1' },
          { _type: 'reference', _ref: 'value-prop-wind-2' },
          { _type: 'reference', _ref: 'value-prop-wind-3' }
        ]
      },
      {
        _key: 'fixed-vs-variable',
        _type: 'pricingComparison',
        title: 'Fast Pris eller Variabel? Prognoser Hjælper Dig Vælge',
        description: 'Med gode prognoser kan variable priser være det bedste valg for de fleste.',
        showCalculator: true,
        showRecommendation: true
      },
      {
        _key: 'cta-final',
        _type: 'callToActionSection',
        heading: 'Start Din Besparelse i Dag',
        description: 'Få daglige elpris prognoser og spar tusindvis af kroner årligt. Vælg en elleverandør der giver dig fleksibilitet og grøn energi.',
        primaryButtonText: 'Find din elleverandør',
        primaryButtonLink: '/sammenlign',
        secondaryButtonText: 'Se dagens priser',
        secondaryButtonLink: '/elpriser',
        variant: 'centered'
      }
    ]
  }

  // Deploy the page
  console.log('📄 Creating comprehensive Prognoser page...')
  try {
    const result = await client.createOrReplace(prognoserPage)
    console.log('✅ Page created successfully:', result._id)
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.prognoser')
    console.log('🌐 Frontend URL: /prognoser')
  } catch (error) {
    console.error('❌ Error creating page:', error)
    throw error
  }
}

// Run deployment
deployPrognoserPage()
  .then(() => {
    console.log('🎉 Deployment completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Deployment failed:', error)
    process.exit(1)
  })