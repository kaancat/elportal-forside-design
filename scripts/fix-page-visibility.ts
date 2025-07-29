#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function fixPageVisibility() {
  console.log('🔧 Fixing page visibility issue...\n')
  
  // The issue is that documents created with createOrReplace using a hardcoded ID
  // might not be immediately visible to public queries. We need to force a re-index.
  
  console.log('📋 Current page status:')
  const page = await client.fetch(`*[_id == "page.leverandoer-sammenligning"][0]`)
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page exists with ID:', page._id)
  console.log('   Title:', page.title)
  
  // Force a re-index by doing a minor update
  console.log('\n🔄 Forcing re-index by updating the page...')
  
  try {
    // Add or update a timestamp field to force re-indexing
    const result = await client
      .patch('page.leverandoer-sammenligning')
      .set({ 
        _updatedAt: new Date().toISOString(),
        // Add a visibility marker
        '_visibility': 'public'
      })
      .commit()
    
    console.log('✅ Page updated successfully')
    
    // Test public access again
    console.log('\n🧪 Testing public access...')
    const publicClient = createClient({
      projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
      dataset: 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
    })
    
    const publicPage = await publicClient.fetch(
      `*[_type == "page" && slug.current == "leverandoer-sammenligning"][0] { _id, title }`
    )
    
    if (publicPage) {
      console.log('✅ Page is now publicly accessible!')
      console.log('\n🎉 The navigation link should work now!')
      console.log('📝 Note: It may take a minute for CDN caches to update.')
    } else {
      console.log('❌ Page still not publicly accessible.')
      console.log('\n💡 Alternative solution: Create a new page without hardcoded ID')
    }
    
  } catch (error) {
    console.error('❌ Error updating page:', error)
  }
}

fixPageVisibility()