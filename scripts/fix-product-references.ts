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

async function fixProductReferences() {
  try {
    console.log('🔧 Fixing charging box product references...\n')
    
    // 1. Get all charging box products
    console.log('1️⃣ Getting all charging box products...')
    const products = await client.fetch(`*[_type == "chargingBoxProduct"]{_id, name}`)
    console.log('Available products:')
    products.forEach((p: any) => console.log(`   - ${p._id}: ${p.name}`))
    
    // 2. Get the page
    console.log('\n2️⃣ Getting ladeboks page...')
    const page = await client.getDocument('Ldbn1aqxfi6rpqe9dn')
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    // 3. Find showcase block
    const showcaseIndex = page.contentBlocks.findIndex((b: any) => b._type === 'chargingBoxShowcase')
    if (showcaseIndex === -1) {
      console.error('❌ Showcase block not found!')
      return
    }
    
    const showcaseBlock = page.contentBlocks[showcaseIndex]
    console.log('\n3️⃣ Current references in showcase:')
    showcaseBlock.products?.forEach((ref: any) => {
      console.log(`   - ${ref._ref}`)
    })
    
    // 4. Map old references to new ones
    console.log('\n4️⃣ Mapping references...')
    const referenceMap: Record<string, string> = {
      'chargingBoxProduct.easee-up': 'chargingBoxProduct-easee-up',
      'chargingBoxProduct.zaptec-go': 'chargingBoxProduct-zaptec-go',
      'chargingBoxProduct.defa-power': 'chargingBoxProduct-defa-power'
    }
    
    // 5. Update references
    const updatedProducts = showcaseBlock.products.map((ref: any) => {
      const newRef = referenceMap[ref._ref]
      if (newRef) {
        console.log(`   Updating ${ref._ref} → ${newRef}`)
        return { ...ref, _ref: newRef }
      }
      return ref
    })
    
    // 6. Update the page
    console.log('\n5️⃣ Updating page...')
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[showcaseIndex] = {
      ...showcaseBlock,
      products: updatedProducts
    }
    
    const result = await client.createOrReplace({
      ...page,
      contentBlocks: updatedContentBlocks
    })
    
    console.log('\n✅ Successfully updated product references!')
    console.log('🔍 View in Sanity Studio:')
    console.log('https://dinelportal.sanity.studio/structure/page;Ldbn1aqxfi6rpqe9dn')
    
    // 7. Verify the fix
    console.log('\n6️⃣ Verifying fix...')
    const verifyQuery = `*[_id == "Ldbn1aqxfi6rpqe9dn"][0] {
      contentBlocks[_type == "chargingBoxShowcase"][0] {
        products[]->{
          _id,
          name,
          currentPrice
        }
      }
    }`
    const verification = await client.fetch(verifyQuery)
    console.log('Expanded products:', verification?.contentBlocks?.products)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixProductReferences()