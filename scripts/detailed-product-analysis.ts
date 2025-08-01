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

async function detailedProductAnalysis() {
  try {
    console.log('🔍 Detailed Product Analysis...\n')
    
    // Get the exact charging box showcase data
    const chargingBoxData = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]{
      contentBlocks[_type == "chargingBoxShowcase"][0]{
        _key,
        heading,
        subheading,
        products
      }
    }`)
    
    console.log('Raw charging box data:')
    console.log(JSON.stringify(chargingBoxData, null, 2))
    
    // Also check if there are any other product-related schemas
    console.log('\n🔍 Checking for other product schemas...')
    
    // Check for any documents that might contain product info
    const allPages = await client.fetch(`*[_type == "page"]{
      title,
      "slug": slug.current,
      contentBlocks[]{
        _type,
        _type match "*product*" => @,
        _type match "*charging*" => @,
        _type match "*ladeboks*" => @
      }
    }`)
    
    console.log('\nPages with product-related content:')
    allPages.forEach((page: any) => {
      const productBlocks = page.contentBlocks?.filter((block: any) => 
        block._type?.includes('product') || 
        block._type?.includes('charging') || 
        block._type?.includes('ladeboks')
      )
      
      if (productBlocks && productBlocks.length > 0) {
        console.log(`\n📄 ${page.title} (/${page.slug})`)
        productBlocks.forEach((block: any) => {
          console.log(`  - ${block._type}`)
        })
      }
    })
    
    // Check what charging box showcase schema expects
    console.log('\n🔍 Checking existing charging box showcase implementations...')
    
    const allChargingBoxes = await client.fetch(`*[_type == "page"]{
      title,
      "slug": slug.current,
      contentBlocks[_type == "chargingBoxShowcase"]{
        heading,
        products
      }
    }`)
    
    console.log('\nPages with charging box showcases:')
    allChargingBoxes.forEach((page: any) => {
      if (page.contentBlocks && page.contentBlocks.length > 0) {
        console.log(`\n📄 ${page.title} (/${page.slug})`)
        page.contentBlocks.forEach((showcase: any) => {
          console.log(`  Heading: "${showcase.heading}"`)
          console.log(`  Products: ${showcase.products?.length || 0}`)
          if (showcase.products) {
            showcase.products.forEach((product: any, index: number) => {
              console.log(`    Product ${index + 1}: ${JSON.stringify(product, null, 4)}`)
            })
          }
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the detailed analysis
detailedProductAnalysis()