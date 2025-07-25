import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
})

async function testQueryVariations() {
  try {
    console.log('🔍 Testing different query variations for reference expansion\n')
    
    // Test 1: Without spread operator
    console.log('1️⃣ Testing without spread operator inside showcase block...')
    const query1 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          heading,
          products[]->
        }
      }
    }`
    const result1 = await client.fetch(query1)
    const showcase1 = result1?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products:', showcase1?.products?.map((p: any) => p?.name || 'null').join(', '))
    
    // Test 2: With field selection but simpler
    console.log('\n2️⃣ Testing with simple field selection...')
    const query2 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          heading,
          products[]->{_id, name}
        }
      }
    }`
    const result2 = await client.fetch(query2)
    const showcase2 = result2?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products:', showcase2?.products?.map((p: any) => p?.name || 'null').join(', '))
    
    // Test 3: Moving expansion outside conditional
    console.log('\n3️⃣ Testing with expansion at top level...')
    const query3 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        ...,
        _type == "chargingBoxShowcase" => {
          products[]->
        }
      }
    }`
    const result3 = await client.fetch(query3)
    const showcase3 = result3?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products:', showcase3?.products?.map((p: any) => p?.name || 'null').join(', '))
    
    // Test 4: Without conditional projection
    console.log('\n4️⃣ Testing without conditional projection...')
    const query4 = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        ...,
        products[]->
      }
    }`
    const result4 = await client.fetch(query4)
    const showcase4 = result4?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products:', showcase4?.products?.map((p: any) => p?.name || 'null').join(', '))
    
    // Test 5: Direct query to showcase block
    console.log('\n5️⃣ Testing direct query to showcase block...')
    const query5 = `*[_type == "page" && slug.current == "ladeboks"][0].contentBlocks[_type == "chargingBoxShowcase"][0] {
      _type,
      heading,
      products[]->
    }`
    const result5 = await client.fetch(query5)
    console.log('   Result:', result5)
    console.log('   Products:', result5?.products?.map((p: any) => p?.name || 'null').join(', '))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testQueryVariations()