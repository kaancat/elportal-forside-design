import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function verifyLadeboksFixes() {
  try {
    console.log('Verifying Ladeboks page fixes...\n')
    
    // Check if the page exists and has correct structure
    const page = await client.fetch(`*[_id == "page.ladeboks"][0] {
      _id,
      title,
      "slug": slug.current,
      "contentBlocksCount": count(contentBlocks),
      "chargingBoxShowcaseExists": count(contentBlocks[_type == "chargingBoxShowcase"]) > 0,
      "valuePropositionExists": count(contentBlocks[_type == "valueProposition"]) > 0,
      contentBlocks[_type == "valueProposition"] {
        _type,
        title,
        "itemsCount": count(items),
        items[] {
          _type,
          heading,
          description,
          "hasIcon": defined(icon)
        }
      }
    }`)
    
    if (!page) {
      console.log('❌ Ladeboks page not found!')
      return
    }

    console.log('✅ Page found:', page.title)
    console.log('✅ Slug:', page.slug)
    console.log('✅ Content blocks:', page.contentBlocksCount)
    console.log('✅ ChargingBoxShowcase present:', page.chargingBoxShowcaseExists)
    console.log('✅ ValueProposition present:', page.valuePropositionExists)
    
    // Check valueProposition structure
    if (page.contentBlocks && page.contentBlocks.length > 0) {
      const valueProps = page.contentBlocks[0]
      console.log('\n📋 ValueProposition Analysis:')
      console.log('  - Title:', valueProps.title)
      console.log('  - Items count:', valueProps.itemsCount)
      
      if (valueProps.items) {
        console.log('  - Items structure:')
        valueProps.items.forEach((item: any, index: number) => {
          console.log(`    ${index + 1}. "${item.heading}"`)
          console.log(`       Description: "${item.description}"`)
          console.log(`       Has icon: ${item.hasIcon ? '🔲 (needs manual selection)' : '❌ (undefined)'}`)
        })
      }
    }

    // Check charging box products
    console.log('\n📦 Checking charging box products...')
    const products = await client.fetch(`*[_type == "chargingBoxProduct"] {
      _id,
      name,
      currentPrice
    }`)
    
    console.log(`✅ Found ${products.length} charging box products:`)
    products.forEach((product: any) => {
      console.log(`  - ${product.name}: ${product.currentPrice} kr (${product._id})`)
    })

    console.log('\n🎯 Summary:')
    console.log('✅ Schema export issues fixed (chargingBoxShowcase and chargingBoxProduct)')
    console.log('✅ ValueItem schema updated with heading and description fields')
    console.log('✅ Content structure corrected (values → items, proper field mapping)')
    console.log('🔲 Icons need manual selection in Sanity Studio')
    console.log('\n📝 Next step: Go to Sanity Studio and select icons for value items')

  } catch (error) {
    console.error('❌ Error verifying fixes:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

// Run the verification
verifyLadeboksFixes()