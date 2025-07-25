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

async function verifyProductIds() {
  try {
    console.log('🔍 Verifying product IDs and fixing references\n')
    
    // 1. Get all products
    console.log('1️⃣ All charging box products in database:')
    const allProducts = await client.fetch(`*[_type == "chargingBoxProduct"]{_id, name}`)
    allProducts.forEach((p: any) => console.log(`   - ${p._id}: ${p.name}`))
    
    // 2. Get the page and check references
    console.log('\n2️⃣ References in the ladeboks page:')
    const page = await client.getDocument('Ldbn1aqxfi6rpqe9dn')
    const showcaseBlock = page?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    const refs = showcaseBlock?.products || []
    refs.forEach((r: any) => console.log(`   - ${r._ref}`))
    
    // 3. Try to fetch each reference directly
    console.log('\n3️⃣ Checking if references can be fetched:')
    for (const ref of refs) {
      const doc = await client.getDocument(ref._ref)
      console.log(`   - ${ref._ref}: ${doc ? `✅ Found (${doc.name})` : '❌ Not found'}`)
    }
    
    // 4. Check for ID mismatch
    console.log('\n4️⃣ Checking for ID pattern mismatch:')
    const hasDots = refs.some((r: any) => r._ref.includes('.'))
    const hasDashes = allProducts.some((p: any) => p._id.includes('-'))
    console.log(`   - References use dots: ${hasDots}`)
    console.log(`   - Products use dashes: ${hasDashes}`)
    
    if (hasDots && hasDashes) {
      console.log('\n⚠️  ID MISMATCH DETECTED!')
      console.log('   References use dots (.) but products use dashes (-)')
      
      // 5. Fix the references
      console.log('\n5️⃣ Fixing references...')
      const fixedProducts = refs.map((ref: any) => ({
        _key: ref._key,
        _type: 'reference',
        _ref: ref._ref.replace(/\./g, '-') // Replace dots with dashes
      }))
      
      console.log('   Fixed references:')
      fixedProducts.forEach((r: any) => console.log(`   - ${r._ref}`))
      
      // Update the page
      console.log('\n6️⃣ Updating the page with fixed references...')
      const updatedBlocks = page.contentBlocks.map((block: any) => {
        if (block._type === 'chargingBoxShowcase') {
          return {
            ...block,
            products: fixedProducts
          }
        }
        return block
      })
      
      const result = await client
        .patch('Ldbn1aqxfi6rpqe9dn')
        .set({ contentBlocks: updatedBlocks })
        .commit()
      
      console.log('   ✅ Page updated successfully!')
      
      // 7. Verify the fix
      console.log('\n7️⃣ Verifying the fix...')
      const query = `*[_type == "page" && slug.current == "ladeboks"][0] {
        contentBlocks[_type == "chargingBoxShowcase"]{
          products[]->{ name }
        }
      }`
      const verification = await client.fetch(query)
      const products = verification?.contentBlocks?.[0]?.products
      console.log('   Products now:', products?.map((p: any) => p?.name || 'null').join(', '))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyProductIds()