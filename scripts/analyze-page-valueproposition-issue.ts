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

async function analyzePageValueProposition() {
  console.log('🔍 Analyzing valueProposition issue on page...\n')
  
  try {
    const pageId = 'dPOYkdZ6jQJpSdo6MLX9d3'
    
    // Fetch the page with all fields
    const query = `*[_id == "${pageId}" || _id == "drafts.${pageId}"][0]{
      _id,
      _type,
      title,
      slug,
      contentBlocks[_type == "valueProposition"]{
        _key,
        _type,
        heading,
        subheading,
        content,
        valueItems,
        // Also check deprecated fields
        title,
        items
      }
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found with ID:', pageId)
      return
    }
    
    console.log('📄 Page found:', page.title)
    console.log('📌 Page slug:', page.slug?.current)
    console.log('📦 ValueProposition blocks:', page.contentBlocks?.length || 0)
    
    if (page.contentBlocks && page.contentBlocks.length > 0) {
      page.contentBlocks.forEach((block: any, index: number) => {
        console.log(`\n🔍 ValueProposition Block ${index + 1}:`)
        console.log('Structure:', JSON.stringify(block, null, 2))
        
        // Check which fields are present
        console.log('\n📊 Field Analysis:')
        console.log('- heading (new):', !!block.heading, block.heading ? `"${block.heading}"` : '')
        console.log('- title (deprecated):', !!block.title)
        console.log('- valueItems (new):', !!block.valueItems, block.valueItems ? `${block.valueItems.length} items` : '')
        console.log('- items (deprecated):', !!block.items, block.items ? `${block.items.length} items` : '')
        
        // Check for icon metadata issues
        const itemsToCheck = block.items || block.valueItems || []
        if (itemsToCheck.length > 0) {
          console.log('\n🔍 Checking icon metadata:')
          itemsToCheck.forEach((item: any, i: number) => {
            if (item.icon?.metadata) {
              console.log(`\nItem ${i + 1} icon metadata:`)
              console.log('- authorInfo type:', typeof item.icon.metadata.authorInfo)
              console.log('- licenseInfo type:', typeof item.icon.metadata.licenseInfo)
              
              if (typeof item.icon.metadata.authorInfo === 'string') {
                console.log('❌ authorInfo is STRING (should be object)')
              }
              if (typeof item.icon.metadata.licenseInfo === 'string') {
                console.log('❌ licenseInfo is STRING (should be object)')
              }
            }
          })
        }
      })
    }
    
    console.log('\n💡 Diagnosis:')
    console.log('1. The errors show data is in deprecated "items" field')
    console.log('2. Icon metadata has wrong types (strings instead of objects)')
    console.log('3. Frontend works because component handles both old/new fields')
    console.log('4. Sanity Studio shows errors because of validation rules')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run analysis
analyzePageValueProposition()