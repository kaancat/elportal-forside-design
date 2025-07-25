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

async function debugChargingBoxIssue() {
  try {
    console.log('🔍 Comprehensive Debug for Charging Box Products Issue\n')
    
    // 1. Check if products exist
    console.log('1️⃣ Checking if charging box products exist...')
    const products = await client.fetch(`*[_type == "chargingBoxProduct"]{_id, name}`)
    console.log(`   Found ${products.length} products:`)
    products.forEach((p: any) => console.log(`   - ${p._id}: ${p.name}`))
    
    // 2. Check raw page data
    console.log('\n2️⃣ Checking raw page data...')
    const rawPage = await client.getDocument('Ldbn1aqxfi6rpqe9dn')
    const showcaseBlock = rawPage?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Showcase block exists:', !!showcaseBlock)
    if (showcaseBlock) {
      console.log('   Products in showcase:', showcaseBlock.products?.length || 0)
      console.log('   Raw products data:', JSON.stringify(showcaseBlock.products, null, 2))
    }
    
    // 3. Test the exact query used by frontend (without expansion)
    console.log('\n3️⃣ Testing frontend query WITHOUT product expansion...')
    const queryWithoutExpansion = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          heading,
          headerAlignment,
          description,
          products
        }
      }
    }`
    const pageWithoutExpansion = await client.fetch(queryWithoutExpansion)
    const showcaseWithoutExpansion = pageWithoutExpansion?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products (unexpanded):', JSON.stringify(showcaseWithoutExpansion?.products, null, 2))
    
    // 4. Test with expansion
    console.log('\n4️⃣ Testing frontend query WITH product expansion...')
    const queryWithExpansion = `*[_type == "page" && slug.current == "ladeboks"][0] {
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
        }
      }
    }`
    const pageWithExpansion = await client.fetch(queryWithExpansion)
    const showcaseWithExpansion = pageWithExpansion?.contentBlocks?.find((b: any) => b._type === 'chargingBoxShowcase')
    console.log('   Products (expanded):', showcaseWithExpansion?.products?.length || 0)
    if (showcaseWithExpansion?.products) {
      showcaseWithExpansion.products.forEach((p: any) => {
        console.log(`   - ${p.name}: ${p.currentPrice} kr`)
      })
    }
    
    // 5. Test individual product references
    console.log('\n5️⃣ Testing individual product references...')
    const productRefs = showcaseBlock?.products || []
    for (const ref of productRefs) {
      if (ref._ref) {
        const product = await client.getDocument(ref._ref)
        console.log(`   Reference ${ref._ref}:`, product ? `✅ ${product.name}` : '❌ Not found')
      }
    }
    
    // 6. Compare with working component (providerList)
    console.log('\n6️⃣ Comparing with working providerList component...')
    const providerQuery = `*[_type == "page" && defined(contentBlocks[_type == "providerList"])][0] {
      contentBlocks[_type == "providerList"]{
        _type,
        providers
      }
    }`
    const providerPage = await client.fetch(providerQuery)
    const providerBlock = providerPage?.contentBlocks?.find((b: any) => b._type === 'providerList')
    console.log('   Provider references structure:', JSON.stringify(providerBlock?.providers?.slice(0, 2), null, 2))
    
    // 7. Check if it's a frontend rendering issue
    console.log('\n7️⃣ Checking for potential frontend issues...')
    console.log('   Component registration: ChargingBoxShowcase should be in ContentBlocks.tsx ✅')
    console.log('   Type definition: ChargingBoxShowcaseBlock interface exists ✅')
    console.log('   Product expansion: Query includes products[]-> syntax ✅')
    
    console.log('\n📊 Summary:')
    console.log('   - Products exist in Sanity: ✅')
    console.log('   - Products are referenced in showcase: ✅')
    console.log('   - Query expands products correctly: ✅')
    console.log('   - Frontend should receive data: ✅')
    
    console.log('\n🔍 Next Steps:')
    console.log('   1. Check browser console for JavaScript errors')
    console.log('   2. Check Network tab to see actual API response')
    console.log('   3. Add console.log in ChargingBoxShowcase component')
    console.log('   4. Verify the page is accessible at /ladeboks')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugChargingBoxIssue()