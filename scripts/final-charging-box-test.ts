import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: true, // Use CDN like production
  apiVersion: '2025-01-01',
})

async function finalTest() {
  try {
    console.log('✅ Final Charging Box Showcase Test\n')
    
    // Test the exact query used by the frontend
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
    
    console.log('📡 Fetching page data with CDN...')
    const page = await client.fetch(query)
    
    const showcaseBlock = page?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    
    if (!showcaseBlock) {
      console.log('❌ No charging box showcase block found!')
      return
    }
    
    console.log('✅ Charging Box Showcase Block:')
    console.log(`   - Heading: ${showcaseBlock.heading}`)
    console.log(`   - Products: ${showcaseBlock.products?.length || 0}`)
    console.log(`   - Header Alignment: ${showcaseBlock.headerAlignment}`)
    
    if (showcaseBlock.products && showcaseBlock.products.length > 0) {
      console.log('\n📦 Products:')
      showcaseBlock.products.forEach((product: any, i: number) => {
        console.log(`\n   ${i + 1}. ${product.name}`)
        console.log(`      - Price: ${product.currentPrice} kr`)
        console.log(`      - Badge: ${product.badge || 'none'}`)
        console.log(`      - Image: ${product.productImage ? '✅' : '❌'}`)
        console.log(`      - Features: ${product.features?.length || 0}`)
        console.log(`      - CTA: ${product.ctaText || 'Køb nu'} → ${product.ctaLink || 'no link'}`)
      })
      
      console.log('\n🎉 SUCCESS! The charging box showcase should now display products correctly.')
      console.log('\n📝 What was fixed:')
      console.log('   1. Product IDs were using dots (.) instead of dashes (-)')
      console.log('   2. Updated page references to use correct IDs')
      console.log('   3. Cleaned up duplicate products')
      console.log('   4. Verified query expansion works correctly')
      
      console.log('\n🌐 Next steps:')
      console.log('   1. Clear browser cache and reload /ladeboks page')
      console.log('   2. Check browser console for any JavaScript errors')
      console.log('   3. Verify products display with images and CTAs')
    } else {
      console.log('\n❌ No products found in showcase block!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

finalTest()