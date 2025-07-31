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

async function testValuePropositionRender() {
  console.log('🧪 Testing ValueProposition component render logic...\n')
  
  try {
    // Fetch the exact data structure
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"]
    }`
    
    const result = await client.fetch(query)
    const block = result?.contentBlocks?.[0]
    
    if (!block) {
      console.error('❌ No valueProposition block found!')
      return
    }
    
    console.log('📊 Block data received:')
    console.log(JSON.stringify(block, null, 2))
    
    // Simulate component logic
    console.log('\n🎭 Simulating ValuePropositionComponent render logic:')
    
    // Check 1: if (!block)
    if (!block) {
      console.log('❌ Would return null: block is falsy')
      return
    }
    console.log('✅ Pass: block exists')
    
    // Check 2: Extract items
    const items = block.valueItems || block.items || (block.propositions ? 
      block.propositions.map((text: string, index: number) => ({ 
        _key: `legacy-${index}`, 
        text, 
        icon: null 
      })) : 
      []
    )
    
    console.log(`✅ Items extracted: ${items.length} items`)
    
    // Check 3: if (!items || items.length === 0)
    if (!items || items.length === 0) {
      console.log('❌ Would return null: no items found')
      return
    }
    console.log('✅ Pass: items exist and have length > 0')
    
    // Check 4: Title check
    const hasTitle = !!(block.heading || block.title)
    console.log(`✅ Has title: ${hasTitle} (heading: "${block.heading || ''}", title: "${block.title || ''}")`)
    
    console.log('\n🎯 RESULT: Component SHOULD render successfully!')
    console.log('The component has all required data to display.')
    
    // Additional checks
    console.log('\n📋 Additional component details:')
    console.log(`- Will show title: ${hasTitle ? 'YES' : 'NO'}`)
    console.log(`- Will show subheading: ${block.subheading ? 'YES' : 'NO'}`)
    console.log(`- Number of value items: ${items.length}`)
    
    items.forEach((item: any, i: number) => {
      console.log(`\n  Item ${i + 1}:`)
      console.log(`  - Text: "${item.heading || item.text}"`)
      console.log(`  - Has description: ${item.description ? 'YES' : 'NO'}`)
      console.log(`  - Has icon: ${item.icon ? 'YES' : 'NO'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run test
testValuePropositionRender()