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

async function testContentBlocksLogic() {
  console.log('🧪 Testing ContentBlocks logic for valueProposition...\n')
  
  try {
    // Fetch the page with all blocks
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[]{
        _key,
        _type
      }
    }`
    
    const page = await client.fetch(query)
    
    console.log('📦 Total blocks:', page.contentBlocks?.length)
    console.log('\n🔍 Simulating ContentBlocks.tsx logic:\n')
    
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`Block ${index}:`)
      console.log(`  _type: "${block._type}"`)
      console.log(`  _key: "${block._key}"`)
      
      // Simulate the exact logic from ContentBlocks.tsx
      if (block._type === 'valueProposition') {
        console.log(`  ✅ MATCH! Would render <ValuePropositionComponent />`)
      } else {
        console.log(`  ❌ No match for valueProposition`)
      }
      
      // Check for exact string match
      console.log(`  Exact match check: block._type === 'valueProposition' => ${block._type === 'valueProposition'}`)
      
      // Check character codes to ensure no hidden characters
      if (block._type === 'valueProposition' || block._type.includes('value')) {
        console.log(`  Character codes: [${Array.from(block._type).map(c => c.charCodeAt(0)).join(', ')}]`)
        console.log(`  Expected codes: [${Array.from('valueProposition').map(c => c.charCodeAt(0)).join(', ')}]`)
      }
      
      console.log('')
    })
    
    // Also check if there's any filtering happening
    console.log('🔍 Checking for FAQ grouping logic that might affect order:')
    
    let inFaqGroup = false
    let processedBlocks = 0
    
    page.contentBlocks?.forEach((block: any) => {
      if (block._type === 'faqItem') {
        if (!inFaqGroup) {
          inFaqGroup = true
          processedBlocks++ // FAQ group counts as one
        }
      } else {
        if (inFaqGroup) {
          inFaqGroup = false
        }
        processedBlocks++
      }
    })
    
    console.log(`Original blocks: ${page.contentBlocks?.length}`)
    console.log(`After FAQ grouping: ${processedBlocks}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run test
testContentBlocksLogic()