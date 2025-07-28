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

async function restoreNavigation() {
  console.log('🔧 RESTORING NAVIGATION STRUCTURE\n')
  console.log('=' .repeat(80))
  
  try {
    // Get current siteSettings
    const currentSettings = await client.getDocument('siteSettings')
    
    if (!currentSettings) {
      throw new Error('No siteSettings found!')
    }
    
    console.log('📋 Current headerLinks:')
    console.log(`   ${currentSettings.headerLinks?.length || 0} items`)
    
    // Check if megaMenu already exists in headerLinks
    const hasMegaMenu = currentSettings.headerLinks?.some((item: any) => item._type === 'megaMenu')
    
    if (hasMegaMenu) {
      console.log('✅ Mega menu already exists in headerLinks')
      return
    }
    
    // Create the mega menu structure
    console.log('\n🔧 Creating mega menu structure...\n')
    
    const megaMenuStructure = {
      _key: generateKey(),
      _type: 'megaMenu',
      title: 'Bliv klogere',
      content: [
        {
          _key: generateKey(),
          _type: 'megaMenuColumn',
          title: 'Elpriser',
          items: [
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Aktuelle elpriser',
              description: 'Se de seneste elpriser time for time',
              internalLink: {
                _type: 'reference',
                _ref: 'I7aq0qw44tdJ3YglBpsP1G' // The merged energibesparende tips page
              }
            },
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Historiske elpriser',
              description: 'Se udviklingen i elpriser over tid',
              internalLink: {
                _type: 'reference',
                _ref: 'qgCxJyBbKpvhb2oGYjlhjr' // historiske-priser page
              }
            },
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Elpriser prognose',
              description: 'Forudsigelser for morgendagens priser',
              internalLink: {
                _type: 'reference',
                _ref: '1BrgDwXdqxJ08rMIoYfLjP' // prognoser page
              }
            }
          ]
        },
        {
          _key: generateKey(),
          _type: 'megaMenuColumn',
          title: 'Guides & Tips',
          items: [
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Energibesparende tips',
              description: 'Reducer dit elforbrug og spar penge',
              internalLink: {
                _type: 'reference',
                _ref: 'I7aq0qw44tdJ3YglBpsP1G' // energibesparende-tips page
              }
            },
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Ladeboks til elbil',
              description: 'Alt om ladebokse og installation',
              internalLink: {
                _type: 'reference',
                _ref: '1BrgDwXdqxJ08rMIon74wQ' // ladeboks page
              }
            },
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Grøn energi',
              description: 'Lær om vedvarende energikilder',
              externalLink: 'https://energinet.dk/groen-energi'
            }
          ]
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
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Elselskaber i Danmark',
              description: 'Se alle danske elleverandører',
              internalLink: {
                _type: 'reference',
                _ref: 'VSHpT5LY8yCKJBqG04Rlgm' // elselskaber page
              }
            },
            {
              _key: generateKey(),
              _type: 'megaMenuItem',
              title: 'Vindstød',
              description: 'Danmarks grønne elselskab',
              externalLink: 'https://vindstod.dk'
            }
          ]
        }
      ]
    }
    
    // Update headerLinks - preserve existing links and add megaMenu
    const updatedHeaderLinks = [...(currentSettings.headerLinks || [])]
    
    // Find where to insert the mega menu (typically before the last CTA button)
    const ctaIndex = updatedHeaderLinks.findIndex((item: any) => 
      item._type === 'link' && (item.isButton || item.title === 'Sammenlign Priser')
    )
    
    if (ctaIndex >= 0) {
      // Insert before the CTA
      updatedHeaderLinks.splice(ctaIndex, 0, megaMenuStructure)
    } else {
      // Add at the end
      updatedHeaderLinks.push(megaMenuStructure)
    }
    
    console.log('💾 Updating siteSettings with restored navigation...\n')
    
    // Use patch to only update headerLinks
    const result = await client
      .patch('siteSettings')
      .set({ headerLinks: updatedHeaderLinks })
      .commit()
    
    console.log('✅ Navigation restored successfully!')
    console.log(`   Total headerLinks: ${updatedHeaderLinks.length}`)
    console.log(`   Revision: ${result._rev}`)
    
    // Verify the restoration
    console.log('\n📋 Verification:')
    updatedHeaderLinks.forEach((item: any, index: number) => {
      if (item._type === 'link') {
        console.log(`   ${index + 1}. Link: ${item.title}`)
      } else if (item._type === 'megaMenu') {
        console.log(`   ${index + 1}. Mega Menu: ${item.title} (${item.content.length} columns)`)
      }
    })
    
    console.log('\n✅ Navigation has been fully restored!')
    console.log('\n⚠️  Important: The issue was caused by using .set() on the entire')
    console.log('   document in update-energibesparende-navigation.ts.')
    console.log('   Always use .patch() with specific fields to avoid data loss.')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run restoration
restoreNavigation().catch(console.error)