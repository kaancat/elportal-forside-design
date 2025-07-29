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

async function testPageFetch() {
  console.log('Testing page fetch by slug...\n')
  
  // Test the exact query used by getPageBySlug
  const query = `*[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug
  }`
  
  const page = await client.fetch(query, { slug: 'leverandoer-sammenligning' })
  
  if (page) {
    console.log('✅ Page can be fetched by slug!')
    console.log(`   ID: ${page._id}`)
    console.log(`   Title: ${page.title}`)
    console.log(`   Slug: ${page.slug.current}`)
    console.log('\n✅ The page should work in navigation!')
    console.log('   URL: https://dinelportal.dk/leverandoer-sammenligning')
  } else {
    console.log('❌ Page cannot be fetched by slug')
  }
  
  // Also test direct ID fetch
  const pageById = await client.fetch(`*[_id == "page.leverandoer-sammenligning"][0] { _id, title }`)
  console.log('\n📋 Direct ID fetch:', pageById ? '✅ Works' : '❌ Failed')
}

testPageFetch()