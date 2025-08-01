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

async function analyzeLadeboksProducts() {
  try {
    console.log('🔍 Analyzing Ladeboks page for product information...\n')
    
    // Fetch the Ladeboks page
    const ladeboksPage = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]{
      _id,
      title,
      contentBlocks[]{
        _type,
        _key,
        ...,
        _type == "pageSection" => {
          title,
          content[]
        },
        _type == "valueProposition" => {
          heading,
          valueItems[]{
            heading,
            description,
            icon
          }
        },
        _type == "featureList" => {
          heading,
          features[]{
            title,
            description,
            image
          }
        },
        _type == "providerList" => {
          heading,
          providers[]{
            name,
            description,
            image,
            features,
            price
          }
        },
        _type == "chargingBoxShowcase" => {
          heading,
          products[]{
            name,
            image,
            description,
            price,
            features,
            specifications
          }
        }
      }
    }`)
    
    if (!ladeboksPage) {
      console.log('❌ Ladeboks page not found')
      return
    }
    
    console.log('✅ Ladeboks page found')
    console.log(`Page title: ${ladeboksPage.title}`)
    console.log(`Content blocks: ${ladeboksPage.contentBlocks?.length || 0}`)
    
    // Analyze each content block for product information
    console.log('\n📊 CONTENT BLOCK ANALYSIS:')
    
    let productData: any[] = []
    
    ladeboksPage.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\nBlock ${index + 1}: ${block._type}`)
      
      switch (block._type) {
        case 'chargingBoxShowcase':
          console.log(`  🎯 FOUND PRODUCT SHOWCASE!`)
          console.log(`  Heading: "${block.heading || 'No heading'}"`)
          console.log(`  Products: ${block.products?.length || 0}`)
          
          if (block.products) {
            block.products.forEach((product: any, pIndex: number) => {
              console.log(`    Product ${pIndex + 1}: ${product.name || 'Unnamed'}`)
              console.log(`      - Description: ${product.description ? 'Present' : 'Missing'}`)
              console.log(`      - Image: ${product.image ? 'Present' : 'Missing'}`)
              console.log(`      - Price: ${product.price || 'Not specified'}`)
              console.log(`      - Features: ${product.features?.length || 0}`)
              console.log(`      - Specifications: ${product.specifications ? 'Present' : 'Missing'}`)
            })
            productData = [...productData, ...block.products]
          }
          break
          
        case 'providerList':
          console.log(`  🏢 Provider List (potential products)`)
          console.log(`  Heading: "${block.heading || 'No heading'}"`)
          console.log(`  Providers: ${block.providers?.length || 0}`)
          
          if (block.providers) {
            block.providers.forEach((provider: any, pIndex: number) => {
              console.log(`    Provider ${pIndex + 1}: ${provider.name || 'Unnamed'}`)
              console.log(`      - Has image: ${!!provider.image}`)
              console.log(`      - Has price: ${!!provider.price}`)
            })
          }
          break
          
        case 'featureList':
          console.log(`  📋 Feature List`)
          console.log(`  Heading: "${block.heading || 'No heading'}"`)
          console.log(`  Features: ${block.features?.length || 0}`)
          break
          
        case 'valueProposition':
          console.log(`  💡 Value Proposition`)
          console.log(`  Heading: "${block.heading || 'No heading'}"`)
          console.log(`  Value Items: ${block.valueItems?.length || 0}`)
          break
          
        case 'pageSection':
          console.log(`  📝 Page Section`)
          console.log(`  Title: "${block.title || 'No title'}"`)
          console.log(`  Content blocks: ${block.content?.length || 0}`)
          break
          
        default:
          console.log(`  ℹ️  Other type: ${block._type}`)
      }
    })
    
    // Summary of findings
    console.log('\n' + '='.repeat(50))
    console.log('📋 SUMMARY OF FINDINGS:')
    console.log('='.repeat(50))
    
    console.log(`Total product items found: ${productData.length}`)
    
    if (productData.length > 0) {
      console.log('\n🎯 PRODUCT DATA STRUCTURE:')
      productData.forEach((product: any, index: number) => {
        console.log(`\nProduct ${index + 1}:`)
        console.log(`  Name: "${product.name || 'Unnamed'}"`)
        console.log(`  Description: ${product.description ? `"${product.description.substring(0, 50)}..."` : 'Missing'}`)
        console.log(`  Price: ${product.price || 'Not specified'}`)
        console.log(`  Image: ${product.image ? 'Available' : 'Missing'}`)
        console.log(`  Features: ${Array.isArray(product.features) ? product.features.length : (product.features ? 'Present' : 'None')}`)
        console.log(`  Specifications: ${product.specifications ? 'Available' : 'Missing'}`)
      })
      
      console.log('\n✅ INTEGRATION READY!')
      console.log('- Product data structure identified')
      console.log('- Can create dynamic product showcase component')
      console.log('- Products have sufficient data for display')
    } else {
      console.log('\n⚠️  NO STRUCTURED PRODUCT DATA FOUND')
      console.log('- May need to check for other content types')
      console.log('- Could extract from page sections manually')
    }
    
    return { ladeboksPage, productData }
    
  } catch (error) {
    console.error('❌ Error analyzing Ladeboks page:', error)
  }
}

// Run the analysis
analyzeLadeboksProducts()