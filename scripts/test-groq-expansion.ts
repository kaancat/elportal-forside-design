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

async function testGroqExpansion() {
  try {
    console.log('🔍 Testing GROQ reference expansion...\n')
    
    // Test 1: Check if products exist as references
    const showcase = await client.fetch(`*[_id == "Ldbn1aqxfi6rpqe9dn"][0].contentBlocks[_type == "chargingBoxShowcase"][0]`)
    console.log('1. Raw showcase block:')
    console.log('   Products array:', showcase.products)
    
    // Test 2: Try to expand references manually
    const expandedShowcase = await client.fetch(`*[_id == "Ldbn1aqxfi6rpqe9dn"][0].contentBlocks[_type == "chargingBoxShowcase"][0]{
      ...,
      products[]->{
        _id,
        name,
        currentPrice
      }
    }`)
    console.log('\n2. Manually expanded showcase:')
    console.log('   Products:', expandedShowcase.products)
    
    // Test 3: Check if the exact query pattern from getPageBySlug works
    const pageQuery = `*[slug.current == "ladeboks"][0]{
      _id,
      _type,
      title,
      slug,
      contentBlocks[]{
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          heading,
          headerAlignment,
          description,
          products[]->{ 
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
          }
        }
      }
    }`
    
    const pageResult = await client.fetch(pageQuery)
    console.log('\n3. Full page query result:')
    const showcaseFromPage = pageResult?.contentBlocks?.find(b => b._type === 'chargingBoxShowcase')
    console.log('   Showcase products:', showcaseFromPage?.products)
    
    // Test 4: Try a different expansion syntax
    const altQuery = `*[_id == "Ldbn1aqxfi6rpqe9dn"][0]{
      contentBlocks[_type == "chargingBoxShowcase"]{
        _key,
        _type,
        heading,
        "products": products[]->{
          _id,
          name,
          currentPrice
        }
      }
    }`
    
    const altResult = await client.fetch(altQuery)
    console.log('\n4. Alternative query syntax:')
    console.log('   Result:', altResult?.contentBlocks?.[0])
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testGroqExpansion()