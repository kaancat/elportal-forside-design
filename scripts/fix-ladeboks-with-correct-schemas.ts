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

/**
 * This script demonstrates the CORRECT way to create pages
 * by using the ACTUAL field names from Sanity schemas
 */
async function fixLadeboksPage() {
  try {
    console.log('Fixing Ladeboks page with correct field names...')
    
    // CORRECT field names based on actual schemas:
    const correctedPage = {
      _id: 'page.ladeboks',
      _type: 'page',
      title: 'Ladeboks til Elbil - Find den Bedste Hjemmelader',
      slug: {
        _type: 'slug',
        current: 'ladeboks'
      },
      seoMetaTitle: 'Ladeboks til Elbil 2025 - Sammenlign Priser & Modeller',
      seoMetaDescription: 'Find den perfekte ladeboks til din elbil. Vi sammenligner Easee, Zaptec, DEFA og andre populære ladeløsninger. Se priser, funktioner og få gratis installationstilbud.',
      seoKeywords: [
        'ladeboks',
        'elbil lader',
        'hjemmelader',
        'ladeboks pris',
        'easee up',
        'zaptec go',
        'defa power',
        'elbil opladning hjemme',
        'ladeboks installation',
        'bedste ladeboks'
      ],
      contentBlocks: [
        // Hero - CORRECT fields: headline, subheadline (NO cta fields!)
        {
          _type: 'hero',
          _key: 'hero-ladeboks',
          headline: 'Find den Perfekte Ladeboks til Din Elbil',
          subheadline: 'Sammenlign Danmarks mest populære ladeløsninger og få det bedste tilbud på installation'
          // NO ctaText or ctaLink - these fields don't exist in hero schema!
        },

        // Page Section - CORRECT fields: title (not heading)
        {
          _type: 'pageSection',
          _key: 'intro-section',
          title: 'Hvorfor Investere i en Hjemmelader?',
          headerAlignment: 'center',
          content: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Med en ladeboks derhjemme får du fuld kontrol over din elbils opladning. Du kan lade op om natten når strømmen er billigst, spare tid på ikke at skulle køre til offentlige ladere, og øge værdien af din bolig.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'En hjemmelader giver dig mulighed for at udnytte spotpriser på el, integrere med solceller, og sikre optimal opladning tilpasset din elbils behov. Med smart styring kan du spare op til 50% på dine ladeomkostninger sammenlignet med offentlig ladning.'
                }
              ]
            }
          ]
        },

        // Charging Box Showcase - This one correctly uses 'heading'
        {
          _type: 'chargingBoxShowcase',
          _key: 'ladeboks-showcase',
          heading: 'Populære Ladebokse til Hjemmet',
          headerAlignment: 'center',
          description: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Vi har samlet Danmarks mest populære og pålidelige ladebokse. Alle modeller er testet og godkendt til danske forhold.'
                }
              ]
            }
          ],
          products: [
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct-easee-up',
              _key: 'ref-easee'
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct-zaptec-go',
              _key: 'ref-zaptec'
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct-defa-power',
              _key: 'ref-defa'
            }
          ]
        },

        // Value Proposition - CORRECT fields: title, items (not heading, values)
        {
          _type: 'valueProposition',
          _key: 'benefits-section',
          title: 'Fordele ved Hjemmeopladning',
          // NO headerAlignment - this field doesn't exist in valueProposition!
          items: [  // CORRECT: 'items' not 'values'
            {
              _type: 'valueItem',
              _key: 'benefit-1',
              icon: 'CheckCircle',
              heading: 'Spar op til 50% på ladning',
              description: 'Udnyt billige nattetimer og spotpriser'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-2',
              icon: 'Home',
              heading: 'Bekvemmelighed',
              description: 'Lad op mens du sover - klar hver morgen'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-3',
              icon: 'Zap',
              heading: 'Hurtig opladning',
              description: 'Op til 22 kW med 3-faset installation'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-4',
              icon: 'Sun',
              heading: 'Solcelle integration',
              description: 'Lad op med din egen grønne energi'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-5',
              icon: 'Shield',
              heading: 'Øget boligværdi',
              description: 'En moderne ladeboks øger husets værdi'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-6',
              icon: 'Phone',
              heading: 'Smart styring',
              description: 'Kontroller alt fra din smartphone'
            }
          ]
        },

        // Live Price Graph - CORRECT fields: title, subtitle, apiRegion
        {
          _type: 'livePriceGraph',
          _key: 'price-graph',
          title: 'Udnyt Lave Elpriser til Opladning',
          subtitle: 'Smart opladning giver dig mulighed for automatisk at lade når elpriserne er lavest',
          apiRegion: 'DK1',  // CORRECT: not 'priceArea'
          headerAlignment: 'center'
          // NO showPriceBreakdown, showRegionSelector, defaultView - these don't exist!
        },

        // FAQ Group - CORRECT fields: title, faqItems
        {
          _type: 'faqGroup',
          _key: 'faq-section',
          title: 'Ofte Stillede Spørgsmål om Ladebokse',
          // NO headerAlignment - doesn't exist in faqGroup!
          faqItems: [  // CORRECT: 'faqItems' not 'faqs'
            {
              _type: 'faqItem',
              _key: 'faq-1',
              question: 'Hvor meget koster det at installere en ladeboks?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Den samlede pris for ladeboks med installation ligger typisk mellem 10.000-20.000 kr. Selve ladeboksen koster 5.000-10.000 kr, mens installation varierer fra 5.000-10.000 kr afhængigt af kompleksitet.'
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: 'faq-2',
              question: 'Kan jeg få tilskud til min ladeboks?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Ja, flere kommuner og boligforeninger tilbyder tilskud til installation af ladebokse. Tjek med din kommune om lokale tilskudsordninger.'
                    }
                  ]
                }
              ]
            }
          ]
        },

        // Call to Action - CORRECT fields: title, buttonText, buttonUrl
        {
          _type: 'callToActionSection',
          _key: 'cta-section',
          title: 'Klar til at Installere Din Ladeboks?',
          buttonText: 'Få tilbud nu',
          buttonUrl: '/kontakt'
          // NO description, primaryCta, secondaryCta, variant - these don't exist!
        }
      ]
    }

    const result = await client.createOrReplace(correctedPage)
    console.log('Ladeboks page fixed successfully!')
    console.log('Page ID:', result._id)
    console.log('View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.ladeboks')

  } catch (error) {
    console.error('Error fixing Ladeboks page:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

// Run the fix
fixLadeboksPage()