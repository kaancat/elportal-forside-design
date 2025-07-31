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

// Replicate EXACT component logic
function simulateComponentLogic(block: any) {
  console.log('\n🎭 Simulating ValuePropositionComponent logic:')
  
  // Step 1: Check if block exists
  if (!block) {
    console.log('❌ Would return null: block is falsy')
    return false
  }
  console.log('✅ Pass: block exists')
  
  // Step 2: Extract items (exact logic from component)
  const items = block.valueItems || block.items || (block.propositions ? 
    block.propositions.map((text: string, index: number) => ({ 
      _key: `legacy-${index}`, 
      text, 
      icon: null 
    })) : 
    []
  )
  
  console.log(`   Items source: ${block.valueItems ? 'valueItems' : block.items ? 'items' : block.propositions ? 'propositions' : 'none'}`)
  console.log(`   Items count: ${items.length}`)
  
  // Step 3: Check if would return null
  if (!items || items.length === 0) {
    console.log('❌ Would return null: no items')
    return false
  }
  console.log('✅ Pass: has items')
  
  // Step 4: Check title
  const title = block.heading || block.title
  console.log(`   Title: "${title || 'NONE'}" (from ${block.heading ? 'heading' : block.title ? 'title' : 'none'})`)
  
  console.log('\n✅ Component WOULD render!')
  return true
}

async function finalCheck() {
  console.log('🔍 Final comprehensive valueProposition check...\n')
  
  try {
    // 1. Get the exact data
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[]{
        _key,
        _type,
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{
            _key,
            _type,
            heading,
            description,
            icon
          },
          // Also check for deprecated fields
          title,
          items,
          propositions
        }
      }
    }`
    
    const page = await client.fetch(query)
    const vpBlock = page.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    
    if (!vpBlock) {
      console.error('❌ No valueProposition found!')
      return
    }
    
    console.log('📊 Data structure:')
    console.log(JSON.stringify(vpBlock, null, 2))
    
    // 2. Simulate component logic
    const wouldRender = simulateComponentLogic(vpBlock)
    
    // 3. Check for any issues
    console.log('\n🔍 Potential issues:')
    
    // Check if items have required fields
    if (vpBlock.valueItems) {
      vpBlock.valueItems.forEach((item: any, i: number) => {
        if (!item._key) console.log(`❌ Item ${i} missing _key`)
        if (!item.heading && !item.text) console.log(`❌ Item ${i} missing heading/text`)
      })
    }
    
    // Check for type mismatches
    if (vpBlock.description && typeof vpBlock.description !== 'string') {
      console.log('❌ Description is not a string!')
    }
    
    // 4. Mystery check - what if the issue is elsewhere?
    console.log('\n🤔 Other possibilities:')
    console.log('- Component file not being bundled correctly?')
    console.log('- Runtime error in Icon component?')
    console.log('- CSS making it invisible?')
    console.log('- Parent container issue?')
    console.log('- Build/compilation issue?')
    
    // 5. Check if other similar components work
    const hasFeatureList = page.contentBlocks?.some((b: any) => b._type === 'featureList')
    const hasProviderList = page.contentBlocks?.some((b: any) => b._type === 'providerList')
    
    console.log('\n📋 Other components on same page:')
    console.log(`- featureList: ${hasFeatureList ? '✅ Present' : '❌ Not found'}`)
    console.log(`- providerList: ${hasProviderList ? '✅ Present' : '❌ Not found'}`)
    console.log('If these work but valueProposition doesn\'t, the issue is specific to this component')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run final check
finalCheck()