import { createClient } from '@sanity/client'
import crypto from 'crypto'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Generate unique keys for content blocks
const generateKey = () => crypto.randomBytes(8).toString('hex')

// Initialize Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to create Portable Text blocks
function createTextBlock(text: string, style: string = 'normal'): any {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks: []
      }
    ],
    markDefs: []
  }
}

// Complete page content for elprisberegner
const elprisberegnerPage = {
  _id: 'f7ecf92783e749828f7281a6e5829d52',
  _type: 'page',
  title: 'Elprisberegner - Beregn Din Elpris Præcist',
  slug: {
    _type: 'slug',
    current: 'elprisberegner'
  },
  
  // SEO Fields
  seoMetaTitle: 'Elprisberegner 2025 - Beregn Din Præcise Elpris',
  seoMetaDescription: 'Gratis elprisberegner med realtidspriser. Beregn din præcise elpris inkl. alle afgifter og moms. Sammenlign elselskaber og find de billigste elpriser.',
  seoKeywords: [
    'elprisberegner',
    'elregning beregner',
    'beregn elpris',
    'strømpris beregner',
    'elpriser sammenligning',
    'elforbrug beregner',
    'strømforbrug beregner',
    'elpris udregning',
    'elkalkulator',
    'strømregning beregner'
  ],
  noIndex: false,
  
  // Content blocks
  contentBlocks: [
    // Section 1: Hero with Calculator
    {
      _type: 'heroWithCalculator',
      _key: generateKey(),
      headline: 'Elprisberegner - Beregn Din Præcise Elpris',
      subheadline: 'Gratis beregner med realtidspriser inklusiv alle afgifter og moms',
      content: [
        createTextBlock('Med vores elprisberegner kan du beregne din præcise elpris baseret på aktuelle spotpriser, elselskabets tillæg, nettariffer og alle afgifter. Beregneren opdateres hver time med nye elpriser, så du altid får det mest præcise resultat.'),
        createTextBlock('Start med at indtaste dit årlige elforbrug nedenfor, og se med det samme hvad din strøm koster hos forskellige elselskaber.')
      ],
      calculatorTitle: 'Beregn din elpris nu',
      showLivePrice: true,
      showProviderComparison: true
    },
    
    // Section 2: Real Price Comparison Table
    {
      _type: 'pageSection',
      _key: generateKey(),
      headerAlignment: 'center',
      content: [
        {
          _type: 'realPriceComparisonTable',
          _key: generateKey(),
          title: 'Aktuelle Elpriser Lige Nu',
          subtitle: 'Sammenlign realtidspriser hos forskellige elselskaber',
          description: [
            createTextBlock('Se de aktuelle elpriser hos forskellige selskaber opdateret i realtid. Tabellen viser den samlede pris per kWh inklusiv spotpris, elselskabets tillæg, nettariffer, afgifter og moms.')
          ],
          showSpotPrice: true,
          showProviderFee: true,
          showTotalPrice: true,
          highlightLowest: true,
          region: 'DK2'
        }
      ]
    },
    
    // Section 3: How the Calculator Works
    {
      _type: 'pageSection',
      _key: generateKey(),
      headerAlignment: 'left',
      content: [
        {
          _type: 'featureList',
          _key: generateKey(),
          title: 'Sådan Fungerer Elprisberegneren',
          subtitle: 'Præcis beregning baseret på realtidsdata',
          features: [
            {
              _type: 'featureItem',
              _key: generateKey(),
              title: 'Aktuelle Spotpriser',
              description: 'Beregneren henter timeaktuelle spotpriser direkte fra Nord Pool, så du altid får den mest præcise pris.',
              icon: {
                _type: 'icon.manager',
                name: 'TrendingUp',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
              }
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              title: 'Alle Afgifter Inkluderet',
              description: 'Vi inkluderer elafgift (90,4 øre/kWh), systemtarif (19 øre/kWh), nettariffer og 25% moms i beregningen.',
              icon: {
                _type: 'icon.manager',
                name: 'Calculator',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>'
              }
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              title: 'Sammenlign Elselskaber',
              description: 'Se priser fra alle danske elselskaber side om side, så du nemt kan finde det billigste tilbud.',
              icon: {
                _type: 'icon.manager',
                name: 'BarChart3',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>'
              }
            },
            {
              _type: 'featureItem',
              _key: generateKey(),
              title: 'Dit Præcise Forbrug',
              description: 'Indtast dit årlige elforbrug for at få en præcis beregning af dine forventede elomkostninger.',
              icon: {
                _type: 'icon.manager',
                name: 'Home',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
              }
            }
          ]
        }
      ]
    },
    
    // Section 4: Price Components Explanation
    {
      _type: 'pageSection',
      _key: generateKey(),
      headerAlignment: 'left',
      content: [
        {
          _type: 'valueProposition',
          _key: generateKey(),
          heading: 'Forstå Din Elpris - Alle Komponenter Forklaret',
          subheading: 'Din elpris består af flere forskellige elementer',
          content: [
            createTextBlock('Din samlede elpris består af mere end bare spotprisen. Her er en komplet oversigt over alle de komponenter, der udgør din elpris:'),
            createTextBlock('', 'normal'),
            createTextBlock('Spotpris (variabel)', 'h3'),
            createTextBlock('Spotprisen er markedsprisen for el, som fastsættes time for time på Nord Pool elbørsen. Prisen afhænger af udbud og efterspørgsel og varierer gennem døgnet. Typisk er prisen lavest om natten og højest i spidsbelastningsperioder morgen og aften.'),
            createTextBlock('', 'normal'),
            createTextBlock('Elselskabets tillæg (0-50 øre/kWh)', 'h3'),
            createTextBlock('Dette er elselskabets fortjeneste og dækker administration, kundeservice og risiko. Tillægget varierer meget mellem selskaber - fra 0 øre hos de billigste til over 50 øre hos de dyreste. Her kan du spare mest ved at sammenligne.'),
            createTextBlock('', 'normal'),
            createTextBlock('Nettarif (20-40 øre/kWh)', 'h3'),
            createTextBlock('Nettariffen betales til dit lokale netselskab for transport af strømmen gennem elnettet. Tariffen afhænger af hvor i landet du bor og hvilket netselskab der servicerer dit område.'),
            createTextBlock('', 'normal'),
            createTextBlock('Systemtarif (19 øre/kWh)', 'h3'),
            createTextBlock('Systemtariffen går til Energinet for at opretholde balancen i elnettet og sikre forsyningssikkerheden. Denne tarif er ens for alle forbrugere i Danmark.'),
            createTextBlock('', 'normal'),
            createTextBlock('Elafgift (90,4 øre/kWh i 2025)', 'h3'),
            createTextBlock('Elafgiften er en statsafgift på elforbrug. For almindelige husholdninger er afgiften 90,4 øre per kWh i 2025. Virksomheder betaler en lavere sats.'),
            createTextBlock('', 'normal'),
            createTextBlock('Moms (25%)', 'h3'),
            createTextBlock('Der lægges 25% moms oveni alle ovenstående priser og afgifter. Dette betyder at den endelige pris du betaler er 25% højere end summen af de andre komponenter.')
          ],
          valueItems: [
            {
              _type: 'valueItem',
              _key: generateKey(),
              heading: 'Gennemsnitlig elpris 2025',
              description: '2,10-2,80 kr/kWh inkl. alt'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              heading: 'Mulig besparelse',
              description: 'Op til 2.000 kr/år ved skift'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              heading: 'Prisudsving',
              description: '50 øre - 5 kr/kWh på døgnet'
            }
          ]
        }
      ]
    },
    
    // Section 5: Live Price Graph
    {
      _type: 'livePriceGraph',
      _key: generateKey(),
      title: 'Elpriser Lige Nu - Døgnets Timepriser',
      subtitle: 'Se hvordan elpriserne udvikler sig time for time',
      showHourlyPrices: true,
      showDailyAverage: true,
      showPriceTrend: true,
      showPriceZones: true,
      region: 'DK2',
      description: [
        createTextBlock('Grafen viser de aktuelle spotpriser for el gennem døgnet. De grønne områder indikerer perioder med lave priser, hvor det er billigst at bruge strøm. Røde områder viser høje priser, typisk i spidsbelastningsperioder.')
      ]
    },
    
    // Section 6: Savings Tips
    {
      _type: 'pageSection',
      _key: generateKey(),
      headerAlignment: 'left',
      content: [
        {
          _type: 'energyTipsSection',
          _key: generateKey(),
          title: 'Spar På Elregningen - Praktiske Råd',
          subtitle: 'Sådan udnytter du elprisberegneren til at spare penge',
          tips: [
            {
              _type: 'energyTip',
              _key: generateKey(),
              title: 'Flyt forbruget til billige timer',
              description: 'Brug elprisberegneren til at se hvornår på døgnet strømmen er billigst. Kør opvaskemaskine, vaskemaskine og tørretumbler om natten eller tidlig morgen.',
              savingPotential: 'Op til 500 kr/år',
              icon: {
                _type: 'icon.manager',
                name: 'Clock',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
              }
            },
            {
              _type: 'energyTip',
              _key: generateKey(),
              title: 'Sammenlign elselskaber regelmæssigt',
              description: 'Brug beregneren hver 3-6 måned til at tjekke om du stadig har det bedste tilbud. Markedet ændrer sig konstant.',
              savingPotential: 'Op til 2.000 kr/år',
              icon: {
                _type: 'icon.manager',
                name: 'RefreshCw',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
              }
            },
            {
              _type: 'energyTip',
              _key: generateKey(),
              title: 'Tjek dit faktiske forbrug',
              description: 'Brug beregneren med dit præcise årsforbrug fra sidste elregning for mest nøjagtige resultat.',
              savingPotential: 'Præcis beregning',
              icon: {
                _type: 'icon.manager',
                name: 'FileText',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
              }
            },
            {
              _type: 'energyTip',
              _key: generateKey(),
              title: 'Overvej timeafregning',
              description: 'Med timeafregnet el betaler du den faktiske timepris. Brug beregneren til at se om det kan betale sig for dig.',
              savingPotential: '10-30% på elprisen',
              icon: {
                _type: 'icon.manager',
                name: 'Zap',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
              }
            }
          ],
          showSavingsCalculator: true
        }
      ]
    },
    
    // Section 7: Appliance Calculator
    {
      _type: 'applianceCalculator',
      _key: generateKey(),
      title: 'Beregn Elforbruget For Dine Apparater',
      subtitle: 'Se hvad forskellige elektriske apparater koster i strøm',
      description: [
        createTextBlock('Brug denne beregner til at se hvad specifikke apparater koster i strøm. Vælg et apparat fra listen eller indtast effekt og brugstid manuelt.')
      ],
      showCostComparison: true,
      showDailyUsage: true,
      showYearlyCost: true
    },
    
    // Section 8: Regional Comparison
    {
      _type: 'regionalComparison',
      _key: generateKey(),
      title: 'Elpriser i DK1 vs DK2 - Regionale Forskelle',
      subtitle: 'Se prisforskelle mellem Øst- og Vestdanmark',
      description: [
        createTextBlock('Danmark er opdelt i to elprisområder - DK1 (Jylland/Fyn) og DK2 (Sjælland/Bornholm). Brug beregneren til at se aktuelle prisforskelle mellem områderne.')
      ],
      showPriceDifference: true,
      showHistoricalTrend: true,
      showTransmissionCapacity: true,
      defaultTimeframe: 'day'
    },
    
    // Section 9: Provider List
    {
      _type: 'providerList',
      _key: generateKey(),
      title: 'Elselskaber i Elprisberegneren',
      subtitle: 'Vi sammenligner priser fra alle danske elselskaber',
      description: [
        createTextBlock('Vores elprisberegner inkluderer alle aktive elselskaber på det danske marked. Listen opdateres løbende, så du altid får de nyeste priser og tilbud.'),
        createTextBlock('Alle priser i beregneren er baseret på samme spotpris og inkluderer identiske afgifter og tariffer. Den eneste forskel er elselskabets eget tillæg, hvilket gør sammenligningen helt fair og gennemskuelig.')
      ],
      headerAlignment: 'center',
      showPriceComparison: true,
      showGreenPercentage: true,
      showCustomerRating: true,
      sortBy: 'price'
    },
    
    // Section 10: FAQ Section
    {
      _type: 'faqGroup',
      _key: generateKey(),
      title: 'Ofte Stillede Spørgsmål om Elprisberegneren',
      description: [
        createTextBlock('Find svar på de mest almindelige spørgsmål om vores elprisberegner og hvordan du bruger den mest effektivt.')
      ],
      faqs: [
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor præcis er elprisberegneren?',
          answer: [
            createTextBlock('Vores elprisberegner er meget præcis, da den bruger realtidsdata fra flere kilder:'),
            createTextBlock('• Spotpriser opdateres hver time direkte fra Nord Pool'),
            createTextBlock('• Elselskabernes tillæg hentes dagligt fra deres hjemmesider'),
            createTextBlock('• Nettariffer og afgifter opdateres når de ændres'),
            createTextBlock('• Alle beregninger inkluderer moms og samtlige afgifter'),
            createTextBlock('Den eneste usikkerhed er dit fremtidige forbrug, som du selv estimerer.')
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvilke omkostninger er inkluderet i beregningen?',
          answer: [
            createTextBlock('Elprisberegneren inkluderer ALLE omkostninger:'),
            createTextBlock('• Spotpris (rå elpris fra børsen)'),
            createTextBlock('• Elselskabets tillæg'),
            createTextBlock('• Nettarif til dit lokale netselskab'),
            createTextBlock('• Systemtarif til Energinet (19 øre/kWh)'),
            createTextBlock('• Elafgift til staten (90,4 øre/kWh)'),
            createTextBlock('• 25% moms på hele beløbet'),
            createTextBlock('Du får altså den faktiske pris du kommer til at betale per kWh.')
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvordan finder jeg mit årlige elforbrug?',
          answer: [
            createTextBlock('Dit årlige elforbrug finder du lettest på følgende måder:'),
            createTextBlock('• Kig på din seneste årsopgørelse fra elselskabet'),
            createTextBlock('• Log ind på dit elselskabs hjemmeside eller app'),
            createTextBlock('• Kontakt dit elselskab telefonisk'),
            createTextBlock('• Check forbruget på din elmåler og gang med 12'),
            createTextBlock('Gennemsnitligt forbrug: Lejlighed 2.000 kWh, Rækkehus 3.000 kWh, Villa 4.000 kWh')
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Kan jeg stole på sammenligningen af elselskaber?',
          answer: [
            createTextBlock('Ja, vores sammenligning er 100% uvildig og objektiv:'),
            createTextBlock('• Vi viser ALLE elselskaber på markedet'),
            createTextBlock('• Priser hentes automatisk og kan ikke manipuleres'),
            createTextBlock('• Samme beregningsmetode bruges for alle selskaber'),
            createTextBlock('• Vi modtager ingen kommission for at fremhæve bestemte selskaber'),
            createTextBlock('• Sorteringen er altid efter laveste pris først'),
            createTextBlock('Du kan derfor trygt bruge beregneren til at finde det billigste elselskab.')
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvorfor varierer elpriserne så meget?',
          answer: [
            createTextBlock('Elpriserne varierer af flere årsager:'),
            createTextBlock('• Udbud og efterspørgsel ændrer sig konstant'),
            createTextBlock('• Vindkraft producerer forskelligt alt efter vejret'),
            createTextBlock('• Forbruget er højest morgen og aften'),
            createTextBlock('• Import/eksport påvirker priserne'),
            createTextBlock('• Forskellige elselskaber har forskellige tillæg'),
            createTextBlock('Brug beregneren til at se de aktuelle prisudsving og find de billigste tidspunkter.')
          ]
        }
      ]
    },
    
    // Section 11: Info Cards Section
    {
      _type: 'infoCardsSection',
      _key: generateKey(),
      title: 'Vigtig Information om Elpriser',
      cards: [
        {
          _type: 'infoCard',
          _key: generateKey(),
          title: 'Grøn strøm koster det samme',
          description: 'Vidste du at grøn strøm ikke behøver koste mere? Mange elselskaber tilbyder 100% vedvarende energi til samme pris som almindelig strøm.',
          icon: {
            _type: 'icon.manager',
            name: 'Leaf',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>'
          },
          linkText: 'Se grønne elselskaber',
          linkUrl: '/groen-energi'
        },
        {
          _type: 'infoCard',
          _key: generateKey(),
          title: 'Skift elselskab på 5 minutter',
          description: 'Det er nemt og gratis at skifte elselskab. Dit nye selskab klarer alt det praktiske, og du mister aldrig strømmen.',
          icon: {
            _type: 'icon.manager',
            name: 'ArrowRightLeft',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"></path><path d="M20 7H4"></path><path d="m8 21-4-4 4-4"></path><path d="M4 17h16"></path></svg>'
          },
          linkText: 'Læs skifteguide',
          linkUrl: '/skift-elselskab'
        },
        {
          _type: 'infoCard',
          _key: generateKey(),
          title: 'Tjek priser hver 3. måned',
          description: 'Elpriserne ændrer sig konstant. Ved at tjekke priser kvartalsvis sikrer du dig altid det bedste tilbud.',
          icon: {
            _type: 'icon.manager',
            name: 'Calendar',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
          }
        }
      ]
    },
    
    // Section 12: Call to Action
    {
      _type: 'callToActionSection',
      _key: generateKey(),
      title: 'Start Din Besparelse Nu',
      description: [
        createTextBlock('Brug elprisberegneren til at finde det billigste elselskab og start din besparelse med det samme. Det tager kun 2 minutter at beregne din pris og 5 minutter at skifte selskab.')
      ],
      primaryCta: {
        _type: 'callToAction',
        text: 'Beregn Din Elpris Nu',
        url: '#beregner',
        style: 'primary'
      },
      secondaryCta: {
        _type: 'callToAction',
        text: 'Se Aktuelle Elpriser',
        url: '/elpriser',
        style: 'secondary'
      },
      alignment: 'center',
      backgroundColor: 'primary'
    },
    
    // Section 13: Price Example Table
    {
      _type: 'pageSection',
      _key: generateKey(),
      headerAlignment: 'left',
      content: [
        {
          _type: 'priceExampleTable',
          _key: generateKey(),
          title: 'Eksempler På Elpriser Ved Forskellige Forbrug',
          subtitle: 'Se hvad forskellige husstande typisk betaler om året',
          description: [
            createTextBlock('Tabellen viser typiske årlige elomkostninger for forskellige boligtyper baseret på gennemsnitlige elpriser på 2,50 kr/kWh inkl. alt.')
          ],
          examples: [
            {
              _type: 'priceExample',
              _key: generateKey(),
              label: '1-værelses lejlighed',
              consumption: 1500,
              yearlyPrice: 3750,
              monthlyPrice: 313,
              description: 'Single person, basis forbrug'
            },
            {
              _type: 'priceExample',
              _key: generateKey(),
              label: '3-værelses lejlighed',
              consumption: 2500,
              yearlyPrice: 6250,
              monthlyPrice: 521,
              description: 'Par uden børn'
            },
            {
              _type: 'priceExample',
              _key: generateKey(),
              label: 'Rækkehus',
              consumption: 3500,
              yearlyPrice: 8750,
              monthlyPrice: 729,
              description: 'Familie med 2 børn'
            },
            {
              _type: 'priceExample',
              _key: generateKey(),
              label: 'Villa uden varmepumpe',
              consumption: 4500,
              yearlyPrice: 11250,
              monthlyPrice: 938,
              description: 'Større familie'
            },
            {
              _type: 'priceExample',
              _key: generateKey(),
              label: 'Villa med varmepumpe',
              consumption: 7000,
              yearlyPrice: 17500,
              monthlyPrice: 1458,
              description: 'Elvarmepumpe til opvarmning'
            },
            {
              _type: 'priceExample',
              _key: generateKey(),
              label: 'Villa med elbil',
              consumption: 8500,
              yearlyPrice: 21250,
              monthlyPrice: 1771,
              description: 'Inkl. opladning af elbil'
            }
          ],
          showMonthlyPrice: true,
          highlightCheapest: true
        }
      ]
    },
    
    // Section 14: Daily Price Timeline
    {
      _type: 'dailyPriceTimeline',
      _key: generateKey(),
      title: 'Døgnets Billigste Timer',
      subtitle: 'Find de bedste tidspunkter at bruge strøm',
      description: [
        createTextBlock('Se hvilke timer på døgnet strømmen typisk er billigst. Planlæg dit forbrug efter disse mønstre for maksimal besparelse.')
      ],
      showPriceLevel: true,
      showRecommendations: true,
      showAveragePrice: true,
      region: 'DK2'
    },
    
    // Section 15: Final Text Content
    {
      _type: 'pageSection',
      _key: generateKey(),
      headerAlignment: 'left',
      content: [
        {
          _type: 'valueProposition',
          _key: generateKey(),
          heading: 'Hvorfor Bruge Vores Elprisberegner?',
          subheading: 'Danmarks mest præcise og brugervenlige elberegner',
          content: [
            createTextBlock('Vores elprisberegner er udviklet med fokus på præcision, gennemsigtighed og brugervenlighed. Her får du ikke bare en hurtig prisberegning - du får dyb indsigt i hvordan elmarkedet fungerer og hvordan du optimerer dine elomkostninger.'),
            createTextBlock('', 'normal'),
            createTextBlock('Realtidsdata direkte fra kilderne', 'h3'),
            createTextBlock('Vi henter spotpriser direkte fra Nord Pool hver time, elselskabernes priser opdateres dagligt, og alle tariffer og afgifter er altid aktuelle. Dette sikrer at dine beregninger altid er baseret på de nyeste data.'),
            createTextBlock('', 'normal'),
            createTextBlock('Komplet prisoverblik', 'h3'),
            createTextBlock('Mange elprisberegnere viser kun en del af prisen. Vi inkluderer alt - spotpris, elselskabets tillæg, nettarif, systemtarif, elafgift og moms. Du får den eksakte pris du kommer til at betale.'),
            createTextBlock('', 'normal'),
            createTextBlock('Uvildig sammenligning', 'h3'),
            createTextBlock('Vi er ikke ejet af noget elselskab og modtager ingen kommission. Vores eneste mål er at hjælpe dig med at finde den bedste og billigste løsning. Alle elselskaber behandles ens i vores system.'),
            createTextBlock('', 'normal'),
            createTextBlock('Løbende udvikling', 'h3'),
            createTextBlock('Elprisberegneren opdateres konstant med nye funktioner. Vi lytter til brugernes ønsker og tilføjer løbende nye muligheder for at gøre værktøjet endnu mere nyttigt.')
          ],
          valueItems: [
            {
              _type: 'valueItem',
              _key: generateKey(),
              heading: '100% Gratis',
              description: 'Ingen skjulte gebyrer eller binding'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              heading: 'Altid Opdateret',
              description: 'Timeaktuelle priser døgnet rundt'
            },
            {
              _type: 'valueItem',
              _key: generateKey(),
              heading: 'Alle Selskaber',
              description: 'Sammenlign hele markedet på én gang'
            }
          ]
        }
      ]
    }
  ]
}

async function deployElprisberegnerPage() {
  try {
    console.log('🚀 Starting deployment of elprisberegner page...')
    
    // Check if API token is set
    if (!process.env.SANITY_API_TOKEN) {
      throw new Error('SANITY_API_TOKEN environment variable is not set')
    }
    
    // Deploy the page
    console.log('📝 Creating/updating page in Sanity...')
    const result = await client.createOrReplace(elprisberegnerPage)
    
    console.log('✅ Page deployed successfully!')
    console.log(`Page ID: ${result._id}`)
    console.log(`Title: ${result.title}`)
    console.log(`Slug: ${result.slug.current}`)
    console.log(`Total content blocks: ${result.contentBlocks.length}`)
    
    // Log individual sections for verification
    console.log('\n📋 Content sections deployed:')
    result.contentBlocks.forEach((block: any, index: number) => {
      console.log(`${index + 1}. ${block._type}${block.title ? ` - ${block.title}` : ''}`)
    })
    
    console.log('\n🎉 Deployment complete! View at: https://dinelportal.dk/elprisberegner')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      if ('response' in error) {
        console.error('API Response:', (error as any).response)
      }
    }
    process.exit(1)
  }
}

// Run the deployment
deployElprisberegnerPage()