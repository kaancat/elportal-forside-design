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

async function migrateValuePropositionFields() {
  console.log('🔧 Migrating valueProposition from deprecated to valid fields...\n')
  
  try {
    // Fetch the page
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _rev,
      contentBlocks
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Found page, looking for valueProposition blocks...')
    
    let migratedCount = 0
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'valueProposition') {
        console.log(`\n💎 Found valueProposition block`)
        console.log(`   - Has deprecated 'title': ${!!block.title}`)
        console.log(`   - Has deprecated 'items': ${!!block.items} (${block.items?.length || 0} items)`)
        console.log(`   - Has valid 'heading': ${!!block.heading}`)
        console.log(`   - Has valid 'valueItems': ${!!block.valueItems}`)
        
        // Create migrated block
        const migratedBlock = { ...block }
        
        // Migrate title → heading
        if (block.title && !block.heading) {
          migratedBlock.heading = block.title
          delete migratedBlock.title
          console.log(`   ✅ Migrated: title → heading`)
        }
        
        // Migrate items → valueItems
        if (block.items && !block.valueItems) {
          migratedBlock.valueItems = block.items
          delete migratedBlock.items
          console.log(`   ✅ Migrated: items → valueItems`)
        }
        
        // Remove deprecated propositions field if present
        if (migratedBlock.propositions) {
          delete migratedBlock.propositions
          console.log(`   ✅ Removed: deprecated propositions field`)
        }
        
        migratedCount++
        return migratedBlock
      }
      return block
    })
    
    if (migratedCount === 0) {
      console.log('\n✅ No valueProposition blocks needed migration')
      return
    }
    
    console.log(`\n📊 Migrating ${migratedCount} valueProposition block(s)...`)
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ Migration completed successfully!')
    console.log(`📄 Document revision: ${result._rev}`)
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...')
    const updatedPage = await client.fetch(query)
    const verifyBlock = updatedPage.contentBlocks.find((b: any) => b._type === 'valueProposition')
    
    if (verifyBlock) {
      console.log('✅ Verification results:')
      console.log(`   - heading: ${!!verifyBlock.heading} "${verifyBlock.heading || 'EMPTY'}"`)
      console.log(`   - valueItems: ${!!verifyBlock.valueItems} (${verifyBlock.valueItems?.length || 0} items)`)
      console.log(`   - title (deprecated): ${!!verifyBlock.title}`)
      console.log(`   - items (deprecated): ${!!verifyBlock.items}`)
    }
    
    console.log('\n🎯 Studio should now show populated fields!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the migration
migrateValuePropositionFields()