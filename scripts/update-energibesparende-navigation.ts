import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { ENERGIBESPARENDE_TIPS_PAGE_ID, OLD_PAGE_IDS } from './energibesparende-tips-reference'

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

async function updateNavigationReferences() {
  console.log('🔄 UPDATING NAVIGATION REFERENCES\n')
  console.log('=' .repeat(80))
  
  console.log('Old IDs to replace:')
  OLD_PAGE_IDS.forEach(id => console.log(`  - ${id}`))
  console.log(`New ID: ${ENERGIBESPARENDE_TIPS_PAGE_ID}\n`)
  
  try {
    // Step 1: Find all navigation documents that might have references
    console.log('📋 Step 1: Finding navigation references...\n')
    
    // Query for any documents that have references to the old page IDs
    const query = `*[
      _type in ["siteSettings", "megaMenu", "navigation"] && 
      references($oldId1) || references($oldId2)
    ] {
      _id,
      _type,
      title,
      "hasRef1": references($oldId1),
      "hasRef2": references($oldId2)
    }`
    
    const documentsWithRefs = await client.fetch(query, {
      oldId1: OLD_PAGE_IDS[0],
      oldId2: OLD_PAGE_IDS[1]
    })
    
    if (documentsWithRefs.length === 0) {
      console.log('✅ No navigation references found to update')
      console.log('   This might mean navigation uses slug-based routing instead of references')
      return
    }
    
    console.log(`Found ${documentsWithRefs.length} document(s) with references:\n`)
    
    // Step 2: Update each document
    for (const doc of documentsWithRefs) {
      console.log(`📄 Updating ${doc._type}: ${doc.title || doc._id}`)
      console.log(`   - Has reference to ID 1: ${doc.hasRef1}`)
      console.log(`   - Has reference to ID 2: ${doc.hasRef2}`)
      
      // Fetch the full document
      const fullDoc = await client.getDocument(doc._id)
      
      if (!fullDoc) {
        console.log('   ❌ Could not fetch full document')
        continue
      }
      
      // Deep update references in the document
      const updatedDoc = updateReferencesInObject(fullDoc, OLD_PAGE_IDS, ENERGIBESPARENDE_TIPS_PAGE_ID)
      
      // Check if any changes were made
      if (JSON.stringify(fullDoc) !== JSON.stringify(updatedDoc)) {
        // Apply the update
        try {
          await client
            .patch(doc._id)
            .set(updatedDoc)
            .commit()
          
          console.log('   ✅ Updated successfully\n')
        } catch (error) {
          console.log('   ❌ Update failed:', error.message)
        }
      } else {
        console.log('   ℹ️  No changes needed\n')
      }
    }
    
    // Step 3: Check mega menu specifically
    console.log('\n📋 Step 2: Checking mega menu items...\n')
    
    const megaMenuQuery = `*[_type == "megaMenu"] {
      _id,
      title,
      items[] {
        _key,
        title,
        links[] {
          _key,
          title,
          "pageRef": page._ref,
          "pageSlug": page->slug.current
        }
      }
    }`
    
    const megaMenus = await client.fetch(megaMenuQuery)
    
    for (const menu of megaMenus) {
      console.log(`📄 Mega Menu: ${menu.title}`)
      
      let hasUpdates = false
      const updatedItems = menu.items.map((section: any) => {
        const updatedLinks = section.links?.map((link: any) => {
          if (OLD_PAGE_IDS.includes(link.pageRef)) {
            console.log(`   ✅ Found reference in "${section.title}" → "${link.title}"`)
            hasUpdates = true
            return {
              ...link,
              page: {
                _type: 'reference',
                _ref: ENERGIBESPARENDE_TIPS_PAGE_ID
              }
            }
          }
          return link
        })
        
        return {
          ...section,
          links: updatedLinks
        }
      })
      
      if (hasUpdates) {
        await client
          .patch(menu._id)
          .set({ items: updatedItems })
          .commit()
        
        console.log('   ✅ Mega menu updated\n')
      } else {
        console.log('   ℹ️  No updates needed\n')
      }
    }
    
    console.log('✅ Navigation update complete!')
    console.log('\n📋 Next step: Verify the page works in navigation')
    console.log('   Then run: npx tsx scripts/delete-old-energibesparende-pages.ts')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Helper function to recursively update references in an object
function updateReferencesInObject(obj: any, oldIds: string[], newId: string): any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => updateReferencesInObject(item, oldIds, newId))
  }
  
  const updated: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_ref' && oldIds.includes(value as string)) {
      updated[key] = newId
    } else if (key === '_id' || key === '_rev' || key === '_type' || key === '_createdAt' || key === '_updatedAt') {
      // Skip system fields when doing set operations
      continue
    } else {
      updated[key] = updateReferencesInObject(value, oldIds, newId)
    }
  }
  
  return updated
}

// Run update
updateNavigationReferences().catch(console.error)