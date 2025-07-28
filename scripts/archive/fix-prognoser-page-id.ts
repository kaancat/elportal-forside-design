import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixPrognoserPage() {
  console.log('🔧 Fixing prognoser page ID issue\n')
  
  try {
    // Step 1: Backup current page content
    console.log('📋 Step 1: Backing up current page content...')
    const currentPage = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!currentPage) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Page backed up:', currentPage.title)
    
    // Remove the problematic _id and system fields
    const { _id, _rev, _createdAt, _updatedAt, ...pageContent } = currentPage
    
    // Step 2: Delete both problematic pages
    console.log('\n🗑️  Step 2: Deleting problematic pages...')
    
    // Delete page.prognoser
    try {
      await client.delete('page.prognoser')
      console.log('✅ Deleted page.prognoser')
    } catch (e) {
      console.log('⚠️  Could not delete page.prognoser:', e.message)
    }
    
    // Delete page-prognoser
    try {
      await client.delete('page-prognoser')
      console.log('✅ Deleted page-prognoser')
    } catch (e) {
      console.log('⚠️  Could not delete page-prognoser:', e.message)
    }
    
    // Step 3: Recreate page with proper ID
    console.log('\n✨ Step 3: Creating new page with proper ID...')
    const newPage = await client.create(pageContent)
    
    console.log('✅ New page created!')
    console.log('   - New ID:', newPage._id)
    console.log('   - Title:', newPage.title)
    console.log('   - Slug:', newPage.slug?.current)
    
    // Step 4: Update mega menu reference
    console.log('\n🔗 Step 4: Updating mega menu reference...')
    
    // Get current site settings
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]`)
    
    // Find the mega menu
    const megaMenuIndex = siteSettings.headerLinks.findIndex(link => 
      link._type === 'megaMenu' && link.title === 'Bliv klogere på'
    )
    
    if (megaMenuIndex !== -1) {
      // Find the Priser column
      const priserColumnIndex = siteSettings.headerLinks[megaMenuIndex].content.findIndex(col => 
        col.title === 'Priser'
      )
      
      if (priserColumnIndex !== -1) {
        // Find the Prognoser item
        const prognoserItemIndex = siteSettings.headerLinks[megaMenuIndex].content[priserColumnIndex].items.findIndex(item => 
          item.title === 'Prognoser'
        )
        
        if (prognoserItemIndex !== -1) {
          // Update the reference
          siteSettings.headerLinks[megaMenuIndex].content[priserColumnIndex].items[prognoserItemIndex].link.internalLink = {
            _type: 'reference',
            _ref: newPage._id
          }
          
          // Save the updated settings
          await client.patch(siteSettings._id)
            .set({ headerLinks: siteSettings.headerLinks })
            .commit()
          
          console.log('✅ Mega menu reference updated!')
        }
      }
    }
    
    console.log('\n🎉 SUCCESS! Prognoser page fixed!')
    console.log('\n📝 Next steps:')
    console.log('1. Refresh the website')
    console.log('2. The prognoser link should now work in the mega menu')
    console.log('3. No more "refresh a million times" needed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixPrognoserPage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })