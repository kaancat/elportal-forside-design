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

async function checkPageIds() {
  console.log('Checking page IDs...\n')
  
  const pages = await client.fetch(`*[_type == "page"] | order(_createdAt desc) [0...10] {
    _id,
    _type,
    title,
    "slug": slug.current,
    _createdAt
  }`)
  
  console.log('Recent pages:')
  pages.forEach((page: any) => {
    console.log(`- ID: ${page._id}`)
    console.log(`  Title: ${page.title}`)
    console.log(`  Slug: ${page.slug}`)
    console.log(`  Created: ${page._createdAt}\n`)
  })

  // Check if our page exists with hardcoded ID
  const ourPage = await client.fetch(`*[_id == "page.leverandoer-sammenligning"][0]`)
  if (ourPage) {
    console.log('❌ Found page with hardcoded ID: page.leverandoer-sammenligning')
    console.log('This is likely why navigation is not working!')
  }
}

checkPageIds()