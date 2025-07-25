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

const ladeboksPage = {
  _id: 'page.ladeboks',
  _type: 'page',
  title: 'Ladeboks til Elbil - Find den Perfekte Hjemmelader',
  slug: {
    _type: 'slug',
    current: 'ladeboks'
  },
  metaTitle: 'Ladeboks til Elbil | Sammenlign Priser på Hjemmeladere 2025',
  metaDescription: 'Find den perfekte ladeboks til din elbil. Vi sammenligner priser og funktioner på de bedste hjemmeladere fra DEFA, Easee og Zaptec. Få professionel rådgivning.',
  contentBlocks: [
    // Hero Section
    {
      _type: 'pageSection',
      _key: 'hero-section',
      heading: 'Find den Perfekte Ladeboks til Din Elbil',
      subheading: 'Sammenlign priser og funktioner på Danmarks bedste hjemmeladere',
      components: [
        {
          _type: 'hero',
          _key: 'main-hero',
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
      _key: 'product-section',
      heading: 'Vores Udvalg af Ladebokse',
      subheading: 'Vi har nøje udvalgt de bedste ladebokse på markedet',
      headerAlignment: 'center',
      components: [
        {
          _type: 'chargingBoxProductGrid',
          _key: 'product-grid',
          heading: 'Sammenlign Ladebokse',
          description: 'Alle priser er inkl. moms og standard installation',
          products: [
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.defa-power',
              _key: 'defa-ref'
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.easee-up',
              _key: 'easee-ref'
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.zaptec-go',
              _key: 'zaptec-ref'
            }
          ]
        }
      ]
    },
    // Benefits Section
    {
      _type: 'pageSection',
      _key: 'benefits-section',
      heading: 'Derfor Skal Du Vælge en Ladeboks',
      headerAlignment: 'center',
      components: [
        {
          _type: 'infoBox',
          _key: 'benefits-box',
          title: 'Fordelene ved en Hjemmelader',
          content: [
            {
              _type: 'block',
              _key: 'para1',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 'span1',
                  text: 'Med en ladeboks derhjemme får du:',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: 'list1',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'item1',
                  text: 'Op til 10x hurtigere opladning end almindelig stikkontakt',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: 'list2',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'item2',
                  text: 'Fuld kontrol over dit strømforbrug via app',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: 'list3',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'item3',
                  text: 'Mulighed for at lade når strømmen er billigst',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: 'list4',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'item4',
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
    // CTA Section
    {
      _type: 'pageSection',
      _key: 'cta-section',
      components: [
        {
          _type: 'ctaBlock',
          _key: 'contact-cta',
          heading: 'Klar til at Få en Ladeboks?',
          description: 'Vi hjælper dig hele vejen - fra rådgivning til færdig installation',
          buttonText: 'Kontakt Os',
          buttonUrl: '/kontakt',
          backgroundColor: '#1e40af',
          textColor: '#ffffff'
        }
      ]
    }
  ]
}

async function deployLadeboksPage() {
  try {
    console.log('🚀 Deploying Ladeboks page to Sanity...')
    
    const result = await client.createOrReplace(ladeboksPage)
    
    console.log('✅ Successfully deployed Ladeboks page!')
    console.log('📄 Page ID:', result._id)
    console.log('🔗 View at: https://dinelportal.dk/ladeboks')
    
  } catch (error) {
    console.error('❌ Error deploying page:', error)
    if (error.response) {
      console.error('Response:', await error.response.text())
    }
  }
}

// Run deployment
deployLadeboksPage()