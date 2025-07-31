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

async function checkElproduktionSection() {
  try {
    console.log('🔍 Checking "Elproduktion i Danmark" section for Array/String issues...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Find the Elproduktion i Danmark section
    const elproduktionBlock = homepage.contentBlocks.find((block: any) => 
      block.title === 'Elproduktion i Danmark'
    )
    
    if (!elproduktionBlock) {
      console.error('Elproduktion i Danmark section not found')
      return
    }
    
    console.log('📊 Section structure:')
    console.log(JSON.stringify(elproduktionBlock, null, 2))
    
    // Check all fields
    console.log('\n🔍 Field type analysis:')
    
    // Check each field
    Object.entries(elproduktionBlock).forEach(([key, value]) => {
      const valueType = Array.isArray(value) ? 'Array' : typeof value
      console.log(`\n${key}:`)
      console.log(`  Type: ${valueType}`)
      
      if (Array.isArray(value)) {
        console.log(`  Array length: ${value.length}`)
        if (value.length > 0) {
          console.log(`  First item type: ${typeof value[0]}`)
          if (typeof value[0] === 'object' && value[0]._type) {
            console.log(`  First item _type: ${value[0]._type}`)
          }
        }
      } else if (typeof value === 'string') {
        console.log(`  Value: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`)
      }
    })
    
    // Check specifically for Monthly Production Chart
    console.log('\n\n🔍 Looking for Monthly Production Chart:')
    const chartIndex = homepage.contentBlocks.findIndex((block: any) => 
      block._type === 'monthlyProductionChart'
    )
    
    if (chartIndex !== -1) {
      const chart = homepage.contentBlocks[chartIndex]
      console.log(`\nFound at index ${chartIndex}:`)
      console.log(JSON.stringify(chart, null, 2))
      
      // Check leadingText specifically
      if (chart.leadingText !== undefined) {
        console.log(`\nleadingText type: ${Array.isArray(chart.leadingText) ? 'Array ❌' : typeof chart.leadingText}`)
        if (Array.isArray(chart.leadingText)) {
          console.log('leadingText content:', JSON.stringify(chart.leadingText, null, 2))
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
checkElproduktionSection()