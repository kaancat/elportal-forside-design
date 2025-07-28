import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { ENERGIBESPARENDE_TIPS_PAGE_ID, OLD_PAGE_IDS } from './energibesparende-tips-reference'

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

async function deleteOldPages() {
  console.log('🗑️  DELETING OLD ENERGIBESPARENDE TIPS PAGES\n')
  console.log('=' .repeat(80))
  
  console.log('⚠️  WARNING: This will permanently delete:')
  OLD_PAGE_IDS.forEach(id => console.log(`   - ${id}`))
  console.log()
  console.log(`✅ Keeping new page: ${ENERGIBESPARENDE_TIPS_PAGE_ID}`)
  console.log()
  
  // Add a confirmation prompt
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  try {
    // Final check - ensure new page exists
    console.log('\n🔍 Final safety check...')
    const newPage = await client.getDocument(ENERGIBESPARENDE_TIPS_PAGE_ID)
    
    if (!newPage) {
      throw new Error('New page not found! Aborting deletion for safety.')
    }
    
    console.log('✅ New page verified:', newPage.title)
    console.log()
    
    // Delete old pages
    for (const oldId of OLD_PAGE_IDS) {
      console.log(`🗑️  Deleting ${oldId}...`)
      
      try {
        // Check if document exists before trying to delete
        const doc = await client.getDocument(oldId)
        
        if (!doc) {
          console.log('   ℹ️  Document not found (might already be deleted)')
          continue
        }
        
        // Delete the document
        await client.delete(oldId)
        console.log('   ✅ Deleted successfully')
        
      } catch (error: any) {
        if (error.statusCode === 404) {
          console.log('   ℹ️  Document already deleted')
        } else {
          console.log('   ❌ Error:', error.message)
        }
      }
    }
    
    console.log('\n✅ Cleanup complete!')
    console.log()
    
    // Update deployment scripts
    console.log('📝 Final steps:')
    console.log('1. Update deployment scripts to use the new page ID:')
    console.log(`   - Update scripts/validate-energibesparende-tips-page.ts`)
    console.log(`   - Set PAGE_ID = '${ENERGIBESPARENDE_TIPS_PAGE_ID}'`)
    console.log()
    console.log('2. Update any other scripts that reference the old IDs')
    console.log()
    console.log('3. Consider updating deploy-energibesparende-tips.ts to use createOrReplace')
    console.log('   with a proper slug-based ID to prevent future duplicates')
    
    // Clean up reference file
    console.log('\n🧹 Cleaning up temporary reference file...')
    const fs = await import('fs')
    await fs.promises.unlink('scripts/energibesparende-tips-reference.ts')
    console.log('✅ Reference file deleted')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.log('\n⚠️  Deletion aborted for safety')
  }
}

// Run deletion
deleteOldPages().catch(console.error)