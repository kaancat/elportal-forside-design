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

function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

async function restoreNavigationWithValidRefs() {
  console.log('🔧 RESTORING NAVIGATION WITH VALID REFERENCES\n')
  console.log('=' .repeat(80))
  
  try {
    // First, get all available pages
    console.log('📋 Step 1: Finding all available pages...\n')
    
    const pages = await client.fetch(`*[_type == "page"] {
      _id,
      title,
      "slug": slug.current
    } | order(title asc)`)
    
    console.log(`Found ${pages.length} pages:`)
    const pageMap = new Map<string, any>()
    
    pages.forEach((page: any) => {
      console.log(`  - ${page.title} (${page.slug}) → ${page._id}`)
      pageMap.set(page.slug, page)
    })
    
    // Get current siteSettings
    console.log('\n📋 Step 2: Checking current navigation...\n')
    
    const currentSettings = await client.getDocument('siteSettings')
    
    if (!currentSettings) {
      throw new Error('No siteSettings found!')
    }
    
    console.log(`Current headerLinks: ${currentSettings.headerLinks?.length || 0} items`)
    
    // Check if megaMenu already exists
    const hasMegaMenu = currentSettings.headerLinks?.some((item: any) => item._type === 'megaMenu')
    
    if (hasMegaMenu) {
      console.log('✅ Mega menu already exists in headerLinks')
      return
    }
    
    // Create mega menu with valid references
    console.log('\n📋 Step 3: Creating mega menu with valid references...\n')
    
    const megaMenuStructure = {
      _key: generateKey(),
      _type: 'megaMenu',
      title: 'Bliv klogere',
      content: [
        {
          _key: generateKey(),
          _type: 'megaMenuColumn',
          title: 'Elpriser & Prognoser',
          items: [
            // Only add items with valid page references
            ...(pageMap.has('elpriser') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Aktuelle elpriser',
              description: 'Se de seneste elpriser time for time',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('elpriser')._id
              }
            }] : []),
            ...(pageMap.has('historiske-priser') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Historiske elpriser',
              description: 'Se udviklingen i elpriser over tid',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('historiske-priser')._id
              }
            }] : []),
            ...(pageMap.has('prognoser') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Elpriser prognose',
              description: 'Forudsigelser for morgendagens priser',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('prognoser')._id
              }
            }] : [])
          ].filter(item => item) // Remove empty items
        },
        {
          _key: generateKey(),
          _type: 'megaMenuColumn',
          title: 'Guides & Tips',
          items: [
            ...(pageMap.has('energibesparende-tips') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Energibesparende tips',
              description: 'Reducer dit elforbrug og spar penge',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('energibesparende-tips')._id
              }
            }] : []),
            ...(pageMap.has('ladeboks') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Ladeboks til elbil',
              description: 'Alt om ladebokse og installation',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('ladeboks')._id
              }
            }] : []),
            ...(pageMap.has('groen-energi') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Grøn energi',
              description: 'Lær om vedvarende energikilder',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('groen-energi')._id
              }
            }] : [{
              // Fallback to external link if page doesn't exist
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Grøn energi',
              description: 'Lær om vedvarende energikilder',
              externalLink: 'https://energinet.dk/groen-energi'
            }])
          ].filter(item => item)
        },
        {
          _key: generateKey(),
          _type: 'megaMenuColumn',
          title: 'Om elmarkedet',
          items: [
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Sådan fungerer elmarkedet',
              description: 'Forstå det danske elmarked',
              externalLink: 'https://energinet.dk'
            },
            ...(pageMap.has('elselskaber') ? [{
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Elselskaber i Danmark',
              description: 'Se alle danske elleverandører',
              internalLink: {
                _type: 'reference',
                _ref: pageMap.get('elselskaber')._id
              }
            }] : []),
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Vindstød',
              description: 'Danmarks grønne elselskab',
              externalLink: 'https://vindstod.dk'
            }
          ].filter(item => item)
        }
      ]
    }
    
    // Update headerLinks
    const updatedHeaderLinks = [...(currentSettings.headerLinks || [])]
    
    // Find where to insert (before CTA button)
    const ctaIndex = updatedHeaderLinks.findIndex((item: any) => 
      item._type === 'link' && (item.isButton || item.title === 'Sammenlign Priser')
    )
    
    if (ctaIndex >= 0) {
      updatedHeaderLinks.splice(ctaIndex, 0, megaMenuStructure)
    } else {
      updatedHeaderLinks.push(megaMenuStructure)
    }
    
    console.log('💾 Updating siteSettings...\n')
    
    const result = await client
      .patch('siteSettings')
      .set({ headerLinks: updatedHeaderLinks })
      .commit()
    
    console.log('✅ Navigation restored successfully!')
    console.log(`   Total headerLinks: ${updatedHeaderLinks.length}`)
    console.log(`   Revision: ${result._rev}`)
    
    // Show final structure
    console.log('\n📋 Final navigation structure:')
    updatedHeaderLinks.forEach((item: any, index: number) => {
      if (item._type === 'link') {
        console.log(`   ${index + 1}. Link: ${item.title}`)
      } else if (item._type === 'megaMenu') {
        console.log(`   ${index + 1}. Mega Menu: ${item.title}`)
        item.content.forEach((col: any) => {
          console.log(`      - ${col.title}: ${col.items.length} items`)
        })
      }
    })
    
    console.log('\n✅ Navigation fully restored with valid page references!')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
  }
}

// Run restoration
restoreNavigationWithValidRefs().catch(console.error)