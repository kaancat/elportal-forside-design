import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
})

async function testAndFixQuery() {
  try {
    console.log('🔍 Finding the correct query structure for reference expansion\n')
    
    // Test 1: Check if we need to use different syntax for nested references
    console.log('1️⃣ Testing with @ operator for current node...')
    const query1 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          heading,
          "products": @.products[]->
        }
      }
    }`
    const result1 = await client.fetch(query1)
    const showcase1 = result1?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products:', showcase1?.products?.map((p: any) => p?.name || 'null').join(', '))
    
    // Test 2: Try with explicit reference selection
    console.log('\n2️⃣ Testing with explicit reference resolution...')
    const query2 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _type == "chargingBoxShowcase" => @ {
          _key,
          _type,
          heading,
          products[] {
            "_ref": @._ref,
            "data": *[_id == ^._ref][0]
          }
        }
      }
    }`
    const result2 = await client.fetch(query2)
    const showcase2 = result2?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Result:', JSON.stringify(showcase2?.products?.[0], null, 2))
    
    // Test 3: Two-step approach - get references first, then resolve
    console.log('\n3️⃣ Testing two-step approach...')
    const pageData = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]`)
    const showcaseBlock = pageData?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    
    if (showcaseBlock?.products) {
      console.log('   Found references:', showcaseBlock.products.map((p: any) => p._ref))
      
      // Now fetch the products
      const productIds = showcaseBlock.products.map((p: any) => p._ref)
      const productsQuery = `*[_id in $ids] {
        _id,
        name,
        description,
        originalPrice,
        currentPrice,
        badge,
        features,
        productImage,
        ctaLink,
        ctaText
      }`
      const products = await client.fetch(productsQuery, { ids: productIds })
      console.log('   Fetched products:', products.map((p: any) => p.name).join(', '))
    }
    
    // Test 4: Check if the issue is with conditional projection
    console.log('\n4️⃣ Testing without conditional projection but with type filtering...')
    const query4 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _key,
        _type,
        heading,
        headerAlignment,
        description,
        products[]->
      }
    }`
    const result4 = await client.fetch(query4)
    const showcase4 = result4?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products:', showcase4?.products?.map((p: any) => p?.name || 'null').join(', '))
    
    // Test 5: See what the actual structure is
    console.log('\n5️⃣ Checking raw block structure...')
    const rawBlock = result4?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Raw block:', JSON.stringify(rawBlock, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAndFixQuery()