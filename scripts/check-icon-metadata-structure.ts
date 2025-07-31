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

async function checkIconMetadataStructure() {
  console.log('🔍 Checking icon metadata structure in raw data...\n')
  
  try {
    const pageId = 'dPOYkdZ6jQJpSdo6MLX9d3'
    
    // Get raw data without any transformations
    const rawData = await client.fetch(`*[_id == "${pageId}"][0]`)
    
    if (!rawData) {
      console.error('❌ Page not found')
      return
    }
    
    // Find the valueProposition block
    const vpBlock = rawData.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    
    if (!vpBlock) {
      console.error('❌ No valueProposition block found')
      return
    }
    
    console.log('📊 Raw valueProposition data:')
    console.log(JSON.stringify(vpBlock, null, 2))
    
    // Check the icon structure in items
    if (vpBlock.items) {
      console.log('\n🔍 Analyzing icon metadata in items:')
      vpBlock.items.forEach((item: any, index: number) => {
        if (item.icon?.metadata) {
          console.log(`\nItem ${index + 1} - ${item.heading}:`)
          console.log('Icon metadata:', JSON.stringify(item.icon.metadata, null, 2))
          
          // Check the actual types
          Object.entries(item.icon.metadata).forEach(([key, value]) => {
            console.log(`- ${key}: type=${typeof value}, value=${JSON.stringify(value)}`)
          })
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run check
checkIconMetadataStructure()