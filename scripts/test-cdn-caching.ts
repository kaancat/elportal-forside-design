import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

// Test with CDN enabled
const clientWithCDN = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01', // Using same version as frontend
})

// Test without CDN
const clientWithoutCDN = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function testCDNCaching() {
  try {
    console.log('🔍 Testing CDN caching for charging box products...\n')
    
    const query = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[_type == "chargingBoxShowcase"]{
        _type,
        _key,
        heading,
        products[]->{
          _id,
          name,
          currentPrice
        }
      }
    }`
    
    // Test with CDN
    console.log('1️⃣ Testing WITH CDN (useCdn: true)...')
    const resultWithCDN = await clientWithCDN.fetch(query)
    const showcaseWithCDN = resultWithCDN?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products found:', showcaseWithCDN?.products?.length || 0)
    if (showcaseWithCDN?.products) {
      showcaseWithCDN.products.forEach((p: any) => {
        if (p && p.name) {
          console.log(`   - ${p.name}`)
        } else {
          console.log(`   - NULL or invalid product:`, p)
        }
      })
    }
    
    // Test without CDN
    console.log('\n2️⃣ Testing WITHOUT CDN (useCdn: false)...')
    const resultWithoutCDN = await clientWithoutCDN.fetch(query)
    const showcaseWithoutCDN = resultWithoutCDN?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products found:', showcaseWithoutCDN?.products?.length || 0)
    if (showcaseWithoutCDN?.products) {
      showcaseWithoutCDN.products.forEach((p: any) => {
        if (p && p.name) {
          console.log(`   - ${p.name}`)
        } else {
          console.log(`   - NULL or invalid product:`, p)
        }
      })
    }
    
    // Compare results
    console.log('\n3️⃣ Comparison:')
    const cdnProductCount = showcaseWithCDN?.products?.length || 0
    const noCdnProductCount = showcaseWithoutCDN?.products?.length || 0
    
    if (cdnProductCount === noCdnProductCount) {
      console.log('   ✅ Both queries return the same number of products')
    } else {
      console.log('   ❌ CDN is returning stale data!')
      console.log(`   CDN: ${cdnProductCount} products`)
      console.log(`   No CDN: ${noCdnProductCount} products`)
      console.log('\n   💡 Solution: The CDN cache needs to be invalidated')
    }
    
    // Test the exact query used in sanityService.ts
    console.log('\n4️⃣ Testing exact frontend query pattern...')
    const frontendQuery = `*[_type == "page" && slug.current == $slug][0] {
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
    
    const frontendResult = await clientWithCDN.fetch(frontendQuery, { slug: 'ladeboks' })
    const frontendShowcase = frontendResult?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Frontend query products:', frontendShowcase?.products?.length || 0)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testCDNCaching()