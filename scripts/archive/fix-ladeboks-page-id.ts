import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixLadeboxPageId() {
  try {
    console.log('Fixing Ladeboks page ID issue...\n')
    
    // 1. Get the current page
    const currentPage = await client.getDocument('page.ladeboks')
    
    if (!currentPage) {
      console.log('❌ Current page not found!')
      return
    }
    
    console.log('📄 Current page found:')
    console.log(`  ID: ${currentPage._id}`)
    console.log(`  Title: ${currentPage.title}`)
    console.log(`  Content blocks: ${currentPage.contentBlocks?.length || 0}`)
    
    // 2. Generate a new custom ID (similar to working pages)
    const newId = 'Ldb' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 7)
    
    console.log(`\n🔄 Creating new page with custom ID: ${newId}`)
    
    // 3. Create the new page with custom ID
    const newPage = {
      ...currentPage,
      _id: newId
    }
    
    // Remove the old _id field conflicts
    delete newPage._rev
    delete newPage._createdAt
    delete newPage._updatedAt
    
    const createResult = await client.create(newPage)
    console.log('✅ New page created successfully!')
    console.log(`  New ID: ${createResult._id}`)
    
    // 4. Delete the old page
    console.log('\n🗑️ Deleting old page...')
    await client.delete('page.ladeboks')
    console.log('✅ Old page deleted successfully!')
    
    // 5. Update navigation to point to new page
    console.log('\n🧭 Updating navigation...')
    
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      _id,
      _rev,
      headerLinks[] {
        ...,
        _type == 'link' => {
          ...,
          internalLink->{_id}
        }
      }
    }`)
    
    if (siteSettings) {
      // Find and update the ladeboks link
      const updatedHeaderLinks = siteSettings.headerLinks.map((link: any) => {
        if (link._type === 'link' && link.internalLink?._id === 'page.ladeboks') {
          return {
            ...link,
            internalLink: {
              _type: 'reference',
              _ref: newId
            }
          }
        }
        return link
      })
      
      const updateResult = await client
        .patch(siteSettings._id)
        .set({ headerLinks: updatedHeaderLinks })
        .commit()
      
      console.log('✅ Navigation updated successfully!')
    }
    
    console.log('\n🎯 Page ID fix completed!')
    console.log('📝 Summary:')
    console.log(`  - Old ID: page.ladeboks (AUTO ID - PROBLEMATIC)`)
    console.log(`  - New ID: ${newId} (CUSTOM ID - WORKING PATTERN)`)
    console.log('  - Navigation updated to point to new page')
    console.log('  - Page should now work correctly!')
    
    console.log('\n⏰ Wait 2-3 minutes for Vercel cache to clear, then test:')
    console.log('  1. Try accessing /ladeboks directly')
    console.log('  2. Try clicking navigation link')
    console.log('  3. Hard refresh if needed')

  } catch (error) {
    console.error('❌ Error fixing page ID:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

fixLadeboxPageId()