#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

async function testPublicVsTokenAccess() {
  console.log('🧪 Testing public vs token access...\n')
  
  // Test with token (like our scripts)
  const clientWithToken = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: process.env.VITE_SANITY_API_VERSION || '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  })
  
  // Test without token (like the frontend)
  const clientWithoutToken = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: process.env.VITE_SANITY_API_VERSION || '2024-01-01',
    useCdn: false,
    // NO TOKEN - like frontend
  })
  
  const query = `*[_type == "page" && slug.current == $slug][0] { _id, title, "slug": slug.current }`
  const params = { slug: 'leverandoer-sammenligning' }
  
  console.log('📋 Testing with token (like our scripts):')
  try {
    const pageWithToken = await clientWithToken.fetch(query, params)
    console.log(pageWithToken ? '✅ Found' : '❌ Not found')
    if (pageWithToken) {
      console.log(`   ID: ${pageWithToken._id}`)
    }
  } catch (error) {
    console.log('❌ Error:', error)
  }
  
  console.log('\n📋 Testing WITHOUT token (like frontend):')
  try {
    const pageWithoutToken = await clientWithoutToken.fetch(query, params)
    console.log(pageWithoutToken ? '✅ Found' : '❌ Not found')
    if (pageWithoutToken) {
      console.log(`   ID: ${pageWithoutToken._id}`)
    }
  } catch (error) {
    console.log('❌ Error:', error)
  }
  
  // Also check if the page is published (not a draft)
  console.log('\n📋 Checking if page is a draft:')
  const draftCheck = await clientWithToken.fetch(`*[_id in ["page.leverandoer-sammenligning", "drafts.page.leverandoer-sammenligning"]] { _id }`)
  draftCheck.forEach((doc: any) => {
    console.log(`   ${doc._id.startsWith('drafts.') ? '📝 DRAFT' : '✅ PUBLISHED'}: ${doc._id}`)
  })
}

testPublicVsTokenAccess()