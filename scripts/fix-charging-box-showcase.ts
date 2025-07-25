import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixChargingBoxShowcase() {
  try {
    console.log('🔧 Fixing charging box showcase component...\n')
    
    // Get current page
    const page = await client.getDocument('Ldbn1aqxfi6rpqe9dn')
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Found page:', page.title)
    
    // Find the charging box showcase component
    const showcaseIndex = page.contentBlocks.findIndex((block: any) => 
      block._type === 'chargingBoxShowcase'
    )
    
    if (showcaseIndex === -1) {
      console.error('❌ Charging box showcase not found!')
      return
    }
    
    console.log('✅ Found charging box showcase at index:', showcaseIndex)
    
    // Update the showcase with product references
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[showcaseIndex] = {
      ...updatedContentBlocks[showcaseIndex],
      products: [
        { 
          _type: 'reference', 
          _ref: 'chargingBoxProduct.easee-up',
          _key: 'ref_easee'
        },
        { 
          _type: 'reference', 
          _ref: 'chargingBoxProduct.zaptec-go',
          _key: 'ref_zaptec'
        },
        { 
          _type: 'reference', 
          _ref: 'chargingBoxProduct.defa-power',
          _key: 'ref_defa'
        }
      ]
    }
    
    // Update the page
    const updatedPage = {
      ...page,
      contentBlocks: updatedContentBlocks
    }
    
    console.log('📝 Updating page with product references...')
    const result = await client.createOrReplace(updatedPage)
    
    console.log('✅ Successfully added products to showcase!')
    console.log('📦 Products added:')
    console.log('   - Easee Up')
    console.log('   - Zaptec Go') 
    console.log('   - DEFA Power')
    
    console.log('\n🔗 View in Sanity Studio:')
    console.log('https://dinelportal.sanity.studio/structure/page;Ldbn1aqxfi6rpqe9dn')
    
  } catch (error) {
    console.error('❌ Error fixing showcase:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

fixChargingBoxShowcase()