import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function extractProductData() {
  try {
    console.log('🔍 Extracting complete product data...\n')
    
    // Get the charging box showcase with resolved references
    const ladeboksData = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]{
      contentBlocks[_type == "chargingBoxShowcase"][0]{
        _key,
        heading,
        subheading,
        products[]->{
          _id,
          name,
          brand,
          model,
          description,
          price,
          originalPrice,
          discount,
          image,
          features,
          specifications,
          powerOutput,
          connectivity,
          installation,
          warranty,
          slug
        }
      }
    }`)
    
    console.log('✅ Product data extracted successfully!')
    
    const showcase = ladeboksData?.contentBlocks
    
    if (!showcase || !showcase.products) {
      console.log('❌ No products found')
      return
    }
    
    console.log(`\n📦 PRODUCT SHOWCASE: "${showcase.heading}"`)
    console.log(`Products found: ${showcase.products.length}`)
    
    showcase.products.forEach((product: any, index: number) => {
      console.log(`\n=== PRODUCT ${index + 1} ===`)
      console.log(`Name: ${product.name || 'Unnamed'}`)
      console.log(`Brand: ${product.brand || 'No brand'}`)
      console.log(`Model: ${product.model || 'No model'}`)
      console.log(`Description: ${product.description ? `"${product.description.substring(0, 100)}..."` : 'Missing'}`)
      console.log(`Price: ${product.price || 'Not specified'}`)
      console.log(`Original Price: ${product.originalPrice || 'Not specified'}`)
      console.log(`Discount: ${product.discount || 'None'}`)
      console.log(`Image: ${product.image ? 'Available' : 'Missing'}`)
      console.log(`Features: ${product.features?.length || 0}`)
      console.log(`Power Output: ${product.powerOutput || 'Not specified'}`)
      console.log(`Connectivity: ${product.connectivity || 'Not specified'}`)
      console.log(`Installation: ${product.installation || 'Not specified'}`)
      console.log(`Warranty: ${product.warranty || 'Not specified'}`)
      console.log(`Slug: ${product.slug?.current || 'No slug'}`)
      
      if (product.features && product.features.length > 0) {
        console.log(`Features list:`)
        product.features.forEach((feature: string, fIndex: number) => {
          console.log(`  ${fIndex + 1}. ${feature}`)
        })
      }
      
      if (product.specifications) {
        console.log(`Specifications: ${typeof product.specifications === 'object' ? 'Available (object)' : product.specifications}`)
      }
    })
    
    // Check if all required fields are present for integration
    console.log('\n' + '='.repeat(50))
    console.log('📋 INTEGRATION READINESS ASSESSMENT:')
    console.log('='.repeat(50))
    
    const readinessScore = showcase.products.reduce((score: number, product: any) => {
      let productScore = 0
      
      if (product.name) productScore += 20
      if (product.description) productScore += 20
      if (product.price) productScore += 20
      if (product.image) productScore += 20
      if (product.features && product.features.length > 0) productScore += 20
      
      return score + productScore
    }, 0) / showcase.products.length
    
    console.log(`Average product completeness: ${readinessScore.toFixed(0)}%`)
    
    if (readinessScore >= 80) {
      console.log('✅ EXCELLENT - Products are ready for integration')
    } else if (readinessScore >= 60) {
      console.log('⚠️  GOOD - Some product data missing but usable')
    } else {
      console.log('❌ POOR - Significant product data missing')
    }
    
    // Generate integration recommendations
    console.log('\n🎯 INTEGRATION RECOMMENDATIONS:')
    console.log('1. Create dynamic product showcase component')
    console.log('2. Add to homepage bottom section')
    console.log('3. Include product cards with:')
    console.log('   - Product name and brand')
    console.log('   - Product image')
    console.log('   - Price (with discount if available)')
    console.log('   - Key features (first 3-4)')
    console.log('   - "Learn More" button linking to Ladeboks page')
    console.log('4. Make it responsive and interactive')
    
    return showcase.products
    
  } catch (error) {
    console.error('❌ Error extracting product data:', error)
  }
}

// Run the extraction
extractProductData()