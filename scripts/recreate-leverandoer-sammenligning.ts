#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

if (!process.env.VITE_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
  throw new Error('Missing required environment variables')
}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Helper function to generate unique keys
const generateKey = () => Math.random().toString(36).substr(2, 9)

// Helper function to create text blocks
const createTextBlock = (text: string, style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' = 'normal') => ({
  _type: 'block',
  _key: generateKey(),
  style,
  children: [{
    _type: 'span',
    _key: generateKey(),
    text,
    marks: []
  }]
})

async function recreateLeverandoerSammenligning() {
  console.log('🔧 Recreating Leverandør Sammenligning page with auto-generated ID...')

  try {
    // First, delete the old page with hardcoded ID
    console.log('🗑️ Deleting old page with hardcoded ID...')
    await client.delete('page.leverandoer-sammenligning')
    
    console.log('✅ Old page deleted')
    console.log('📝 Creating new page with auto-generated ID...')

    const pageContent = {
      _type: 'page',
      title: 'Sammenlign Elselskaber & Find Danmarks Bedste Elpris 2025',
      slug: {
        _type: 'slug',
        current: 'leverandoer-sammenligning'
      },
      seoMetaTitle: 'Sammenlign Elselskaber i Danmark 2025 - Find Bedste Elpris | DinElPortal',
      seoMetaDescription: 'Sammenlign alle danske elselskaber på pris, grøn energi og service. Se aktuelle spotpriser, CO2-udledning og spar op til 2.000 kr/år. Skift nemt i dag.',
      seoKeywords: [
        'sammenlign elpriser',
        'elselskaber danmark',
        'billigste el',
        'skift elselskab',
        'elpriser dk1 dk2',
        'grøn strøm',
        'elpriser i dag',
        'bedste elselskab',
        'vindstød el'
      ],
      contentBlocks: [
        // Hero with Calculator
        {
          _type: 'heroWithCalculator',
          _key: generateKey(),
          headline: 'Find Danmarks Bedste Elselskab',
          subheadline: 'Sammenlign priser fra 40+ elselskaber og spar op til 2.000 kr om året'
        },

        // Provider List - Main comparison component
        {
          _type: 'providerList',
          _key: generateKey(),
          title: 'Sammenlign Alle Danske Elselskaber',
          providers: [] // Empty shows all providers with Vindstød first
        },

        // Page Section: Why Compare
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Derfor skal du sammenligne elselskaber',
          headerAlignment: 'center',
          content: [
            createTextBlock('At vælge det rigtige elselskab kan virke overvældende med over 40 forskellige muligheder på det danske marked. Men forskellen mellem det dyreste og billigste selskab kan betyde tusindvis af kroner om året for din husstand.'),
            createTextBlock(''),
            createTextBlock('Hvad gør et elselskab til det bedste valg?', 'h3'),
            createTextBlock('Det "bedste" elselskab afhænger helt af dine personlige prioriteter:'),
            createTextBlock('• Ønsker du den absolut laveste pris?'),
            createTextBlock('• Er ægte grøn energi vigtig for dig?'),
            createTextBlock('• Foretrækker du fast eller variabel pris?'),
            createTextBlock('• Hvor vigtig er kundeservice og digitale løsninger?'),
            createTextBlock(''),
            createTextBlock('Vores omfattende sammenligning hjælper dig med at finde præcis det elselskab, der matcher dine behov og værdier.')
          ]
        },

        // Real Price Comparison Table
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Aktuelle Elpriser Lige Nu',
          headerAlignment: 'center',
          content: [
            createTextBlock('Se de aktuelle spotpriser og sammenlign totalpriser fra forskellige elselskaber i realtid:'),
            {
              _type: 'realPriceComparisonTable',
              _key: generateKey(),
              title: 'Live Prissammenligning',
              subtitle: 'Opdateres hvert 15. minut',
              description: [
                createTextBlock('Tabellen viser den samlede pris inklusiv spotpris, elselskabets tillæg, netafgifter og moms. Grønne tal viser de laveste priser.')
              ],
              region: 'DK2',
              highlightLowest: true,
              showSpotPrice: true,
              showProviderFee: true,
              showTotalPrice: true
            }
          ]
        },

        // Declaration Gridmix - CO2 and Energy Production
        {
          _type: 'declarationGridmix',
          _key: generateKey(),
          title: 'Elproduktion og CO₂-udledning',
          subtitle: 'Danmarks energimix og miljøpåvirkning i realtid',
          leadingText: [
            createTextBlock('Se hvordan Danmarks el produceres lige nu, og hvor grøn strømmen er. Vindstød leverer 100% vindenergi, mens andre selskaber ofte blander forskellige energikilder.')
          ],
          showSummary: true,
          view: '7d',
          headerAlignment: 'center'
        },

        // Deep Dive: Vindstød
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Vindstød: Vores Grønne Anbefaling',
          headerAlignment: 'left',
          content: [
            createTextBlock('Vindstød skiller sig ud som Danmarks mest ambitiøse grønne elselskab. Hvor mange selskaber nøjes med at købe certifikater, investerer Vindstød aktivt i nye danske vindmølleparker.'),
            createTextBlock(''),
            createTextBlock('Hvad gør Vindstød specielt:', 'h3'),
            createTextBlock('• 100% dansk vindenergi fra over 2.500 vindmøller'),
            createTextBlock('• Aktive investeringer i nye vindmølleprojekter'),
            createTextBlock('• Transparent prisstruktur: kun 1 kr i månedligt gebyr'),
            createTextBlock('• Moderne app med timeforbrug og CO2-besparelser'),
            createTextBlock('• Ingen bindingsperiode eller skjulte gebyrer'),
            createTextBlock(''),
            createTextBlock('Prismæssigt ligger Vindstød typisk 2-3 øre over de absolut billigste. For en gennemsnitsfamilie betyder det måske 100-150 kr ekstra om året - en lille pris for at støtte udbygningen af dansk vindkraft.'),
            createTextBlock(''),
            createTextBlock('Kundeservice og digitale løsninger:', 'h3'),
            createTextBlock('Vindstød har investeret kraftigt i deres digitale platform. Appen giver fuld kontrol over dit forbrug med timebaserede opgørelser, og du kan følge præcis hvor meget CO2 du har sparet.')
          ]
        },

        // Consumption Map
        {
          _type: 'consumptionMap',
          _key: generateKey(),
          title: 'Elforbrug i Danmark',
          subtitle: 'Se hvordan elforbruget fordeler sig på tværs af landet',
          leadingText: [
            createTextBlock('Interaktivt kort over Danmarks elforbrug opdelt på kommuner. Bemærk forskellen mellem by- og landområder, samt hvordan industritunge områder har højere forbrug.')
          ],
          headerAlignment: 'center',
          dataSource: 'latest',
          consumerType: 'all',
          colorScheme: 'brand',
          showLegend: true,
          showTooltips: true,
          enableInteraction: true,
          updateInterval: 60,
          defaultView: '24h',
          showStatistics: true,
          mobileLayout: 'responsive'
        },

        // Other Major Providers
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Andre Store Elselskaber i Danmark',
          headerAlignment: 'left',
          content: [
            createTextBlock('Ørsted: Den Store, Stabile Gigant', 'h3'),
            createTextBlock('Danmarks største energiselskab og global leder inden for havvind. Ørsted tilbyder både faste og variable priser med stabil leverance. Prismæssigt ligger de i midterfeltet - sjældent billigst, men heller ikke dyrest.'),
            createTextBlock(''),
            createTextBlock('Norlys: Andelsselskabet med Kunderne i Fokus', 'h3'),
            createTextBlock('Danmarks største andelsejede energiselskab. Overskuddet går tilbage til kunderne og lokalsamfundet. Tilbyder attraktive pakkeløsninger med el, internet og TV. God balance mellem pris og bæredygtighed.'),
            createTextBlock(''),
            createTextBlock('OK: Fra Benzintank til Elstikkontakt', 'h3'),
            createTextBlock('Ofte blandt de billigste på markedet gennem volumen og effektivitet. Simple produkter, nem administration og integration med OK bonusprogram. Perfekt for den prisfokuserede forbruger.'),
            createTextBlock(''),
            createTextBlock('Modstrøm: Den Digitale Udfordrer', 'h3'),
            createTextBlock('Positionerer sig som billigst og mest klimavenlig. Moderne platform med smart home integration og realtidsforbrug. Tilbyder både variable og faste priser.'),
            createTextBlock(''),
            createTextBlock('Gasel Energi: Lokal Forankring', 'h3'),
            createTextBlock('Højeste kundetilfredshed på Trustpilot (4.6/5). Personlig service og lokalt engagement. Grøn profil med investeringer i sol og vind.')
          ]
        },

        // Price Calculator Section
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Beregn Din Besparelse',
          headerAlignment: 'center',
          content: [
            createTextBlock('Brug vores beregner til at se præcis hvor meget du kan spare ved at skifte elselskab:'),
            {
              _type: 'priceCalculator',
              _key: generateKey(),
              title: 'Personlig Prisberegner'
            }
          ]
        },

        // Value Proposition - WITH CONTENT THIS TIME
        {
          _type: 'valueProposition',
          _key: generateKey(),
          heading: 'Fordele ved at sammenligne elselskaber',
          subheadline: 'Opdag fordelene ved at sammenligne og skifte elselskab',
          content: [
            createTextBlock('Med over 40 elselskaber på det danske marked kan det betale sig at bruge 5 minutter på at sammenligne priser og services. Vores platform gør det nemt at finde præcis det elselskab, der matcher dine behov - uanset om du prioriterer lave priser, grøn energi eller excellent kundeservice.')
          ],
          items: [
            {
              _type: 'valueItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'piggy-bank',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              heading: 'Spar op til 2.000 kr/år',
              description: 'Den gennemsnitlige danske familie kan spare mellem 500-2.000 kr årligt ved at vælge det rigtige elselskab.'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'leaf',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              heading: 'Støt den grønne omstilling',
              description: 'Vælg et elselskab der investerer i ny vedvarende energi, ikke bare køber certifikater.'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'shield-check',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              heading: 'Fuld gennemsigtighed',
              description: 'Se alle priser, gebyrer og betingelser samlet ét sted. Ingen skjulte overraskelser.'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'zap',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              heading: 'Skift på 5 minutter',
              description: 'Det nye elselskab håndterer alt det praktiske. Du skal bare vælge og tilmelde dig.'
            }
          ]
        },

        // Understanding Electricity Prices
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Forstå Din Elregning',
          headerAlignment: 'left',
          content: [
            createTextBlock('Din samlede elpris består af flere komponenter:', 'h3'),
            createTextBlock(''),
            createTextBlock('1. Spotpris (ca. 30-40% af total)'),
            createTextBlock('Den rå elpris der handles på Nord Pool elbørsen. Varierer hver time baseret på udbud og efterspørgsel.'),
            createTextBlock(''),
            createTextBlock('2. Elselskabets tillæg (ca. 5-10%)'),
            createTextBlock('Dette er hvor elselskaberne konkurrerer. Typisk mellem 0,04-0,20 kr/kWh afhængigt af selskab og produkt.'),
            createTextBlock(''),
            createTextBlock('3. Transport og systemydelser (ca. 20%)'),
            createTextBlock('Betaling for at transportere strømmen gennem elnettet. Fast afgift uanset elselskab.'),
            createTextBlock(''),
            createTextBlock('4. Afgifter og PSO (ca. 30%)'),
            createTextBlock('Elafgift på 0,90 kr/kWh (reduceret fra 2025). Går til statskassen og grøn omstilling.'),
            createTextBlock(''),
            createTextBlock('5. Moms (25% af alt)'),
            createTextBlock('Standard moms på 25% tilføjes til sidst på hele beløbet.'),
            createTextBlock(''),
            createTextBlock('Regional prisforskel - DK1 vs DK2:', 'h3'),
            createTextBlock('Danmark er opdelt i to prisområder:'),
            createTextBlock('• DK1 (Vestdanmark): Jylland og Fyn'),
            createTextBlock('• DK2 (Østdanmark): Sjælland og øerne'),
            createTextBlock(''),
            createTextBlock('Prisforskellen skyldes forskellige produktionsforhold og transmissionsbegrænsninger mellem områderne. DK1 har typisk lavere priser grundet større vindkraftkapacitet.')
          ]
        },

        // Feature List - How to Switch WITH PROPER ICONS
        {
          _type: 'featureList',
          _key: generateKey(),
          title: 'Sådan skifter du elselskab',
          subtitle: 'Det er nemmere end du tror - følg disse simple trin',
          features: [
            {
              _type: 'featureItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'search',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              title: '1. Sammenlign priser',
              description: 'Brug vores sammenligning til at finde det bedste elselskab for dig'
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'file-check',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              title: '2. Tjek din nuværende aftale',
              description: 'Se om du har bindingsperiode eller opsigelsesvarsel'
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'user-plus',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              title: '3. Tilmeld dig nyt selskab',
              description: 'Udfyld tilmeldingen online - det tager kun 2-3 minutter'
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'refresh-cw',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              title: '4. Automatisk skift',
              description: 'Dit nye elselskab klarer opsigelsen og alt det praktiske'
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              icon: {
                _type: 'icon.manager',
                name: 'check-circle',
                manager: 'lucide',
                metadata: {
                  version: '0.469.0',
                  license: 'ISC',
                  author: 'Lucide Contributors',
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  fill: 'none'
                }
              },
              title: '5. Velkommen til besparelser',
              description: 'Efter 3 uger er skiftet gennemført og du sparer penge'
            }
          ]
        },

        // Green Energy Deep Dive
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Grøn Strøm - Hvad er Ægte Bæredygtighed?',
          headerAlignment: 'left',
          content: [
            createTextBlock('Ikke al "grøn strøm" er skabt lige. Der er stor forskel på elselskaber der aktivt investerer i ny vedvarende energi, og dem der blot køber certifikater.'),
            createTextBlock(''),
            createTextBlock('Certifikater vs. Reel Produktion:', 'h3'),
            createTextBlock('Mange elselskaber markedsfører sig som "100% grønne" ved at købe oprindelsesgarantier (certifikater). Dette betyder IKKE at de producerer grøn energi - de køber bare papirer der beviser at nogen et sted har produceret vedvarende energi.'),
            createTextBlock(''),
            createTextBlock('Vindstød går en anden vej:', 'h3'),
            createTextBlock('• Ejer og driver over 2.500 danske vindmøller'),
            createTextBlock('• Investerer aktivt i nye vindmølleparker'),
            createTextBlock('• Leverer reel vindenergi til det danske elnet'),
            createTextBlock('• Bidrager direkte til Danmarks energiomstilling'),
            createTextBlock(''),
            createTextBlock('Når du vælger Vindstød, støtter du direkte udbygningen af dansk vindkraft - ikke bare handel med certifikater.'),
            createTextBlock(''),
            createTextBlock('Danmarks Energimix 2025:', 'h3'),
            createTextBlock('• 59% vindenergi'),
            createTextBlock('• 11% solenergi'),
            createTextBlock('• 8% biomasse'),
            createTextBlock('• 22% fossil energi og import'),
            createTextBlock(''),
            createTextBlock('Målet er 100% vedvarende energi i 2030. Ved at vælge elselskaber der investerer i ny kapacitet, accelererer vi denne omstilling.')
          ]
        },

        // FAQ Section
        {
          _type: 'faqGroup',
          _key: generateKey(),
          title: 'Ofte stillede spørgsmål om elselskaber',
          faqItems: [
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvordan kan elselskaber have forskellige priser når strømmen er den samme?',
              answer: [
                createTextBlock('Selvom strømmen er den samme uanset selskab, varierer priserne på grund af forskellige forretningsmodeller, effektivitet, marginer og services. Nogle selskaber har lave omkostninger og simple produkter, mens andre tilbyder ekstra services eller investerer i grøn energi.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Er det virkelig gratis at skifte elselskab?',
              answer: [
                createTextBlock('Ja, det er helt gratis at skifte elselskab i Danmark. Dit nye elselskab håndterer alt det praktiske, inklusiv opsigelse af din gamle aftale. Du skal kun betale hvis du har bindingsperiode hos dit nuværende selskab.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvor lang tid tager det at skifte?',
              answer: [
                createTextBlock('Selve tilmeldingen tager 2-3 minutter online. Skiftet gennemføres typisk inden for 3 uger, men kan tage op til 6 uger i sjældne tilfælde. Du får besked når skiftet er gennemført.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Skal jeg læse min måler af ved skift?',
              answer: [
                createTextBlock('Nej, hvis du har en fjernaflæst elmåler (de fleste har), sker det automatisk. Har du en gammel måler, får du besked om aflæsning. Dit netselskab håndterer dette - ikke elselskabet.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvad er forskellen på fast og variabel pris?',
              answer: [
                createTextBlock('Fast pris betyder samme kWh-pris i hele aftaleperioden - god til budgetsikkerhed. Variabel pris følger markedet og kan både stige og falde. Historisk set er variabel pris billigst over tid, men fast pris giver tryghed.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Er Vindstød virkelig 100% grøn?',
              answer: [
                createTextBlock('Ja, Vindstød leverer udelukkende strøm fra danske vindmøller. De ejer og driver over 2.500 vindmøller og investerer løbende i nye. Dette er ikke bare certifikater, men reel vindenergi produceret i Danmark.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvad hvis mit nye elselskab går konkurs?',
              answer: [
                createTextBlock('Du vil aldrig stå uden strøm. Hvis et elselskab går konkurs, overtager dit lokale forsyningsselskab automatisk leverancen til deres standardpriser, indtil du vælger et nyt selskab.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Kan jeg skifte hvis jeg bor til leje?',
              answer: [
                createTextBlock('Ja, hvis elmåleren står i dit navn. Betaler du el gennem huslejen, skal udlejer skifte. Tjek din lejekontrakt eller spørg udlejer hvis du er i tvivl.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvorfor er der prisforskel mellem Øst- og Vestdanmark?',
              answer: [
                createTextBlock('Danmark har to separate prisområder (DK1 vest og DK2 øst) på grund af begrænsninger i elnettet mellem landsdelene. Vestdanmark har typisk lavere priser grundet mere vindkraft, mens Østdanmark oftere må importere dyrere strøm.')
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvad er spotpris?',
              answer: [
                createTextBlock('Spotprisen er den rå elpris der handles på Nord Pool elbørsen. Den fastsættes hver dag for hver time næste døgn, baseret på udbud og efterspørgsel. Elselskabet lægger deres tillæg oveni spotprisen.')
              ]
            }
          ]
        },

        // Call to Action
        {
          _type: 'callToActionSection',
          _key: generateKey(),
          title: 'Klar til at spare på elregningen?',
          buttonText: 'Start sammenligning nu',
          buttonUrl: '#provider-list',
          description: 'Det tager kun 2 minutter at finde dit nye elselskab'
        }
      ]
    }

    // Create the page WITHOUT specifying _id
    const result = await client.create(pageContent)
    console.log('✅ New page created successfully!')
    console.log(`📄 Document ID: ${result._id} (auto-generated)`)
    console.log(`🔗 Slug: ${result.slug.current}`)
    console.log(`🌐 URL: https://dinelportal.dk/${result.slug.current}`)
    
  } catch (error) {
    console.error('❌ Recreation failed:', error)
    throw error
  }
}

// Execute recreation
recreateLeverandoerSammenligning()
  .then(() => {
    console.log('\n🎉 Recreation completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Recreation failed with error:', error)
    process.exit(1)
  })