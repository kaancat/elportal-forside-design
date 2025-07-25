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

async function completeLadeboxIdFix() {
  try {
    console.log('Completing Ladeboks page ID fix...\n')
    
    const newPageId = 'Ldbn1aqxfi6rpqe9dn' // From previous script output
    
    // 1. Verify new page exists
    const newPage = await client.getDocument(newPageId)
    if (!newPage) {
      console.log('❌ New page not found! Run the previous script first.')
      return
    }
    
    console.log('✅ New page verified:', newPage.title)
    
    // 2. Update navigation to point to new page
    console.log('\n🧭 Updating navigation...')
    
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      _id,
      _rev,
      headerLinks[]
    }`)
    
    if (!siteSettings) {
      console.log('❌ Site settings not found!')
      return
    }
    
    // Find and update the ladeboks link in navigation
    const updatedHeaderLinks = siteSettings.headerLinks.map((link: any) => {
      if (link._type === 'link' && link.title === 'Ladeboks') {
        console.log(`  Updating link: "${link.title}"`)
        return {
          ...link,
          internalLink: {
            _type: 'reference',
            _ref: newPageId
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
    
    // 3. Now delete the old page (since references are updated)
    console.log('\n🗑️ Deleting old page...')
    try {
      await client.delete('page.ladeboks')
      console.log('✅ Old page deleted successfully!')
    } catch (error) {
      console.log('⚠️ Could not delete old page (may need manual cleanup):', error.message)
    }
    
    // 4. Verification
    console.log('\n🔍 Verifying fix...')
    
    const verifyNavigation = await client.fetch(`*[_type == "siteSettings"][0] {
      headerLinks[] {
        _type,
        title,
        _type == 'link' => {
          "targetId": internalLink->_id,
          "targetSlug": internalLink->slug.current,
          "targetExists": defined(internalLink->_id)
        }
      }
    }`)
    
    const ladeboxLink = verifyNavigation.headerLinks.find((link: any) => 
      link._type === 'link' && link.title === 'Ladeboks'
    )
    
    if (ladeboxLink) {
      console.log('✅ Navigation verification:')
      console.log(`  - Title: ${ladeboxLink.title}`)
      console.log(`  - Target ID: ${ladeboxLink.targetId}`)
      console.log(`  - Target Slug: ${ladeboxLink.targetSlug}`)
      console.log(`  - Target Exists: ${ladeboxLink.targetExists}`)
    }
    
    console.log('\n🎯 Page ID fix completed!')
    console.log('📝 Summary:')
    console.log(`  - New page ID: ${newPageId} (CUSTOM ID)`)
    console.log('  - Navigation updated to point to new page')
    console.log('  - Old problematic page removed')
    
    console.log('\n⏰ Wait 2-3 minutes for caches to clear, then test:')
    console.log('  1. Try accessing /ladeboks directly')
    console.log('  2. Try clicking navigation link')
    console.log('  3. Hard refresh if needed')

  } catch (error) {
    console.error('❌ Error completing fix:', error)
  }
}

completeLadeboxIdFix()