import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function recreateHistoriskePriser() {
  console.log('🔧 Recreating Historiske Priser page with valid ID\n')
  
  // 1. Get the broken page content
  console.log('📄 Fetching broken page content...')
  const brokenPage = await client.fetch(`
    *[_id == "page.historiske-priser"][0]
  `)
  
  if (!brokenPage) {
    console.log('❌ Could not find the broken page')
    return
  }
  
  console.log(`✅ Found page: ${brokenPage.title}`)
  
  // 2. Create a new page with the same content but valid ID
  console.log('\n🔨 Creating new page with valid ID...')
  
  // Remove the broken _id and other system fields
  const { _id, _rev, _createdAt, _updatedAt, ...pageContent } = brokenPage
  
  try {
    // Create new page (Sanity will generate a valid ID)
    const newPage = await client.create({
      _type: 'page',
      ...pageContent
    })
    
    console.log(`\n✅ Successfully created new page!`)
    console.log(`   New ID: ${newPage._id}`)
    console.log(`   Title: ${newPage.title}`)
    console.log(`   Slug: /${pageContent.slug.current}`)
    
    // 3. Update the mega menu reference
    console.log('\n🔗 Updating mega menu reference...')
    
    // Find the site settings
    const siteSettings = await client.fetch(`
      *[_type == "siteSettings"][0]
    `)
    
    // Find and update the reference
    let updated = false
    const updatedHeaderLinks = siteSettings.headerLinks.map((link: any) => {
      if (link._type === 'megaMenu') {
        const updatedContent = link.content.map((column: any) => {
          const updatedItems = column.items.map((item: any) => {
            if (item.title === 'Historiske priser' && 
                item.link?.internalLink?._ref === 'page.historiske-priser') {
              updated = true
              return {
                ...item,
                link: {
                  ...item.link,
                  internalLink: {
                    _type: 'reference',
                    _ref: newPage._id
                  }
                }
              }
            }
            return item
          })
          return { ...column, items: updatedItems }
        })
        return { ...link, content: updatedContent }
      }
      return link
    })
    
    if (updated) {
      await client
        .patch(siteSettings._id)
        .set({ headerLinks: updatedHeaderLinks })
        .commit()
      
      console.log('✅ Updated mega menu reference!')
    }
    
    // 4. Delete the broken page (optional)
    console.log('\n🗑️  Deleting the broken page...')
    try {
      await client.delete('page.historiske-priser')
      console.log('✅ Deleted broken page')
    } catch (error) {
      console.log('⚠️  Could not delete broken page (it might not exist)')
    }
    
    console.log('\n🎉 Success! The "Historiske priser" link should now work!')
    console.log('\n📝 Next steps:')
    console.log('   1. Refresh your browser')
    console.log('   2. Try clicking "Bliv klogere på > Priser > Historiske priser"')
    console.log('   3. The page should now load correctly!')
    
  } catch (error) {
    console.error('\n❌ Error creating new page:', error)
  }
}

recreateHistoriskePriser().catch(console.error)