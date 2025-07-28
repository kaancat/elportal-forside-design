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

async function checkEmbeddedMegaMenu() {
  console.log('🔍 CHECKING EMBEDDED MEGA MENU DATA\n')
  console.log('=' .repeat(80))
  
  try {
    // Get full siteSettings document
    const siteSettings = await client.getDocument('siteSettings')
    
    if (!siteSettings) {
      console.log('❌ No siteSettings found!')
      return
    }
    
    // Check megaMenu structure
    console.log('📋 Mega Menu Structure:\n')
    
    if (siteSettings.megaMenu) {
      console.log('megaMenu field type:', typeof siteSettings.megaMenu)
      console.log('\nFull megaMenu content:')
      console.log(JSON.stringify(siteSettings.megaMenu, null, 2))
      
      // If it's a reference
      if (siteSettings.megaMenu._ref) {
        console.log('\n✅ megaMenu is a reference to:', siteSettings.megaMenu._ref)
      }
      // If it's embedded
      else if (siteSettings.megaMenu.items) {
        console.log('\n✅ megaMenu is embedded with', siteSettings.megaMenu.items.length, 'sections')
      }
    } else {
      console.log('❌ No megaMenu field found')
    }
    
    // Check mainNavigation
    console.log('\n\n📋 Main Navigation Structure:\n')
    if (siteSettings.mainNavigation) {
      console.log('mainNavigation field type:', typeof siteSettings.mainNavigation)
      console.log('\nFull mainNavigation content:')
      console.log(JSON.stringify(siteSettings.mainNavigation, null, 2))
    }
    
    // Check navigation
    console.log('\n\n📋 Navigation Structure:\n')
    if (siteSettings.navigation) {
      console.log('navigation field type:', typeof siteSettings.navigation)
      console.log('\nFull navigation content:')
      console.log(JSON.stringify(siteSettings.navigation, null, 2))
    }
    
    // Show what needs to be restored
    console.log('\n\n🔧 RESTORATION NEEDED:')
    console.log('The megaMenu appears to have been corrupted.')
    console.log('It should either be:')
    console.log('1. A reference to a megaMenu document (if using separate documents)')
    console.log('2. An embedded object with items[] array containing navigation sections')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run check
checkEmbeddedMegaMenu().catch(console.error)