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

async function fixLeverandoerValueProposition() {
  console.log('🔧 Fixing leverandoer page valueProposition...\n')
  
  try {
    const pageId = 'dPOYkdZ6jQJpSdo6MLX9d3'
    
    // Fetch the page
    const query = `*[_id == "${pageId}"][0]{
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
    
    console.log('📄 Found page:', page.title)
    
    // Find and fix valueProposition blocks
    let fixedCount = 0
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'valueProposition') {
        console.log('\n💎 Found valueProposition block')
        console.log(`   - Has deprecated 'items': ${!!block.items} (${block.items?.length || 0} items)`)
        console.log(`   - Has valid 'valueItems': ${!!block.valueItems}`)
        console.log(`   - Has valid 'heading': ${!!block.heading}`)
        
        // Create migrated block
        const migratedBlock = { ...block }
        
        // Migrate items → valueItems
        if (block.items && !block.valueItems) {
          migratedBlock.valueItems = block.items
          delete migratedBlock.items
          console.log(`   ✅ Migrated: items → valueItems`)
        }
        
        // Clean up other deprecated fields
        if (migratedBlock.title) {
          delete migratedBlock.title
          console.log(`   ✅ Removed: deprecated title field`)
        }
        
        if (migratedBlock.propositions) {
          delete migratedBlock.propositions
          console.log(`   ✅ Removed: deprecated propositions field`)
        }
        
        fixedCount++
        return migratedBlock
      }
      return block
    })
    
    if (fixedCount === 0) {
      console.log('\n✅ No valueProposition blocks needed migration')
      return
    }
    
    console.log(`\n📊 Migrating ${fixedCount} valueProposition block(s)...`)
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ Migration completed successfully!')
    console.log(`📄 Document revision: ${result._rev}`)
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...')
    const updatedPage = await client.fetch(`*[_id == "${pageId}"][0]{ contentBlocks[_type == "valueProposition"] }`)
    const verifyBlock = updatedPage.contentBlocks?.[0]
    
    if (verifyBlock) {
      console.log('✅ Verification results:')
      console.log(`   - heading: ${!!verifyBlock.heading} "${verifyBlock.heading || 'EMPTY'}"`)
      console.log(`   - valueItems: ${!!verifyBlock.valueItems} (${verifyBlock.valueItems?.length || 0} items)`)
      console.log(`   - items (deprecated): ${!!verifyBlock.items}`)
      console.log(`   - title (deprecated): ${!!verifyBlock.title}`)
    }
    
    console.log('\n🎯 Sanity Studio should now show populated fields without validation errors!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the migration
fixLeverandoerValueProposition()