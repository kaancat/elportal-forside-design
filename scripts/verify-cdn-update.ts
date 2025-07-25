import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const clientWithCDN = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: true, // Using CDN like the frontend
  apiVersion: '2024-01-01', // Same as frontend
})

async function verifyCDNUpdate() {
  try {
    console.log('🔍 Verifying CDN has updated data...\n')
    
    // Use exact query from sanityService.ts
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
    
    const page = await clientWithCDN.fetch(query, { slug: 'ladeboks' })
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }
    
    const showcase = page.contentBlocks?.find((block: any) => block._type === 'chargingBoxShowcase')
    
    if (!showcase) {
      console.log('❌ Charging box showcase not found!')
      return
    }
    
    console.log('✅ Charging Box Showcase found')
    console.log(`📦 Products: ${showcase.products?.length || 0}`)
    
    if (showcase.products && showcase.products.length > 0) {
      console.log('\nProduct details:')
      showcase.products.forEach((product: any, index: number) => {
        if (product) {
          console.log(`\n${index + 1}. ${product.name || 'Unknown'}`)
          console.log(`   - Price: ${product.currentPrice} kr`)
          console.log(`   - Has image: ${!!product.productImage}`)
          console.log(`   - Features: ${product.features?.length || 0}`)
        } else {
          console.log(`\n${index + 1}. ❌ NULL PRODUCT`)
        }
      })
      
      // Check for null products
      const nullProducts = showcase.products.filter((p: any) => !p)
      if (nullProducts.length > 0) {
        console.log(`\n⚠️ WARNING: ${nullProducts.length} products are null!`)
        console.log('CDN might still be serving cached data.')
        console.log('\n💡 Solutions:')
        console.log('1. Wait a few minutes for CDN to update')
        console.log('2. Clear CDN cache manually in Sanity dashboard')
        console.log('3. Temporarily disable CDN in frontend (set useCdn: false)')
      } else {
        console.log('\n✅ All products are properly loaded!')
        console.log('The charging box showcase should now display correctly on the frontend.')
      }
    } else {
      console.log('\n❌ No products found in showcase')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyCDNUpdate()