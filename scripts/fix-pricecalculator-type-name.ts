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

// Fix the type name issue
async function fixPriceCalculatorTypeName() {
  console.log('🔧 Fixing priceCalculatorWidget type name issue')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    // Fetch document
    const document = await client.getDocument(documentId)
    
    // Find and fix the type name
    const fixedContentBlocks = document.contentBlocks.map((block: any) => {
      if (block._type === 'priceCalculatorWidget') {
        console.log('✏️  Found priceCalculatorWidget, changing to priceCalculator')
        return {
          ...block,
          _type: 'priceCalculator', // Correct type name
          // Keep the same content but ensure it matches schema
          title: block.title || 'Beregn din potentielle besparelse'
        }
      }
      return block
    })
    
    // Check if we made any changes
    const hasChanges = document.contentBlocks.some((block: any, index: number) => 
      block._type !== fixedContentBlocks[index]._type
    )
    
    if (hasChanges) {
      console.log('📝 Updating document with corrected type names...')
      
      await client
        .patch(documentId)
        .set({ contentBlocks: fixedContentBlocks })
        .commit()
      
      console.log('✅ Type name fixed successfully!')
    } else {
      console.log('ℹ️  No priceCalculatorWidget found to fix')
    }
    
    console.log(`\n📌 View document: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    
  } catch (error) {
    console.error('❌ Error fixing type name:', error)
    process.exit(1)
  }
}

// Execute
fixPriceCalculatorTypeName()