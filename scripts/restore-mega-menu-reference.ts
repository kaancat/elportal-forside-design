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

async function restoreMegaMenuReference() {
  console.log('🔧 RESTORING MEGA MENU REFERENCE\n')
  console.log('=' .repeat(80))
  
  try {
    // First, find the mega menu document
    console.log('📋 Step 1: Finding mega menu document...\n')
    
    const megaMenus = await client.fetch(`*[_type == "megaMenu"] {
      _id,
      title,
      items[] {
        title,
        "linkCount": count(links)
      }
    }`)
    
    if (megaMenus.length === 0) {
      throw new Error('No mega menu documents found!')
    }
    
    console.log(`Found ${megaMenus.length} mega menu(s):`)
    megaMenus.forEach((menu: any) => {
      console.log(`  - ${menu.title} (ID: ${menu._id})`)
      const totalLinks = menu.items.reduce((sum: number, item: any) => sum + (item.linkCount || 0), 0)
      console.log(`    ${menu.items.length} sections, ${totalLinks} total links`)
    })
    
    // Use the first (or most likely the only) mega menu
    const megaMenuId = megaMenus[0]._id
    console.log(`\n✅ Will restore reference to: ${megaMenus[0].title}`)
    
    // Step 2: Restore the reference in siteSettings
    console.log('\n📋 Step 2: Restoring mega menu reference in site settings...\n')
    
    const result = await client
      .patch('siteSettings')
      .set({
        megaMenu: {
          _type: 'reference',
          _ref: megaMenuId
        }
      })
      .commit()
    
    console.log('✅ Mega menu reference restored!')
    console.log(`   Revision: ${result._rev}`)
    
    // Step 3: Verify the restoration
    console.log('\n📋 Step 3: Verifying restoration...\n')
    
    const verification = await client.fetch(`*[_type == "siteSettings"][0] {
      title,
      megaMenu->{
        _id,
        title,
        "sectionCount": count(items),
        "totalLinks": count(items[].links[])
      }
    }`)
    
    if (verification?.megaMenu) {
      console.log('✅ Verification successful!')
      console.log(`   Site Settings: ${verification.title}`)
      console.log(`   Mega Menu: ${verification.megaMenu.title}`)
      console.log(`   Sections: ${verification.megaMenu.sectionCount}`)
      console.log(`   Total Links: ${verification.megaMenu.totalLinks}`)
    } else {
      console.log('❌ Verification failed - mega menu still not connected')
    }
    
    console.log('\n✅ Menu has been restored!')
    console.log('\n⚠️  Note: The update-energibesparende-navigation.ts script had a bug')
    console.log('   that removed fields when using .set() on the entire document.')
    console.log('   Future scripts should use .patch() with specific field updates only.')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run restoration
restoreMegaMenuReference().catch(console.error)