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

async function checkHeaderLinks() {
  console.log('🔍 CHECKING NAVIGATION DATA IN SITESETTINGS\n')
  console.log('=' .repeat(80))
  
  try {
    // Get siteSettings with expanded references
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      _id,
      _rev,
      title,
      headerLinks[] {
        _key,
        title,
        "pageRef": page._ref,
        page->{
          _id,
          title,
          "slug": slug.current
        }
      },
      megaMenu,
      mainNavigation,
      navigation,
      ...
    }`)
    
    console.log('📋 Navigation Data in SiteSettings:\n')
    
    // Check headerLinks
    if (siteSettings.headerLinks && siteSettings.headerLinks.length > 0) {
      console.log(`Header Links (${siteSettings.headerLinks.length} items):`)
      siteSettings.headerLinks.forEach((link: any, index: number) => {
        console.log(`  ${index + 1}. ${link.title}`)
        if (link.page) {
          console.log(`     → ${link.page.title} (/${link.page.slug})`)
        } else if (link.pageRef) {
          console.log(`     → Page ref: ${link.pageRef} (NOT RESOLVED)`)
        } else {
          console.log(`     → No page linked`)
        }
      })
    } else {
      console.log('No headerLinks found')
    }
    
    // Check for any other navigation fields
    console.log('\n\nOther potential navigation fields:')
    Object.keys(siteSettings).forEach(key => {
      if (key.includes('nav') || key.includes('menu') || key.includes('Nav') || key.includes('Menu')) {
        console.log(`  - ${key}: ${typeof siteSettings[key]}`)
      }
    })
    
    // Check what update-energibesparende-navigation.ts might have done
    console.log('\n\n⚠️  ANALYSIS:')
    console.log('The update-energibesparende-navigation.ts script likely used .set()')
    console.log('on the entire document, which would have removed any fields not')
    console.log('included in the update object.')
    console.log('\nThis is why the megaMenu reference (and possibly other fields) disappeared.')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run check
checkHeaderLinks().catch(console.error)