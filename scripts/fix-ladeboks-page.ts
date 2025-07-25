import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from the Sanity CMS project
dotenv.config({ path: resolve(__dirname, '../../sanityelpriscms/.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

const ladeboksPage = {
  _id: 'page.ladeboks',
  _type: 'page',
  title: 'Ladeboks til Elbil - Find den Perfekte Hjemmelader',
  slug: {
    _type: 'slug',
    current: 'ladeboks'
  },
  // CORRECT: Flat SEO fields, not nested
  seoMetaTitle: 'Ladeboks til Elbil | Sammenlign Priser på Hjemmeladere 2025',
  seoMetaDescription: 'Find den perfekte ladeboks til din elbil. Vi sammenligner priser og funktioner på de bedste hjemmeladere fra DEFA, Easee og Zaptec. Få professionel rådgivning.',
  seoKeywords: [
    'ladeboks',
    'elbil lader',
    'hjemmelader',
    'elbil opladning',
    'ladeboks pris',
    'ladeboks installation',
    'DEFA Power',
    'Easee ladeboks',
    'Zaptec Go'
  ],
  // CORRECT: Use contentBlocks, not sections
  contentBlocks: [
    // Hero Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Find den Perfekte Ladeboks til Din Elbil',
      subheading: 'Sammenlign priser og funktioner på Danmarks bedste hjemmeladere',
      headerAlignment: 'center',
      components: [
        {
          _type: 'hero',
          _key: generateKey(),
          heading: 'Ladeboks til Elbil - Professionel Installation',
          subheading: 'Vi hjælper dig med at finde den rigtige ladeløsning til dit hjem',
          ctaText: 'Se Ladebokse',
          ctaUrl: '#products',
          backgroundType: 'gradient',
          gradientStart: '#1e40af',
          gradientEnd: '#3b82f6'
        }
      ]
    },
    // Product Grid Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Vores Udvalg af Ladebokse',
      subheading: 'Vi har nøje udvalgt de bedste ladebokse på markedet',
      headerAlignment: 'center',
      components: [
        {
          _type: 'chargingBoxProductGrid',
          _key: generateKey(),
          heading: 'Sammenlign Ladebokse',
          description: 'Alle priser er inkl. moms og standard installation',
          products: [
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.defa-power',
              _key: generateKey()
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.easee-up',
              _key: generateKey()
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.zaptec-go',
              _key: generateKey()
            }
          ]
        }
      ]
    },
    // Benefits Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Derfor Skal Du Vælge en Ladeboks',
      headerAlignment: 'center',
      components: [
        {
          _type: 'infoBox',
          _key: generateKey(),
          title: 'Fordelene ved en Hjemmelader',
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Med en ladeboks derhjemme får du:',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Op til 10x hurtigere opladning end almindelig stikkontakt',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Fuld kontrol over dit strømforbrug via app',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Mulighed for at lade når strømmen er billigst',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Sikker og vejrbestandig løsning',
                  marks: []
                }
              ],
              markDefs: []
            }
          ],
          backgroundColor: '#eff6ff',
          borderColor: '#3b82f6',
          icon: 'lightbulb'
        }
      ]
    },
    // Installation Process Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Sådan Foregår Installationen',
      headerAlignment: 'center',
      components: [
        {
          _type: 'textBlock',
          _key: generateKey(),
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Fra Bestilling til Færdig Installation',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Vi sørger for hele processen, så du kan være sikker på at få en professionel installation:',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'number',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Gratis besigtigelse og rådgivning',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ' - Vi kommer ud og vurderer dine behov og muligheder',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'number',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Fast tilbud uden skjulte omkostninger',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ' - Du ved præcis hvad det koster',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'number',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Autoriseret elinstallatør',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ' - Sikker og lovlig installation',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              listItem: 'number',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Support og service',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ' - Vi hjælper dig med opsætning og eventuelle spørgsmål',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        }
      ]
    },
    // FAQ Section
    {
      _type: 'faqGroup',
      _key: generateKey(),
      heading: 'Ofte Stillede Spørgsmål om Ladebokse',
      questions: [
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor hurtigt lader en ladeboks min elbil op?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'En ladeboks med 11 kW effekt kan typisk lade en elbil op med 50-70 km rækkevidde per time. Det betyder at en gennemsnitlig elbil kan lades helt op på 6-8 timer natten over.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Skal jeg have 1-faset eller 3-faset installation?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'De fleste moderne elbiler udnytter 3-faset strøm, som giver op til 11 kW ladeeffekt. 1-faset giver maksimalt 3,7 kW. Vi anbefaler derfor 3-faset installation for fremtidssikring.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Kan jeg få tilskud til min ladeboks?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Ja, boligejere kan få op til 3.125 kr. i tilskud gennem Bygningspuljen. Derudover giver mange kommuner lokale tilskud. Vi hjælper dig med ansøgningen.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor skal ladeboksen placeres?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Ladeboksen monteres typisk på husmuren tæt på hvor du parkerer, eller på en fritstående stolpe. Den skal placeres så ladekablet nemt kan nå din bil. Vi rådgiver om den optimale placering ved besigtigelsen.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        }
      ]
    },
    // CTA Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      components: [
        {
          _type: 'ctaBlock',
          _key: generateKey(),
          heading: 'Klar til at Få en Ladeboks?',
          description: 'Vi hjælper dig hele vejen - fra rådgivning til færdig installation',
          buttonText: 'Kontakt Os for Gratis Rådgivning',
          buttonUrl: '/kontakt',
          backgroundColor: '#1e40af',
          textColor: '#ffffff'
        }
      ]
    }
  ]
}

async function fixLadeboksPage() {
  try {
    console.log('🔧 Fixing Ladeboks page in Sanity...')
    
    // Step 1: Delete the broken page
    console.log('🗑️  Deleting broken page...')
    try {
      await client.delete('page.ladeboks')
      console.log('✅ Deleted broken page')
    } catch (error) {
      console.log('⚠️  Page might not exist, continuing...')
    }
    
    // Step 2: Create the page with correct structure
    console.log('📝 Creating page with correct schema...')
    const result = await client.create(ladeboksPage)
    
    console.log('✅ Successfully fixed Ladeboks page!')
    console.log('📄 Page ID:', result._id)
    console.log('🔗 View at: https://dinelportal.dk/ladeboks')
    console.log('\n📋 Page structure:')
    console.log('   - Title:', result.title)
    console.log('   - Slug:', result.slug.current)
    console.log('   - SEO Title:', result.seoMetaTitle)
    console.log('   - SEO Description:', result.seoMetaDescription)
    console.log('   - Keywords:', result.seoKeywords?.join(', '))
    console.log('   - Content blocks:', result.contentBlocks?.length || 0)
    
  } catch (error) {
    console.error('❌ Error fixing page:', error)
    if (error.response) {
      const errorText = await error.response.text()
      console.error('Response:', errorText)
      
      // Parse and display validation errors
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.items) {
          console.error('\n🔍 Validation errors:')
          errorData.error.items.forEach((item, index) => {
            console.error(`   ${index + 1}. ${item.error.description}`)
            if (item.error.type) {
              console.error(`      Type: ${item.error.type}`)
            }
          })
        }
      } catch (e) {
        // If not JSON, display as is
      }
    }
  }
}

// Run the fix
fixLadeboksPage()