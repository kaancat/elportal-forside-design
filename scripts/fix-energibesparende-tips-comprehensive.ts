import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use the token from environment variable or command line argument
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.argv[2]

if (!SANITY_TOKEN) {
  console.error('❌ Error: No Sanity API token provided!')
  console.error('Usage: npm run ts-node scripts/fix-energibesparende-tips-comprehensive.ts YOUR_TOKEN')
  console.error('Or set SANITY_API_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: SANITY_TOKEN
})

async function fetchAndFixPage() {
  try {
    console.log('Fetching energibesparende-tips page...')
    
    // Fetch the current page
    const query = `*[_type == "page" && slug.current == "energibesparende-tips"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Page not found!')
      return
    }

    console.log('Current page structure:', JSON.stringify(page, null, 2))
    
    // Process and fix content blocks
    const fixedContentBlocks = page.contentBlocks.map((block: any) => {
      // Fix pageSection with headerAlignment
      if (block._type === 'pageSection') {
        // Section 1: "Når Dine Vaner Ikke Er Nok"
        if (block.title?.includes('Når Dine Vaner Ikke Er Nok')) {
          return {
            ...block,
            headerAlignment: 'left' // Fix alignment
          }
        }
        
        // Section 2: "Det Sidste, Vigtige Skridt"
        if (block.title?.includes('Det Sidste, Vigtige Skridt')) {
          return {
            ...block,
            headerAlignment: 'left' // Fix alignment
          }
        }
        
        // Fix embedded livePriceGraph if it exists in content
        if (block.content && Array.isArray(block.content)) {
          block.content = block.content.map((contentItem: any) => {
            if (contentItem._type === 'livePriceGraph' && !contentItem.apiRegion) {
              return {
                ...contentItem,
                apiRegion: 'DK1' // Add required priceArea
              }
            }
            return contentItem
          })
        }
        
        return block
      }
      
      // Fix standalone livePriceGraph
      if (block._type === 'livePriceGraph' && !block.apiRegion) {
        return {
          ...block,
          apiRegion: 'DK1' // Add required priceArea
        }
      }
      
      // Fix renewableEnergyForecast - add descriptive subtext
      if (block._type === 'renewableEnergyForecast') {
        return {
          ...block,
          title: block.title || 'Grøn Energi Prognose',
          leadingText: block.leadingText || 'Se hvordan vindmøller og solceller forventes at bidrage til Danmarks elproduktion i de kommende timer. Høj grøn energi betyder ofte lavere elpriser.'
        }
      }
      
      // Fix valueProposition - migrate from deprecated fields
      if (block._type === 'valueProposition') {
        // Remove invalid fields and ensure correct structure
        const fixedBlock: any = {
          _type: block._type,
          _key: block._key,
          heading: block.heading || block.title || 'Value Proposition',
          subheading: block.subheading,
          content: block.content
        }
        
        // Migrate items to valueItems if needed
        if (block.items || block.values || block.valueItems || block.features) {
          const sourceItems = block.valueItems || block.items || block.values || block.features || []
          fixedBlock.valueItems = sourceItems.map((item: any) => ({
            _type: 'valueItem',
            _key: item._key || generateKey(),
            heading: item.heading || item.title || item.name || 'Value Item',
            description: item.description || item.text || item.content || 'Description',
            icon: item.icon || null
          }))
        }
        
        // Remove all invalid/deprecated fields
        delete fixedBlock.title // deprecated
        delete fixedBlock.items // deprecated
        delete fixedBlock.propositions // deprecated
        delete fixedBlock.description // not in schema
        delete fixedBlock.features // not in schema
        delete fixedBlock.headerAlignment // not in schema
        delete fixedBlock.values // not in schema
        
        return fixedBlock
      }
      
      return block
    })

    // Update the page
    const updatedPage = {
      ...page,
      contentBlocks: fixedContentBlocks
    }

    console.log('\nFixed page structure:', JSON.stringify(updatedPage, null, 2))
    
    console.log('\nUpdating page in Sanity...')
    const result = await client.createOrReplace(updatedPage)
    
    console.log('✅ Page updated successfully!')
    console.log('Page ID:', result._id)
    
    // Summary of fixes
    console.log('\n📋 Summary of fixes applied:')
    console.log('1. ✅ Set headerAlignment to "left" for two pageSections')
    console.log('2. ✅ Added apiRegion: "DK1" to livePriceGraph')
    console.log('3. ✅ Added descriptive leadingText to renewableEnergyForecast')
    console.log('4. ✅ Migrated valueProposition from deprecated fields to correct schema')
    console.log('5. ✅ Removed all invalid fields from valueProposition')
    
  } catch (error) {
    console.error('Error fixing page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack:', error.stack)
    }
  }
}

function generateKey() {
  return Math.random().toString(36).substring(2, 11)
}

// Run the fix
fetchAndFixPage()