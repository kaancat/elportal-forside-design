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

async function debugNavigationIssue() {
  console.log('🔍 Debugging navigation issue...\n')
  
  // 1. Check if page exists
  const page = await client.fetch(`*[_id == "page.leverandoer-sammenligning"][0]{
    _id,
    _type,
    title,
    "slug": slug.current
  }`)
  
  if (page) {
    console.log('✅ Page exists:')
    console.log(`   ID: ${page._id}`)
    console.log(`   Title: ${page.title}`)
    console.log(`   Slug: ${page.slug}`)
  } else {
    console.log('❌ Page not found!')
  }
  
  // 2. Check siteSettings structure
  const siteSettings = await client.fetch(`*[_id == "siteSettings"][0]`)
  console.log('\n📋 Site Settings keys:', Object.keys(siteSettings || {}))
  
  // 3. Look for any navigation-related fields
  const possibleNavFields = ['navigation', 'headerNavigation', 'mainNavigation', 'headerLinks', 'menuItems']
  
  for (const field of possibleNavFields) {
    if (siteSettings?.[field]) {
      console.log(`\n✅ Found navigation field: ${field}`)
      console.log(JSON.stringify(siteSettings[field], null, 2).substring(0, 500) + '...')
    }
  }
  
  // 4. Check for references to our page
  const references = await client.fetch(`*[references("page.leverandoer-sammenligning")]{
    _id,
    _type,
    title
  }`)
  
  console.log('\n📎 Documents referencing our page:')
  references.forEach((ref: any) => {
    console.log(`   - ${ref._type}: ${ref._id} (${ref.title || 'no title'})`)
  })
  
  // 5. Try to find the actual navigation structure
  const navData = await client.fetch(`*[_id == "siteSettings"][0]{
    ...,
    "expandedRefs": *[references("page.leverandoer-sammenligning")]
  }`)
  
  console.log('\n🔗 Looking for navigation references in siteSettings...')
  
  // Search for our page ID in the entire siteSettings object
  const searchInObject = (obj: any, searchId: string, path = ''): void => {
    if (!obj) return
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes(searchId)) {
        console.log(`   Found reference at: ${path}.${key} = ${value}`)
      } else if (value && typeof value === 'object') {
        if (value._ref === searchId || value._ref === 'page.leverandoer-sammenligning') {
          console.log(`   Found reference at: ${path}.${key}._ref = ${value._ref}`)
        }
        searchInObject(value, searchId, `${path}.${key}`)
      }
    })
  }
  
  searchInObject(navData, 'page.leverandoer-sammenligning')
  
  console.log('\n💡 Summary:')
  console.log('The page exists with a hardcoded ID. Navigation should work if:')
  console.log('1. The navigation references pages by slug (which is "leverandoer-sammenligning")')
  console.log('2. OR the navigation uses the exact ID "page.leverandoer-sammenligning"')
  console.log('\nThe issue might be that navigation expects auto-generated IDs, not hardcoded ones.')
}

debugNavigationIssue()