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

async function createForbrugTrackerPage() {
  console.log('Creating Forbrug Tracker page...')

  const pageContent = {
    _type: 'page',
    title: 'Forbrug Tracker',
    slug: {
      _type: 'slug',
      current: 'forbrug-tracker'
    },
    seo: {
      _type: 'seo',
      metaTitle: 'Forbrug Tracker - Se Dit Faktiske Elforbrug | DinElPortal',
      metaDescription: 'Forbind med Eloverblik og se dit faktiske elforbrug, præcise omkostninger og potentielle besparelser hos forskellige elleverandører.',
      keywords: 'elforbrug, eloverblik, forbrugsdata, elpriser, besparelser, strømforbrug tracker'
    },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero-forbrug-tracker',
        headline: 'Din Personlige Forbrug Tracker',
        subheadline: 'Se dit faktiske elforbrug og præcise omkostninger',
        cta: {
          _type: 'cta',
          text: 'Forbind med Eloverblik',
          link: '#connect',
          style: 'primary'
        }
      },
      {
        _type: 'pageSection',
        _key: 'intro-section',
        title: 'Få Fuld Kontrol Over Dit Elforbrug',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: 'intro-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Med DinElPortals Forbrug Tracker får du direkte adgang til dine forbrugsdata fra Eloverblik. Se præcis hvor meget strøm du bruger, hvornår du bruger den, og hvad det koster dig.',
                marks: []
              }
            ]
          }
        ],
        settings: {
          _type: 'sectionSettings',
          backgroundColor: 'white',
          textColor: 'dark',
          paddingTop: 'large',
          paddingBottom: 'large'
        }
      },
      {
        _type: 'valueProposition',
        _key: 'benefits',
        heading: 'Hvorfor Bruge Forbrug Tracker?',
        valueItems: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            icon: {
              _type: 'icon',
              name: 'ChartBar',
              provider: 'lucide'
            },
            title: 'Faktiske Data',
            description: 'Se dit reelle forbrug time for time - ikke bare estimater'
          },
          {
            _type: 'valueItem',
            _key: 'vi2',
            icon: {
              _type: 'icon',
              name: 'Calculator',
              provider: 'lucide'
            },
            title: 'Præcise Omkostninger',
            description: 'Beregn dine faktiske elomkostninger baseret på dit forbrug'
          },
          {
            _type: 'valueItem',
            _key: 'vi3',
            icon: {
              _type: 'icon',
              name: 'TrendingDown',
              provider: 'lucide'
            },
            title: 'Find Besparelser',
            description: 'Se præcis hvor meget du kan spare hos forskellige leverandører'
          },
          {
            _type: 'valueItem',
            _key: 'vi4',
            icon: {
              _type: 'icon',
              name: 'Shield',
              provider: 'lucide'
            },
            title: '100% Sikkert',
            description: 'Dine data gemmes aldrig - alt hentes direkte fra Eloverblik'
          }
        ]
      },
      {
        _type: 'pageSection',
        _key: 'how-it-works',
        title: 'Sådan Fungerer Det',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: 'how-1',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: '1. Forbind med Eloverblik',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-2',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Klik på "Forbind med Eloverblik" og log ind med MitID for at give DinElPortal adgang til dine forbrugsdata.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-3',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: '2. Se Dit Forbrug',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-4',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Få øjeblikkelig adgang til dine forbrugsdata med detaljerede grafer og analyser.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-5',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: '3. Find Besparelser',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-6',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Se præcis hvor meget du ville have betalt hos forskellige elleverandører baseret på dit faktiske forbrug.',
                marks: []
              }
            ]
          }
        ],
        settings: {
          _type: 'sectionSettings',
          backgroundColor: 'lightGray'
        }
      },
      {
        _type: 'forbrugTracker',
        _key: 'forbrug-tracker-widget',
        title: 'Start Din Forbrug Tracker',
        description: 'Forbind med Eloverblik for at se dine personlige forbrugsdata'
      },
      {
        _type: 'faqGroup',
        _key: 'faq',
        title: 'Ofte Stillede Spørgsmål',
        faqItems: [
          {
            _type: 'faqItem',
            _key: 'faq1',
            question: 'Er mine data sikre?',
            answer: 'Ja, absolut. Vi gemmer aldrig dine forbrugsdata. Alt hentes direkte fra Eloverblik når du beder om det, og forbindelsen lukkes automatisk efter 30 minutter.'
          },
          {
            _type: 'faqItem',
            _key: 'faq2',
            question: 'Hvordan giver jeg DinElPortal adgang?',
            answer: 'Du logger ind med MitID på Eloverblik og godkender at mondaybrew ApS (DinElPortal) må se dine forbrugsdata. Du kan til enhver tid trække tilladelsen tilbage.'
          },
          {
            _type: 'faqItem',
            _key: 'faq3',
            question: 'Hvilke data kan jeg se?',
            answer: 'Du kan se dit timeforbrug, dagsforbrug, månedsforbrug og årsforbrug. Vi viser også dine omkostninger og potentielle besparelser hos forskellige leverandører.'
          },
          {
            _type: 'faqItem',
            _key: 'faq4',
            question: 'Koster det noget?',
            answer: 'Nej, Forbrug Tracker er helt gratis at bruge. Vi tjener penge når du vælger at skifte elleverandør gennem os.'
          }
        ]
      }
    ]
  }

  try {
    const result = await client.create(pageContent)
    console.log('✅ Forbrug Tracker page created successfully!')
    console.log(`   ID: ${result._id}`)
    console.log(`   Slug: /forbrug-tracker`)
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;${result._id}`)
    return result
  } catch (error) {
    console.error('❌ Failed to create page:', error)
    throw error
  }
}

// Run the script
createForbrugTrackerPage()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })