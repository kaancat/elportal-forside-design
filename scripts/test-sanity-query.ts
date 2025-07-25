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

async function testSanityQuery() {
  try {
    console.log('🔍 Testing Sanity query for charging box showcase...\n')
    
    // Test the exact GROQ query used in sanityService.ts
    const query = `*[_id == "Ldbn1aqxfi6rpqe9dn"][0]{
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
    
    const result = await client.fetch(query)
    
    console.log('Full query result:', JSON.stringify(result, null, 2))
    
    // Find the showcase block
    const showcaseBlock = result?.contentBlocks?.find(block => block._type === 'chargingBoxShowcase')
    
    if (showcaseBlock) {
      console.log('\nShowcase block found:')
      console.log('- Heading:', showcaseBlock.heading)
      console.log('- Products:', showcaseBlock.products?.length || 0)
      
      if (showcaseBlock.products && showcaseBlock.products.length > 0) {
        console.log('\nProduct details:')
        showcaseBlock.products.forEach((product, index) => {
          console.log(`\n${index + 1}. ${product?.name || 'NO NAME'}`)
          console.log('   - ID:', product?._id)
          console.log('   - Current Price:', product?.currentPrice)
          console.log('   - Badge:', product?.badge || 'none')
          console.log('   - Features:', product?.features?.length || 0)
        })
      } else {
        console.log('\n⚠️  No products found in showcase!')
      }
    } else {
      console.log('\n❌ Showcase block not found!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testSanityQuery()