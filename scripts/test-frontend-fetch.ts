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

async function testFrontendFetch() {
  try {
    console.log('🔍 Testing frontend fetch for ladeboks page...\n')
    
    // This is the exact query from sanityService.ts getPageBySlug
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      contentBlocks[] {
        ...,
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
    
    const page = await client.fetch(query, { slug: 'ladeboks' })
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }
    
    console.log('✅ Page found:', page.title)
    console.log('\n📦 Content blocks:', page.contentBlocks?.length || 0)
    
    // Find charging box showcase
    const showcase = page.contentBlocks?.find((block: any) => block._type === 'chargingBoxShowcase')
    
    if (!showcase) {
      console.log('\n❌ No charging box showcase found in content blocks')
      return
    }
    
    console.log('\n✅ Charging Box Showcase found:')
    console.log('   - Heading:', showcase.heading)
    console.log('   - Header alignment:', showcase.headerAlignment)
    console.log('   - Has description:', !!showcase.description)
    console.log('   - Products count:', showcase.products?.length || 0)
    
    if (showcase.products && showcase.products.length > 0) {
      console.log('\n📦 Products:')
      showcase.products.forEach((product: any, index: number) => {
        console.log(`\n   ${index + 1}. ${product.name}`)
        console.log(`      - ID: ${product._id}`)
        console.log(`      - Price: ${product.currentPrice} kr`)
        console.log(`      - Original price: ${product.originalPrice || 'N/A'}`)
        console.log(`      - Badge: ${product.badge || 'None'}`)
        console.log(`      - Features: ${product.features?.length || 0}`)
        console.log(`      - Has image: ${!!product.productImage}`)
        console.log(`      - CTA: ${product.ctaText} → ${product.ctaLink}`)
      })
    } else {
      console.log('\n⚠️ No products found in showcase')
      console.log('Raw showcase data:', JSON.stringify(showcase, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFrontendFetch()