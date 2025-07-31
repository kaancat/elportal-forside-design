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

async function debugValueProposition() {
  console.log('🔍 Debugging valueProposition data on historiske-priser page...')
  
  try {
    // Fetch the page
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _rev,
      title,
      contentBlocks
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page ID:', page._id)
    console.log('📄 Page Title:', page.title)
    console.log('📄 Total contentBlocks:', page.contentBlocks?.length || 0)
    
    // Find all valueProposition blocks
    const valuePropositions = page.contentBlocks?.filter((block: any, index: number) => {
      if (block._type === 'valueProposition') {
        console.log(`\n💎 Found valueProposition at index ${index}:`)
        console.log('   - Has heading:', !!block.heading)
        console.log('   - Has subheading:', !!block.subheading)
        console.log('   - Has content:', !!block.content)
        console.log('   - Has valueItems:', !!block.valueItems)
        console.log('   - ValueItems count:', block.valueItems?.length || 0)
        
        // Check deprecated fields
        console.log('\n   📌 Deprecated fields:')
        console.log('   - Has title:', !!block.title)
        console.log('   - Has items:', !!block.items)
        console.log('   - Has propositions:', !!block.propositions)
        
        // Check actual field values
        console.log('\n   📝 Field values:')
        console.log('   - heading:', block.heading || 'EMPTY')
        console.log('   - subheading:', block.subheading || 'EMPTY')
        console.log('   - content length:', block.content?.length || 0)
        console.log('   - title (deprecated):', block.title || 'EMPTY')
        
        return true
      }
      return false
    }) || []
    
    console.log(`\n📊 Summary: Found ${valuePropositions.length} valueProposition block(s)`)
    
    // Show raw JSON for first valueProposition
    if (valuePropositions.length > 0) {
      console.log('\n🔧 Raw JSON for first valueProposition:')
      console.log(JSON.stringify(valuePropositions[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the debug
debugValueProposition()