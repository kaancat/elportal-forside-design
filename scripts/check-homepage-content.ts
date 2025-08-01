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

async function checkHomepageContent() {
  try {
    console.log('🔍 Checking homepage content structure...\n')
    
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      _id,
      title,
      contentBlocks[]{ 
        _type,
        _key,
        _type == "chargingBoxShowcase" => {
          heading,
          "productCount": count(products)
        },
        _type == "hero" => { heading },
        _type == "heroWithCalculator" => { heading },
        _type == "valueProposition" => { heading },
        _type == "providerList" => { heading },
        _type == "pageSection" => { title }
      }
    }`)
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }
    
    console.log('✅ Homepage found')
    console.log(`Title: ${homepage.title}`)
    console.log(`Content blocks: ${homepage.contentBlocks?.length || 0}\n`)
    
    // Check if charging box showcase already exists
    const hasChargingBoxShowcase = homepage.contentBlocks?.some((block: any) => 
      block._type === 'chargingBoxShowcase'
    )
    
    console.log('📊 CONTENT BLOCKS STRUCTURE:')
    homepage.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`${index + 1}. ${block._type}`)
      
      if (block._type === 'chargingBoxShowcase') {
        console.log(`   🎯 FOUND! Products: ${block.productCount || 0}`)
      } else if (block.heading) {
        console.log(`   Heading: "${block.heading}"`)
      } else if (block.title) {
        console.log(`   Title: "${block.title}"`)
      }
    })
    
    console.log('\n' + '='.repeat(50))
    console.log('📋 INTEGRATION STATUS:')
    console.log('='.repeat(50))
    
    if (hasChargingBoxShowcase) {
      console.log('✅ ChargingBoxShowcase is ALREADY integrated in homepage!')
      console.log('   → The component exists and should display products')
      console.log('   → Products are fetched dynamically from Ladeboks page')
      console.log('   → Task appears to be already completed')
    } else {
      console.log('❌ ChargingBoxShowcase is NOT on homepage')
      console.log('   → Need to add it to homepage content blocks')
      console.log('   → Should be placed near the bottom, before footer')
    }
    
    return { homepage, hasChargingBoxShowcase }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the check
checkHomepageContent()