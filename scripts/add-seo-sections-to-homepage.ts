import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey() {
  return Math.random().toString(36).substring(2, 15)
}

// This function will be called by the SEO agent to add sections 6-11
async function addSeoSectionsToHomepage() {
  try {
    console.log('Adding SEO sections to homepage...')
    
    // First, fetch the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Define sections 6-11 that need SEO content
    const seoSections = [
      // Section 6: Elpriser Overview Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Aktuelle elpriser i Danmark',
        headerAlignment: 'center',
        content: [
          // SEO agent will populate this with rich content about electricity prices
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '[SEO AGENT: Generate comprehensive Danish content about electricity prices, market dynamics, and savings potential. Include internal link to /elpriser]',
                marks: []
              }
            ],
            markDefs: []
          }
        ]
      },
      // Add ProviderList component after the text
      {
        _type: 'providerList',
        _key: generateKey(),
        title: 'Sammenlign elselskaber',
        subtitle: 'Find det bedste tilbud baseret på dit forbrug',
        headerAlignment: 'center'
      },
      
      // Section 7: Elselskaber Overview Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Etablerede elselskaber på det danske marked',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Vi har samlet de største elselskaber på markedet og som også har været på markedet længst.',
                marks: ['strong']
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
                text: '[SEO AGENT: Expand on why we focus on established providers, market liberalization history, and stability. Include internal link to /elselskaber]',
                marks: []
              }
            ],
            markDefs: []
          }
        ]
      },
      
      // Section 8: Video
      {
        _type: 'videoSection',
        _key: generateKey(),
        title: 'Se hvordan ElPortal fungerer',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Placeholder - replace with actual video
      },
      
      // Section 9: Live Spot Prices
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Dagens spotpriser',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '[SEO AGENT: Generate content about spot prices, how they work, data from Energinet, and consumer benefits]',
                marks: []
              }
            ],
            markDefs: []
          },
          {
            _type: 'livePriceGraph',
            _key: generateKey(),
            title: 'Aktuelle elpriser i dag',
            subtitle: 'Data hentet direkte fra Energinet',
            apiRegion: 'DK1',
            headerAlignment: 'center'
          }
        ]
      },
      
      // Section 10: Appliance Electricity Calculator
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Beregn dit elforbrug',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '[SEO AGENT: Generate content about calculating electricity costs for household appliances. Include internal link to /prisberegner]',
                marks: []
              }
            ],
            markDefs: []
          }
        ]
      },
      {
        _type: 'applianceCalculator',
        _key: generateKey(),
        title: 'Beregn dine apparaters elforbrug',
        subtitle: 'Find ud af hvad dine apparater koster i strøm'
      },
      
      // Section 11: Ladeboks (EV Charging)
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Ladeboks til elbil',
        headerAlignment: 'center',
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '[SEO AGENT: Generate comprehensive content about EV charging boxes, installation, rebates, and benefits. Include internal link to /ladeboks]',
                marks: []
              }
            ],
            markDefs: []
          }
        ]
      }
    ]
    
    // Append new sections to existing content blocks
    const updatedContentBlocks = [...(homepage.contentBlocks || []), ...seoSections]
    
    // Update the homepage with new sections
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('SEO sections added successfully!')
    console.log('Total content blocks:', result.contentBlocks.length)
    
    console.log('\nSections that need SEO content:')
    console.log('- Section 6: Elpriser Overview (link to /elpriser)')
    console.log('- Section 7: Elselskaber Overview (link to /elselskaber)')
    console.log('- Section 9: Live Spot Prices explanation')
    console.log('- Section 10: Appliance Calculator explanation (link to /prisberegner)')
    console.log('- Section 11: Ladeboks/EV Charging (link to /ladeboks)')
    
  } catch (error) {
    console.error('Error adding SEO sections:', error)
  }
}

// Export for use by SEO agent
export { addSeoSectionsToHomepage }

// If running directly
if (require.main === module) {
  addSeoSectionsToHomepage()
}