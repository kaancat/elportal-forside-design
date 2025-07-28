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

async function findNavigationDocuments() {
  console.log('🔍 SEARCHING FOR ALL NAVIGATION-RELATED DOCUMENTS\n')
  console.log('=' .repeat(80))
  
  try {
    // Search for all document types that might be navigation-related
    console.log('📋 Searching for navigation documents...\n')
    
    // 1. Check all document types
    const allTypes = await client.fetch(`array::unique(*[]._type)`)
    console.log('All document types in dataset:')
    allTypes.forEach((type: string) => console.log(`  - ${type}`))
    
    // 2. Look for navigation-related types
    console.log('\n\n📋 Navigation-related documents:\n')
    
    const navigationTypes = ['megaMenu', 'navigation', 'mainNavigation', 'menu', 'headerNavigation']
    
    for (const type of navigationTypes) {
      const docs = await client.fetch(`*[_type == "${type}"] {
        _id,
        _type,
        title,
        name,
        ...
      }`)
      
      if (docs.length > 0) {
        console.log(`\n✅ Found ${docs.length} ${type} document(s):`)
        docs.forEach((doc: any) => {
          console.log(`   - ${doc.title || doc.name || doc._id}`)
          console.log(`     ID: ${doc._id}`)
          console.log(`     Type: ${doc._type}`)
          if (doc.items) {
            console.log(`     Items: ${doc.items.length} sections`)
          }
        })
      }
    }
    
    // 3. Check history of siteSettings to see what was referenced before
    console.log('\n\n📋 Checking siteSettings history for previous megaMenu reference...\n')
    
    // Get older revisions
    const query = `*[_id == "siteSettings"] | order(_updatedAt desc) [0...10] {
      _rev,
      _updatedAt,
      "hadMegaMenu": defined(megaMenu._ref),
      "megaMenuRef": megaMenu._ref
    }`
    
    const history = await client.fetch(query)
    
    console.log('Recent siteSettings revisions:')
    history.forEach((rev: any, index: number) => {
      console.log(`  ${index + 1}. ${rev._updatedAt}`)
      console.log(`     Rev: ${rev._rev}`)
      console.log(`     Had megaMenu: ${rev.hadMegaMenu}`)
      if (rev.megaMenuRef) {
        console.log(`     megaMenu ref: ${rev.megaMenuRef}`)
      }
    })
    
    // 4. Check for any orphaned navigation items
    console.log('\n\n📋 Checking for documents with navigation-like structure...\n')
    
    const navLikeQuery = `*[defined(items) && defined(links)] {
      _id,
      _type,
      title,
      "itemCount": count(items),
      "hasLinks": count(items[].links[]) > 0
    }`
    
    const navLikeDocs = await client.fetch(navLikeQuery)
    
    if (navLikeDocs.length > 0) {
      console.log('Documents with navigation-like structure:')
      navLikeDocs.forEach((doc: any) => {
        console.log(`  - ${doc.title || doc._id}`)
        console.log(`    Type: ${doc._type}`)
        console.log(`    Items: ${doc.itemCount}`)
        console.log(`    Has links: ${doc.hasLinks}`)
      })
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run search
findNavigationDocuments().catch(console.error)