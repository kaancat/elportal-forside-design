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

async function checkSiteSettingsStructure() {
  console.log('🔍 CHECKING SITESETTINGS FULL STRUCTURE\n')
  console.log('=' .repeat(80))
  
  try {
    // Get the full siteSettings document
    const siteSettings = await client.getDocument('siteSettings')
    
    if (!siteSettings) {
      console.log('❌ No siteSettings document found!')
      return
    }
    
    console.log('📋 SiteSettings Document Structure:\n')
    console.log('Fields present:')
    Object.keys(siteSettings).forEach(key => {
      const value = siteSettings[key]
      const valueType = Array.isArray(value) ? 'array' : typeof value
      console.log(`  - ${key}: ${valueType}`)
      
      // If it's an array with navigation-like structure
      if (Array.isArray(value) && value.length > 0 && value[0].links) {
        console.log(`    → Looks like navigation data! ${value.length} sections`)
        value.forEach((section: any, index: number) => {
          console.log(`      ${index + 1}. ${section.title || 'Untitled'}: ${section.links?.length || 0} links`)
        })
      }
    })
    
    // Check the specific structure in detail
    console.log('\n\n📋 Detailed Structure:\n')
    console.log(JSON.stringify(siteSettings, null, 2))
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run check
checkSiteSettingsStructure().catch(console.error)