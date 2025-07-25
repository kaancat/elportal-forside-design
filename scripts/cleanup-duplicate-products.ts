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

async function cleanupDuplicateProducts() {
  try {
    console.log('🧹 Cleaning up duplicate charging box products\n')
    
    // 1. Get all products
    console.log('1️⃣ Finding all charging box products...')
    const allProducts = await client.fetch(`*[_type == "chargingBoxProduct"]{_id, name}`)
    console.log(`   Found ${allProducts.length} products total`)
    
    // 2. Identify duplicates
    const dotsProducts = allProducts.filter((p: any) => p._id.includes('.'))
    const dashProducts = allProducts.filter((p: any) => p._id.includes('-'))
    
    console.log(`\n2️⃣ Product ID patterns:`)
    console.log(`   - With dots (.): ${dotsProducts.length} products`)
    console.log(`   - With dashes (-): ${dashProducts.length} products`)
    
    if (dotsProducts.length > 0) {
      console.log('\n3️⃣ Products with dots (to be removed):')
      dotsProducts.forEach((p: any) => console.log(`   - ${p._id}: ${p.name}`))
      
      // 3. Check if any documents reference the dot versions
      console.log('\n4️⃣ Checking for references to dot-version products...')
      for (const product of dotsProducts) {
        const refs = await client.fetch(
          `*[references($id)]{_id, _type, title}`,
          { id: product._id }
        )
        if (refs.length > 0) {
          console.log(`   ⚠️  ${product._id} is referenced by ${refs.length} documents`)
          refs.forEach((r: any) => console.log(`      - ${r._type}: ${r.title || r._id}`))
        } else {
          console.log(`   ✅ ${product._id} has no references`)
        }
      }
      
      // 4. Delete the dot versions (they're duplicates)
      console.log('\n5️⃣ Deleting duplicate products with dots...')
      for (const product of dotsProducts) {
        try {
          await client.delete(product._id)
          console.log(`   ✅ Deleted ${product._id}`)
        } catch (error) {
          console.log(`   ❌ Failed to delete ${product._id}:`, error)
        }
      }
      
      // 5. Verify cleanup
      console.log('\n6️⃣ Verifying cleanup...')
      const remaining = await client.fetch(`*[_type == "chargingBoxProduct"]{_id, name}`)
      console.log(`   Remaining products: ${remaining.length}`)
      remaining.forEach((p: any) => console.log(`   - ${p._id}: ${p.name}`))
    } else {
      console.log('\n✅ No duplicate products found!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

cleanupDuplicateProducts()