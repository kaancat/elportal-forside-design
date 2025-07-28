import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Page content structure
const pageContent = {
  _type: 'page',
  title: 'Sådan vælger du den rigtige el-leverandør - Komplet guide 2024',
  slug: {
    _type: 'slug',
    current: 'hvordan-vaelger-du-elleverandoer'
  },
  // SEO fields are flat at root level
  seoMetaTitle: 'Sådan vælger du den rigtige el-leverandør - Komplet guide 2024',
  seoMetaDescription: 'Find den bedste el-leverandør til dit behov. Sammenlign priser, kontrakter og grøn energi. Spar penge og træf det rigtige valg med vores guide.',
  seoKeywords: ['vælg elselskab', 'el-leverandør', 'sammenlign elselskaber', 'bedste elselskab', 'elpriser', 'grøn strøm', 'fastpris el', 'spotpris', 'kundeservice elselskab', 'skift elselskab'],
  // Content blocks
  contentBlocks: [
    // Hero Section
    {
      _type: 'hero',
      _key: generateKey(),
      headline: 'Vælg den rigtige el-leverandør',
      subheadline: 'Spar tusindvis af kroner med det rigtige valg',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'At vælge den rigtige el-leverandør er en af de vigtigste beslutninger for din husstands økonomi. Med de seneste års prisstigninger på el kan det rigtige valg betyde tusindvis af kroner i besparelser årligt.',
              marks: []
            }
          ]
        }
      ],
      variant: 'centered',
      showScrollIndicator: true
    },

    // Introduction Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Din komplette guide til at vælge el-leverandør',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Med de seneste års prisstigninger på el kan det rigtige valg betyde tusindvis af kroner i besparelser årligt. Men hvordan navigerer du i junglen af tilbud, kontrakter og grønne løsninger?',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'I denne omfattende guide gennemgår vi alt, du behøver at vide for at træffe det bedste valg. Fra forståelse af forskellige prismodeller til vurdering af kundeservice og miljøhensyn - vi dækker alle aspekter, så du kan træffe en informeret beslutning.',
              marks: []
            }
          ]
        }
      ]
    },

    // Market Understanding Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Forstå markedet for el-leverandører i Danmark',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Liberaliseringen af elmarkedet',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Siden liberaliseringen af det danske elmarked har forbrugere haft mulighed for frit at vælge deres el-leverandør. Dette har skabt sund konkurrence og givet dig som forbruger flere valgmuligheder end nogensinde før.',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Det danske elmarked består af tre hovedkomponenter:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Netselskaber',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Vedligeholder elnettet (kan ikke vælges frit)',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'El-leverandører',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Sælger strøm til forbrugere (frit valg)',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Energinet',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Overordnet systemansvarlig',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Aktuelle markedstendenser',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'I 2024 ser vi flere vigtige tendenser på elmarkedet:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Stigende fokus på grøn energi og bæredygtighed',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Øget prisvolatilitet grundet geopolitiske forhold',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Flere innovative prismodeller og fleksible løsninger',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Voksende interesse for vindenergi og solceller',
              marks: []
            }
          ]
        }
      ]
    },

    // Feature List - Key Factors
    {
      _type: 'featureList',
      _key: generateKey(),
      title: 'De vigtigste faktorer når du vælger el-leverandør',
      subtitle: 'Overvej disse områder før du træffer dit valg',
      headerAlignment: 'center',
      items: [
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'Pris og prismodeller',
          description: 'Forstå forskellen mellem spotpris, fastpris og hybrid-modeller. Vælg den model der passer til din risikovillighed og forbrugsmønster.',
          icon: {
            _type: 'icon.manager',
            name: 'circleEuro',
            provider: 'hi',
            svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-width="2" d="M12,23 C18.0751322,23 23,18.0751322 23,12 C23,5.92486775 18.0751322,1 12,1 C5.92486775,1 1,5.92486775 1,12 C1,18.0751322 5.92486775,23 12,23 Z M6,8 L13,8 M6,12 L13,12 M15,16 C15,16 13.0611501,17 11.5,17 C9,17 7.5,15 7.5,12 C7.5,9 9,7 11.5,7 C13.0611501,7 15,8 15,8"></path></svg>'
          }
        },
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'Kontraktvilkår og binding',
          description: 'Check bindingsperioder, opsigelsesvarsel og gebyrer. Vælg fleksible løsninger der giver dig frihed til at skifte.',
          icon: {
            _type: 'icon.manager',
            name: 'contract',
            provider: 'fi',
            svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>'
          }
        },
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'Grøn energi',
          description: 'Vælg leverandører med certificeret vedvarende energi. Støt den grønne omstilling med vindstrøm eller solenergi.',
          icon: {
            _type: 'icon.manager',
            name: 'leaf',
            provider: 'fa',
            svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.3 5.4c-25.9 5.9-49.9 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z"></path></svg>'
          }
        },
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'Kundeservice',
          description: 'God support sparer dig frustrationer. Vælg leverandører med dansk kundeservice og gode digitale løsninger.',
          icon: {
            _type: 'icon.manager',
            name: 'headset',
            provider: 'fi',
            svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 12v-1.707c0-4.442-3.479-8.161-7.755-8.29-2.204-.051-4.251.736-5.816 2.256A7.933 7.933 0 0 0 4 10v2c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h2V10a5.95 5.95 0 0 1 1.821-4.306 5.977 5.977 0 0 1 4.363-1.691C15.392 4.099 18 6.921 18 10.293V20h2c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2z"></path><path d="M7 12h2v8H7zm8 0h2v8h-2z"></path></svg>'
          }
        }
      ]
    },

    // Price Calculator
    {
      _type: 'priceCalculatorWidget',
      _key: generateKey(),
      title: 'Beregn din potentielle besparelse',
      description: 'Se hvor meget du kan spare ved at vælge den rigtige el-leverandør',
      showComparison: true,
      variant: 'standalone'
    },

    // Price Models Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Forstå forskellige prismodeller',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Prisen er ofte den afgørende faktor for de fleste forbrugere. Men det handler ikke kun om at finde den laveste pris - det handler om at forstå forskellige prismodeller:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Spotpris (variabel pris)',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Følger markedets timepriser',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Potentielt laveste pris over tid',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Kræver risikovillighed og fleksibilitet',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Perfekt til forbrugere der kan flytte forbrug',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fastpris',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Garanteret pris i kontraktperioden',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Beskyttelse mod prisstigninger',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Typisk højere gennemsnitspris',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Giver budgetsikkerhed',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Hybrid-modeller',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Kombination af spot og fast',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Balance mellem sikkerhed og besparelse',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Ofte med prisloft eller garantier',
              marks: []
            }
          ]
        }
      ]
    },

    // Provider List
    {
      _type: 'providerList',
      _key: generateKey(),
      title: 'Sammenlign Elselskaber',
      subtitle: 'Find det bedste elselskab for dit behov',
      headerAlignment: 'center'
    },

    // Green Energy Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Grøn energi og bæredygtighed',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Miljøhensyn spiller en stadig større rolle for danske forbrugere. Når du vælger en grøn el-leverandør, bidrager du aktivt til den grønne omstilling.',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Vindstrøm',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• 100% vedvarende energi fra vindmøller',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Ofte fra danske vindmølleparker',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Certificeret grøn strøm',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Støtter den grønne omstilling',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Solenergi',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Voksende andel af energimixet',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Ofte kombineret med andre vedvarende kilder',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Særligt relevant for husstande med solceller',
              marks: []
            }
          ]
        }
      ]
    },

    // Value Proposition
    {
      _type: 'valueProposition',
      _key: generateKey(),
      heading: 'Hvorfor bruge ElPortal til sammenligning?',
      subheading: 'Vi gør det nemt at finde den bedste el-leverandør',
      items: [
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Realtidspriser',
          description: 'Altid opdaterede priser fra alle leverandører'
        },
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Transparent sammenligning',
          description: 'Alle omkostninger inkluderet - ingen skjulte gebyrer'
        },
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Grøn profil',
          description: 'Se hvilke leverandører der tilbyder vedvarende energi'
        },
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Brugeranmeldelser',
          description: 'Læs erfaringer fra andre forbrugere'
        }
      ]
    },

    // Info Cards Section - Consumer Types
    {
      _type: 'infoCardsSection',
      _key: generateKey(),
      title: 'Særlige overvejelser for forskellige forbrugertyper',
      subtitle: 'Find anbefalinger baseret på dit forbrug',
      cards: [
        {
          _type: 'infoCard',
          _key: generateKey(),
          title: 'Små husstande',
          description: 'Under 2.000 kWh/år',
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'For lejligheder og små huse: Fokus på lave faste gebyrer. Overvej abonnementsfrie løsninger. Spotpris kan være fordelagtig. Minimal risiko ved prisudsving.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'infoCard',
          _key: generateKey(),
          title: 'Familier',
          description: '2.000-6.000 kWh/år',
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'For typiske parcelhuse: Balance mellem pris og sikkerhed. Overvej hybrid-modeller. Vigtigt med god kundeservice. Potentiale for betydelige besparelser.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'infoCard',
          _key: generateKey(),
          title: 'Storforbrugere',
          description: 'Over 6.000 kWh/år',
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'For store huse eller med elbil/varmepumpe: Spotpris ofte mest fordelagtig. Overvej timebaseret forbrug. Smart home kan optimere forbrug. Grøn strøm bliver økonomisk attraktiv.',
                  marks: []
                }
              ]
            }
          ]
        }
      ]
    },

    // Process Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Processen: Fra research til skift',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fase 1: Forberedelse (1-2 uger før)',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '1. Saml dine elregninger',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '2. Notér nuværende leverandør og vilkår',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '3. Beregn årsforbrug',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '4. Definer behov og ønsker',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fase 2: Research og sammenligning (1 uge)',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '1. Brug ElPortals sammenligningsværktøj',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '2. Indhent tilbud fra 3-5 leverandører',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '3. Sammenlign totalomkostninger',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '4. Læs anmeldelser og erfaringer',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fase 3: Beslutning og skift (1-3 dage)',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '1. Vælg din nye leverandør',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '2. Underskriv kontrakt online',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '3. Leverandøren håndterer skiftet',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '4. Modtag bekræftelse',
              marks: []
            }
          ]
        }
      ]
    },

    // Common Pitfalls Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Almindelige faldgruber og hvordan du undgår dem',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Faldgrube 1: Kun at fokusere på kWh-prisen',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Problem',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Mange ser kun på den annoncerede kWh-pris',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Løsning',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Beregn altid totalomkostninger inkl. alle gebyrer',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Faldgrube 2: At ignorere bindingsperioder',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Problem',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Låst fast i dårlige aftaler',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Løsning',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Vælg fleksible løsninger medmindre prisen er exceptionel',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Faldgrube 3: At glemme den grønne profil',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Problem',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Vælger billigst uden hensyn til miljø',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Løsning',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ': Overvej langsigtet værdi af grøn energi',
              marks: []
            }
          ]
        }
      ]
    },

    // Vindstød Example Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Vindstød - Et eksempel på moderne el-leverandør',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Blandt de mange muligheder på markedet skiller nogle leverandører sig ud ved deres innovative tilgang og stærke fokus på bæredygtighed. Vindstød A/S er et godt eksempel på en moderne el-leverandør, der kombinerer konkurrencedygtige priser med 100% vindenergi.',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Deres approach inkluderer:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Transparent prisstruktur uden skjulte gebyrer',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Certificeret vindstrøm fra danske vindmøller',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Moderne digital platform med forbrugsdata',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Dansk kundeservice med høj ekspertise',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '• Fleksible kontraktvilkår uden lange bindinger',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Dette illustrerer hvordan fremtidens el-leverandører balancerer pris, service og bæredygtighed.',
              marks: []
            }
          ]
        }
      ]
    },

    // FAQ Group
    {
      _type: 'faqGroup',
      _key: generateKey(),
      heading: 'Ofte stillede spørgsmål',
      items: [
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor lang tid tager det at skifte el-leverandør?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Selve skifteprocessen tager typisk 1-3 hverdage at registrere. Den nye leverandør overtager ved næste månedsskifte, og du skal ikke selv kontakte din gamle leverandør.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Kan jeg skifte selvom jeg har binding?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Ja, men det kan koste et gebyr. Check dine nuværende kontraktvilkår for omkostninger ved opsigelse før tid.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvad er forskellen på netselskab og el-leverandør?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Netselskabet ejer og vedligeholder ledningsnettet - det kan du ikke vælge. El-leverandøren sælger strømmen - her har du frit valg.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Er grøn strøm dyrere?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Ikke nødvendigvis. Mange grønne leverandører er konkurrencedygtige på pris, og nogle er endda blandt de billigste.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvad sker der hvis min el-leverandør går konkurs?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Du mister aldrig strømmen. Netselskabet sikrer forsyning, og du flyttes automatisk til en forsyningspligtig leverandør.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvordan ved jeg om en leverandør er pålidelig?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Check virksomhedens historik, læs anmeldelser, verificér CVR-nummer og se efter branchegodkendelser.',
                  marks: []
                }
              ]
            }
          ]
        }
      ]
    },

    // Call to Action Section
    {
      _type: 'callToActionSection',
      _key: generateKey(),
      title: 'Tag kontrollen over dine elomkostninger i dag',
      description: 'Brug vores sammenligningsværktøj og find den leverandør der matcher dine behov',
      primaryCta: {
        text: 'Start sammenligning nu',
        href: '/'
      },
      secondaryCta: {
        text: 'Beregn din besparelse',
        href: '/#calculator'
      }
    }
  ]
}

// Deploy function
async function deployPage() {
  try {
    console.log('Deploying page:', pageContent.title)
    console.log('Slug:', pageContent.slug.current)
    
    // Use create() to let Sanity generate a unique ID
    const result = await client.create(pageContent)
    
    console.log('✅ Page deployed successfully!')
    console.log('Page ID:', result._id)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;' + result._id)
    console.log('Frontend URL will be: /' + pageContent.slug.current)
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    if (error.response) {
      console.error('Response:', error.response.body)
    }
    process.exit(1)
  }
}

// Execute deployment
deployPage()