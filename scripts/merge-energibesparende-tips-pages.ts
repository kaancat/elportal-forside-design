import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Document IDs
const DOCUMENT_1_ID = 'qgCxJyBbKpvhb2oGYpYKuf' // Random ID (has validation error)
const DOCUMENT_2_ID = 'page.energibesparende-tips' // Custom ID (more content, but breaks navigation)

function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

async function mergePages() {
  console.log('🔀 MERGING ENERGIBESPARENDE TIPS PAGES\n')
  console.log('=' .repeat(80))
  
  try {
    // Step 1: Fetch both documents
    console.log('📄 Step 1: Fetching both documents...\n')
    
    const [doc1, doc2] = await Promise.all([
      client.getDocument(DOCUMENT_1_ID),
      client.getDocument(DOCUMENT_2_ID)
    ])
    
    if (!doc2) {
      throw new Error('Document 2 (preferred content) not found!')
    }
    
    console.log('✅ Document 2 found:', doc2.title)
    console.log('✅ Document 1 found:', doc1?.title || 'Not found')
    console.log()
    
    // Step 2: Prepare merged content starting with Document 2
    console.log('🔧 Step 2: Preparing merged content...\n')
    
    // Remove system fields from doc2
    const { _id, _rev, _createdAt, _updatedAt, _type, ...doc2Content } = doc2
    
    // Start with all content from Document 2
    const mergedContent = {
      _type: 'page',
      ...doc2Content
    }
    
    // Step 3: Add unique valuable blocks from Document 1
    if (doc1 && doc1.contentBlocks) {
      console.log('📊 Adding unique blocks from Document 1...\n')
      
      // Find the index where we should insert additional blocks
      // We'll add them after the applianceCalculator and before the provider list
      const providerListIndex = mergedContent.contentBlocks.findIndex(
        (block: any) => block._type === 'providerList'
      )
      
      const insertIndex = providerListIndex !== -1 ? providerListIndex : mergedContent.contentBlocks.length
      
      // Blocks to add from Document 1
      const blocksToAdd = []
      
      // 1. RenewableEnergyForecast - valuable for showing green energy timing
      const renewableBlock = doc1.contentBlocks.find((b: any) => b._type === 'renewableEnergyForecast')
      if (renewableBlock) {
        console.log('  ✅ Adding renewableEnergyForecast block')
        blocksToAdd.push({
          ...renewableBlock,
          _key: generateKey() // Generate new key to avoid conflicts
        })
      }
      
      // 2. CO2EmissionsChart - shows environmental impact
      const co2Block = doc1.contentBlocks.find((b: any) => b._type === 'co2EmissionsChart')
      if (co2Block) {
        console.log('  ✅ Adding co2EmissionsChart block')
        blocksToAdd.push({
          ...co2Block,
          _key: generateKey()
        })
      }
      
      // 3. ValueProposition - if it has unique content
      const valueBlock = doc1.contentBlocks.find((b: any) => b._type === 'valueProposition')
      if (valueBlock) {
        console.log('  ✅ Adding valueProposition block')
        blocksToAdd.push({
          ...valueBlock,
          _key: generateKey()
        })
      }
      
      // Insert the blocks
      if (blocksToAdd.length > 0) {
        mergedContent.contentBlocks.splice(insertIndex, 0, ...blocksToAdd)
        console.log(`\n  Added ${blocksToAdd.length} unique blocks from Document 1`)
      }
      
      // Note: We're NOT adding priceCalculatorWidget as it's causing validation error
      // and applianceCalculator from doc2 serves the same purpose
      console.log('  ⚠️  Skipping priceCalculatorWidget (validation error)')
    }
    
    // Step 4: Create the new page with Sanity-generated ID
    console.log('\n💾 Step 3: Creating new page with proper ID...\n')
    
    const newPage = await client.create(mergedContent)
    
    console.log('✅ New page created successfully!')
    console.log('🆔 New Page ID:', newPage._id)
    console.log('📋 Title:', newPage.title)
    console.log('🔗 Slug:', newPage.slug.current)
    console.log('📊 Total content blocks:', newPage.contentBlocks.length)
    console.log()
    
    // Step 5: Show what needs to be done next
    console.log('📋 NEXT STEPS')
    console.log('=' .repeat(40))
    console.log('1. Update navigation references:')
    console.log(`   - Old ID 1: ${DOCUMENT_1_ID}`)
    console.log(`   - Old ID 2: ${DOCUMENT_2_ID}`)
    console.log(`   - New ID: ${newPage._id}`)
    console.log()
    console.log('2. Run navigation update script:')
    console.log('   npx tsx scripts/update-energibesparende-navigation.ts')
    console.log()
    console.log('3. Verify in Sanity Studio:')
    console.log(`   https://dinelportal.sanity.studio/structure/page;${newPage._id}`)
    console.log()
    console.log('4. After verification, delete old documents:')
    console.log('   npx tsx scripts/delete-old-energibesparende-pages.ts')
    console.log()
    
    // Save the new page ID for other scripts
    console.log('📝 Creating reference file...')
    const fs = await import('fs')
    const referenceContent = `// Auto-generated reference file
export const ENERGIBESPARENDE_TIPS_PAGE_ID = '${newPage._id}'
export const OLD_PAGE_IDS = [
  '${DOCUMENT_1_ID}',
  '${DOCUMENT_2_ID}'
]
`
    await fs.promises.writeFile(
      'scripts/energibesparende-tips-reference.ts',
      referenceContent
    )
    console.log('✅ Reference file created: scripts/energibesparende-tips-reference.ts')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
  }
}

// Run merge
mergePages().catch(console.error)