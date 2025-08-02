import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

interface ContentBlockWithAlignment {
  _key: string
  _type: string
  headerAlignment?: string | null
  content?: Array<{
    _type: string
    headerAlignment?: string | null
  }>
}

// Components that support headerAlignment
const COMPONENTS_WITH_ALIGNMENT = [
  'pageSection',
  'livePriceGraph',
  'renewableEnergyForecast',
  'monthlyProductionChart',
  'co2EmissionsChart',
  'declarationProduction',
  'declarationGridmix',
  'consumptionMap',
  'providerList',
  'infoCardsSection',
  'chargingBoxShowcase',
  'pricingComparison',
  'dailyPriceTimeline',
  'energyTipsSection',
  'regionalComparison'
]

async function updateHomepageAlignment() {
  try {
    console.log('🔄 Fetching homepage content...')
    
    // First, fetch the current homepage
    const homepage = await client.fetch(`
      *[_type == "page" && isHomepage == true][0]{
        _id,
        _rev,
        title,
        contentBlocks[]
      }
    `)

    if (!homepage) {
      throw new Error('Homepage not found!')
    }

    console.log(`📄 Found homepage: "${homepage.title}"`)
    console.log(`📦 Processing ${homepage.contentBlocks?.length || 0} content blocks...`)

    // Process content blocks to update alignment
    const updatedContentBlocks = homepage.contentBlocks?.map((block: ContentBlockWithAlignment) => {
      const updatedBlock = { ...block }
      
      // Check if this component type supports headerAlignment
      if (COMPONENTS_WITH_ALIGNMENT.includes(block._type)) {
        console.log(`   ✏️  Updating ${block._type} (${block._key}) alignment to 'left'`)
        updatedBlock.headerAlignment = 'left'
        
        // Special handling for pageSection which has nested content
        if (block._type === 'pageSection' && block.content) {
          updatedBlock.content = block.content.map(contentItem => {
            if (COMPONENTS_WITH_ALIGNMENT.includes(contentItem._type)) {
              console.log(`      📝 Updating nested ${contentItem._type} alignment to 'left'`)
              return {
                ...contentItem,
                headerAlignment: 'left'
              }
            }
            return contentItem
          })
        }
      } else {
        console.log(`   ⏭️  Skipping ${block._type} (no alignment support)`)
      }
      
      return updatedBlock
    }) || []

    // Update the homepage document
    console.log('\n🚀 Updating homepage in Sanity...')
    
    const result = await client
      .patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Homepage alignment successfully updated!')
    console.log(`📋 Updated document revision: ${result._rev}`)
    
    // Summary of changes
    const componentsUpdated = updatedContentBlocks.filter(block => 
      COMPONENTS_WITH_ALIGNMENT.includes(block._type)
    ).length
    
    console.log(`\n📊 Summary:`)
    console.log(`   - Total blocks processed: ${updatedContentBlocks.length}`)
    console.log(`   - Components with alignment updated: ${componentsUpdated}`)
    console.log(`   - All alignment values set to: 'left'`)

  } catch (error) {
    console.error('❌ Error updating homepage alignment:', error)
    process.exit(1)
  }
}

// Run the update
updateHomepageAlignment()

export default updateHomepageAlignment