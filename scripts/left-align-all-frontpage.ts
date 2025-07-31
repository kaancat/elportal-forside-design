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

async function leftAlignAllFrontpage() {
  try {
    console.log('🔧 Left-aligning all content on frontpage...\n')
    
    // Fetch both homepage documents
    const homepageIds = [
      '084518ec-2f79-48e0-b23c-add29ee83e6d',
      'drafts.084518ec-2f79-48e0-b23c-add29ee83e6d'
    ]
    
    for (const docId of homepageIds) {
      console.log(`\n📄 Processing ${docId.includes('drafts') ? 'draft' : 'published'} homepage...`)
      
      const homepage = await client.fetch(`*[_id == "${docId}"][0]`)
      
      if (!homepage) {
        console.log('   Not found, skipping...')
        continue
      }
      
      let alignmentChanges = 0
      
      // Update all content blocks
      const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
        // Handle pageSection blocks
        if (block._type === 'pageSection') {
          if (block.headerAlignment !== 'left') {
            alignmentChanges++
            console.log(`   Updating pageSection: "${block.title}" from ${block.headerAlignment || 'center'} to left`)
            return {
              ...block,
              headerAlignment: 'left'
            }
          }
        }
        
        // Handle components with headerAlignment
        const componentsWithAlignment = [
          'monthlyProductionChart',
          'renewableEnergyForecast',
          'co2EmissionsChart',
          'realPriceComparisonTable',
          'priceExampleTable',
          'infoCardsSection'
        ]
        
        if (componentsWithAlignment.includes(block._type) && block.headerAlignment !== 'left') {
          alignmentChanges++
          console.log(`   Updating ${block._type}: "${block.title || 'Untitled'}" from ${block.headerAlignment || 'center'} to left`)
          return {
            ...block,
            headerAlignment: 'left'
          }
        }
        
        // Handle valueProposition (uses alignment instead of headerAlignment)
        if (block._type === 'valueProposition' && block.alignment !== 'left') {
          alignmentChanges++
          console.log(`   Updating valueProposition from ${block.alignment || 'center'} to left`)
          return {
            ...block,
            alignment: 'left'
          }
        }
        
        // Handle hero sections
        if ((block._type === 'hero' || block._type === 'heroWithCalculator') && block.alignment !== 'left') {
          alignmentChanges++
          console.log(`   Updating ${block._type} from ${block.alignment || 'center'} to left`)
          return {
            ...block,
            alignment: 'left'
          }
        }
        
        return block
      })
      
      if (alignmentChanges > 0) {
        // Update the document
        const result = await client.patch(docId)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        
        console.log(`   ✅ Successfully updated ${alignmentChanges} sections to left alignment`)
      } else {
        console.log('   ✅ All sections already left-aligned')
      }
    }
    
    console.log('\n✅ Frontpage alignment update completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
leftAlignAllFrontpage()