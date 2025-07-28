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

async function checkNavigationChanges() {
  console.log('🔍 CHECKING NAVIGATION/MENU STATE\n')
  console.log('=' .repeat(80))
  
  try {
    // Check site settings
    console.log('📋 Checking Site Settings...\n')
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      _id,
      _rev,
      title,
      megaMenu->{
        _id,
        _type,
        title,
        items[] {
          _key,
          title,
          links[] {
            _key,
            title,
            "pageRef": page._ref,
            "pageSlug": page->slug.current,
            "pageTitle": page->title
          }
        }
      }
    }`)
    
    if (siteSettings) {
      console.log('Site Settings:')
      console.log(`  ID: ${siteSettings._id}`)
      console.log(`  Title: ${siteSettings.title}`)
      console.log(`  Revision: ${siteSettings._rev}`)
      console.log()
      
      if (siteSettings.megaMenu) {
        console.log('Mega Menu:')
        console.log(`  ID: ${siteSettings.megaMenu._id}`)
        console.log(`  Title: ${siteSettings.megaMenu.title}`)
        console.log()
        
        console.log('Menu Sections:')
        siteSettings.megaMenu.items?.forEach((section: any, index: number) => {
          console.log(`\n  ${index + 1}. ${section.title}`)
          section.links?.forEach((link: any) => {
            console.log(`     - ${link.title}`)
            console.log(`       Page: ${link.pageTitle || 'NOT FOUND'}`)
            console.log(`       Slug: ${link.pageSlug || 'N/A'}`)
            console.log(`       Ref: ${link.pageRef}`)
          })
        })
      } else {
        console.log('⚠️  No mega menu reference found!')
      }
    }
    
    // Check for any broken references
    console.log('\n\n📋 Checking for Broken References...\n')
    
    const brokenRefs = await client.fetch(`*[_type == "siteSettings"][0] {
      megaMenu-> {
        items[] {
          title,
          links[] {
            title,
            "hasPage": defined(page._ref),
            "pageExists": defined(page->_id),
            "pageRef": page._ref
          }
        }
      }
    }`)
    
    if (brokenRefs?.megaMenu?.items) {
      let foundBroken = false
      brokenRefs.megaMenu.items.forEach((section: any) => {
        section.links?.forEach((link: any) => {
          if (link.hasPage && !link.pageExists) {
            console.log(`❌ BROKEN LINK: "${link.title}" in section "${section.title}"`)
            console.log(`   Reference: ${link.pageRef}`)
            foundBroken = true
          }
        })
      })
      
      if (!foundBroken) {
        console.log('✅ No broken references found')
      }
    }
    
    // Get revision history
    console.log('\n\n📋 Recent Changes to Site Settings...\n')
    
    const history = await client.fetch(`*[_id == "siteSettings"] | order(_updatedAt desc) [0...5] {
      _id,
      _rev,
      _updatedAt,
      title
    }`)
    
    console.log('Recent revisions:')
    history.forEach((rev: any, index: number) => {
      console.log(`  ${index + 1}. Updated: ${rev._updatedAt}`)
      console.log(`     Revision: ${rev._rev}`)
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run check
checkNavigationChanges().catch(console.error)