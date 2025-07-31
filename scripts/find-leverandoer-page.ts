#!/usr/bin/env npm run tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

if (!process.env.VITE_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
  throw new Error('Missing required environment variables: VITE_SANITY_PROJECT_ID and SANITY_API_TOKEN')
}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function findLeverandoerPage() {
  console.log('🔍 Searching for leverandoer-sammenligning page...\n')

  try {
    // Search by slug
    const pageBySlug = await client.fetch(`
      *[_type == "page" && slug.current == "leverandoer-sammenligning"][0] {
        _id,
        _type,
        title,
        slug
      }
    `)

    if (pageBySlug) {
      console.log('✅ Found page by slug!')
      console.log(`ID: ${pageBySlug._id}`)
      console.log(`Title: ${pageBySlug.title}`)
      console.log(`Slug: ${pageBySlug.slug?.current}`)
      return
    }

    // Search by title pattern
    const pagesByTitle = await client.fetch(`
      *[_type == "page" && (title match "*leverandør*" || title match "*sammenlign*")] {
        _id,
        title,
        slug
      }
    `)

    if (pagesByTitle?.length > 0) {
      console.log('✅ Found pages by title match:')
      pagesByTitle.forEach((page: any) => {
        console.log(`\n- ID: ${page._id}`)
        console.log(`  Title: ${page.title}`)
        console.log(`  Slug: ${page.slug?.current}`)
      })
      return
    }

    // List all pages
    const allPages = await client.fetch(`
      *[_type == "page"] {
        _id,
        title,
        slug
      } | order(title asc)
    `)

    console.log('📄 All pages in the system:')
    allPages.forEach((page: any) => {
      console.log(`\n- ID: ${page._id}`)
      console.log(`  Title: ${page.title}`)
      console.log(`  Slug: ${page.slug?.current}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

findLeverandoerPage()