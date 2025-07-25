import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: true, // Use CDN like frontend does
  apiVersion: '2025-01-01',
})

async function testExactFrontendQuery() {
  try {
    console.log('🔍 Testing exact frontend query for /ladeboks page\n')
    
    // This is the exact query from sanityService.ts getPageBySlug
    const query = `*[_type == "page" && slug.current == "ladeboks"][0] {
      _id,
      _type,
      title,
      slug,
      description,
      contentBlocks[] {
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
      },
      seo {
        metaTitle,
        metaDescription,
        openGraphImage
      }
    }`
    
    console.log('📡 Fetching page data...')
    const page = await client.fetch(query)
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }
    
    console.log('✅ Page found:', page.title)
    console.log('\n📦 Content blocks:', page.contentBlocks?.length || 0)
    
    const showcaseBlock = page.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    
    if (!showcaseBlock) {
      console.log('❌ No chargingBoxShowcase block found!')
      return
    }
    
    console.log('\n✅ ChargingBoxShowcase block found:')
    console.log('   Heading:', showcaseBlock.heading)
    console.log('   Products:', showcaseBlock.products?.length || 0)
    
    if (showcaseBlock.products && showcaseBlock.products.length > 0) {
      console.log('\n📦 Product details:')
      showcaseBlock.products.forEach((product: any, i: number) => {
        console.log(`\n   Product ${i + 1}:`)
        console.log('   - ID:', product._id)
        console.log('   - Name:', product.name)
        console.log('   - Price:', product.currentPrice)
        console.log('   - Has image:', !!product.productImage)
        console.log('   - Features:', product.features?.length || 0)
      })
    } else {
      console.log('\n❌ No products in showcase block!')
      console.log('   Raw showcase data:', JSON.stringify(showcaseBlock, null, 2))
    }
    
    // Test without CDN
    console.log('\n\n🔄 Testing without CDN...')
    const clientNoCDN = createClient({
      projectId: 'yxesi03x',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2025-01-01',
    })
    
    const pageNoCDN = await clientNoCDN.fetch(query)
    const showcaseNoCDN = pageNoCDN?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products (no CDN):', showcaseNoCDN?.products?.length || 0)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testExactFrontendQuery()