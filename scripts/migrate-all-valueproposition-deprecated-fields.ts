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

async function migrateAllValuePropositionFields() {
  console.log('🔧 Migrating all deprecated valueProposition fields...\n')
  
  try {
    // Get the pages that need fixing (from validation results)
    const pageIds = [
      '1BrgDwXdqxJ08rMIoYfLjP', // Elpriser 2025
      '80a93cd8-34a6-4041-8b4b-2f65424dcbc6', // Om os
      'drafts.qgCxJyBbKpvhb2oGYkdQx3', // Prognose draft
      'qgCxJyBbKpvhb2oGYkdQx3', // Prognose published
      'qgCxJyBbKpvhb2oGYqfgkp' // Sådan vælger
    ]
    
    let totalFixed = 0
    
    for (const pageId of pageIds) {
      console.log(`📄 Processing page: ${pageId}`)
      
      // Fetch the page
      const page = await client.fetch(`*[_id == "${pageId}"][0]`)
      
      if (!page) {
        console.log(`   ❌ Page not found, skipping`)
        continue
      }
      
      console.log(`   📝 Title: ${page.title}`)
      
      let pageModified = false
      const updatedContentBlocks = [...page.contentBlocks]
      
      // Process each valueProposition block
      for (let i = 0; i < updatedContentBlocks.length; i++) {
        const block = updatedContentBlocks[i]
        
        if (block._type === 'valueProposition') {
          console.log(`   🔍 Processing valueProposition block: ${block._key}`)
          let blockModified = false
          
          // Migrate title → heading
          if (block.title && !block.heading) {
            console.log(`      🔧 Migrating title → heading: "${block.title}"`)
            block.heading = block.title
            delete block.title
            blockModified = true
            totalFixed++
          }
          
          // Migrate items → valueItems
          if (block.items && !block.valueItems) {
            console.log(`      🔧 Migrating items → valueItems (${block.items.length} items)`)
            
            // Process each item in the items array
            const migratedItems = block.items.map((item: any, idx: number) => {
              console.log(`         📦 Item ${idx}: "${item.heading || item.title || 'Untitled'}"`)
              
              // Migrate item.title → item.heading if needed
              if (item.title && !item.heading) {
                console.log(`            🔧 Migrating item.title → item.heading: "${item.title}"`)
                item.heading = item.title
                delete item.title
              }
              
              return item
            })
            
            block.valueItems = migratedItems
            delete block.items
            blockModified = true
            totalFixed++
          }
          
          // Remove very old propositions field if it exists
          if (block.propositions) {
            console.log(`      🔧 Removing deprecated propositions field`)
            delete block.propositions
            blockModified = true
            totalFixed++
          }
          
          if (blockModified) {
            updatedContentBlocks[i] = block
            pageModified = true
          }
        }
      }
      
      // Save the page if it was modified
      if (pageModified) {
        console.log(`   💾 Saving updated page...`)
        
        const result = await client
          .patch(page._id)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        
        console.log(`   ✅ Updated! Revision: ${result._rev}`)
      } else {
        console.log(`   ✅ No changes needed`)
      }
      
      console.log('')
    }
    
    console.log('🎉 MIGRATION COMPLETE!')
    console.log(`   Total fixes applied: ${totalFixed}`)
    console.log(`   Pages processed: ${pageIds.length}`)
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Run the validation script again to confirm all issues are fixed')
    console.log('   2. Test the pages in Sanity Studio to ensure they display correctly')
    console.log('   3. Check the frontend to make sure all value propositions render properly')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run the migration
migrateAllValuePropositionFields()