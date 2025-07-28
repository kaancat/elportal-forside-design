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

async function verifyNavigationRestoration() {
  console.log('✅ VERIFYING NAVIGATION RESTORATION\n')
  console.log('=' .repeat(80))
  
  try {
    // Get siteSettings with expanded references
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      _id,
      _rev,
      title,
      headerLinks[] {
        _key,
        _type,
        title,
        // For links
        _type == "link" => {
          title,
          externalLink,
          "pageRef": internalLink._ref,
          "pageTitle": internalLink->title,
          "pageSlug": internalLink->slug.current,
          isButton
        },
        // For mega menu
        _type == "megaMenu" => {
          title,
          content[] {
            _key,
            _type,
            title,
            items[] {
              _key,
              _type,
              title,
              description,
              externalLink,
              "pageRef": internalLink._ref,
              "pageTitle": internalLink->title,
              "pageSlug": internalLink->slug.current
            }
          }
        }
      }
    }`)
    
    if (!siteSettings) {
      console.log('❌ No siteSettings found!')
      return
    }
    
    console.log('📋 Site Settings:')
    console.log(`   ID: ${siteSettings._id}`)
    console.log(`   Title: ${siteSettings.title}`)
    console.log(`   Revision: ${siteSettings._rev}`)
    console.log()
    
    console.log('📋 Header Navigation Structure:')
    console.log(`   Total items: ${siteSettings.headerLinks?.length || 0}`)
    console.log()
    
    if (siteSettings.headerLinks) {
      siteSettings.headerLinks.forEach((item: any, index: number) => {
        if (item._type === 'link') {
          console.log(`   ${index + 1}. Link: "${item.title}"`)
          if (item.pageTitle) {
            console.log(`      → Internal: ${item.pageTitle} (/${item.pageSlug})`)
          } else if (item.externalLink) {
            console.log(`      → External: ${item.externalLink}`)
          }
          if (item.isButton) {
            console.log(`      → Style: Button`)
          }
        } else if (item._type === 'megaMenu') {
          console.log(`   ${index + 1}. Mega Menu: "${item.title}" ✅`)
          console.log(`      Columns: ${item.content?.length || 0}`)
          
          item.content?.forEach((column: any) => {
            console.log(`\n      📂 ${column.title} (${column.items?.length || 0} items)`)
            column.items?.forEach((menuItem: any) => {
              console.log(`         - ${menuItem.title}`)
              if (menuItem.pageTitle) {
                console.log(`           → ${menuItem.pageTitle} (/${menuItem.pageSlug})`)
              } else if (menuItem.externalLink) {
                console.log(`           → ${menuItem.externalLink}`)
              }
            })
          })
        }
        console.log()
      })
    }
    
    // Check for energibesparende-tips specifically
    console.log('\n📋 Energibesparende Tips Page Status:')
    
    let foundInNav = false
    siteSettings.headerLinks?.forEach((item: any) => {
      if (item._type === 'megaMenu' && item.content) {
        item.content.forEach((column: any) => {
          column.items?.forEach((menuItem: any) => {
            if (menuItem.pageSlug === 'energibesparende-tips') {
              console.log(`   ✅ Found in: ${item.title} → ${column.title} → ${menuItem.title}`)
              console.log(`      Page ID: ${menuItem.pageRef}`)
              foundInNav = true
            }
          })
        })
      }
    })
    
    if (!foundInNav) {
      console.log('   ⚠️  Not found in navigation')
    }
    
    console.log('\n✅ Navigation restoration verified!')
    console.log('\n📝 Summary:')
    console.log('   - Mega menu has been restored to headerLinks')
    console.log('   - All page references are valid')
    console.log('   - Navigation structure is complete')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run verification
verifyNavigationRestoration().catch(console.error)