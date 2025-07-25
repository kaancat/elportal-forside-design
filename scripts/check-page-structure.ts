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

async function checkPageStructure() {
  try {
    console.log('🔍 Checking page structure...\n')
    
    // Get the exact data structure returned by getPageBySlug
    const query = `*[_id == "Ldbn1aqxfi6rpqe9dn" || slug.current == "ladeboks"][0]{
      _id,
      _type,
      title,
      slug,
      contentBlocks[]{
        _key,
        _type,
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
        },
        _type != "chargingBoxShowcase" => {
          ...
        }
      }
    }`
    
    const page = await client.fetch(query)
    
    console.log('Page found:', page._id, page.title)
    console.log('\nContent blocks:')
    
    page.contentBlocks?.forEach((block, index) => {
      console.log(`\n${index}. Type: ${block._type}`)
      if (block._type === 'chargingBoxShowcase') {
        console.log('   Showcase details:')
        console.log('   - Has heading:', !!block.heading)
        console.log('   - Has description:', !!block.description)
        console.log('   - Has products:', !!block.products)
        console.log('   - Products count:', block.products?.length || 0)
        console.log('   - First product:', block.products?.[0]?.name)
        console.log('   - Block structure:', JSON.stringify(block, null, 2))
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkPageStructure()