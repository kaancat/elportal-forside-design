import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function testReferenceExpansion() {
  try {
    console.log('🔍 Testing reference expansion patterns...\n')
    
    // Test 1: Direct document fetch
    console.log('1️⃣ Direct product fetch...')
    const directProduct = await client.getDocument('chargingBoxProduct.easee-up')
    console.log('   Direct fetch result:', directProduct ? `✅ ${directProduct.name}` : '❌ Not found')
    
    // Test 2: Simple reference expansion
    console.log('\n2️⃣ Simple reference expansion...')
    const simpleQuery = `*[_id == "Ldbn1aqxfi6rpqe9dn"][0] {
      contentBlocks[_type == "chargingBoxShowcase"][0] {
        products[]->{
          _id,
          name
        }
      }
    }`
    const simpleResult = await client.fetch(simpleQuery)
    console.log('   Simple expansion:', simpleResult?.contentBlocks?.products)
    
    // Test 3: Reference expansion with filter
    console.log('\n3️⃣ Reference expansion inside filtered array...')
    const filteredQuery = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[_type == "chargingBoxShowcase"] {
        products[]->{
          _id,
          name
        }
      }
    }`
    const filteredResult = await client.fetch(filteredQuery)
    console.log('   Filtered result:', filteredResult?.contentBlocks)
    
    // Test 4: Full content blocks with spread
    console.log('\n4️⃣ Full contentBlocks with spread operator...')
    const spreadQuery = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        ...,
        _type == "chargingBoxShowcase" => {
          ...,
          products[]->{
            _id,
            name,
            currentPrice
          }
        }
      }
    }`
    const spreadResult = await client.fetch(spreadQuery)
    const showcase = spreadResult?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Spread operator result:')
    console.log('   - Showcase found:', !!showcase)
    console.log('   - Products:', showcase?.products)
    
    // Test 5: Without conditional projection
    console.log('\n5️⃣ Without conditional projection...')
    const noConditionQuery = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[_type == "chargingBoxShowcase"] {
        _type,
        _key,
        heading,
        "expandedProducts": products[]->{
          _id,
          name,
          currentPrice
        },
        "rawProducts": products
      }
    }`
    const noConditionResult = await client.fetch(noConditionQuery)
    console.log('   Result:', JSON.stringify(noConditionResult?.contentBlocks, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testReferenceExpansion()