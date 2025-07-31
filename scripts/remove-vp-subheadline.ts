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

async function removeVPSubheadline() {
  console.log('🚀 Removing subheadline from Value Proposition...\n')

  try {
    // Fetch the current page
    const currentPage = await client.fetch(`
      *[_type == "page" && slug.current == "leverandoer-sammenligning"][0] {
        _id,
        contentBlocks
      }
    `)

    if (!currentPage) {
      console.log('❌ Page not found!')
      return
    }

    // Find VP block
    const vpIndex = currentPage.contentBlocks?.findIndex((b: any) => b._type === 'valueProposition')
    if (vpIndex < 0) {
      console.log('❌ Value Proposition block not found!')
      return
    }

    const vp = currentPage.contentBlocks[vpIndex]
    console.log('📦 Current VP block:')
    console.log(`- Has subheadline: ${vp.subheadline !== undefined}`)
    console.log(`- Has heading: ${vp.heading !== undefined}`)
    console.log(`- Items count: ${vp.items?.length || 0}`)

    // Create a clean VP block without subheadline
    const cleanVP = {
      _type: vp._type,
      _key: vp._key,
      heading: vp.heading,
      items: vp.items
    }

    // Update contentBlocks
    const updatedContentBlocks = [...currentPage.contentBlocks]
    updatedContentBlocks[vpIndex] = cleanVP

    // Patch the document to remove subheadline
    console.log('\n📝 Patching document to remove subheadline...')
    
    await client
      .patch(currentPage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Subheadline removed successfully!')

    // Verify
    const verify = await client.fetch(`
      *[_id == "${currentPage._id}"][0] {
        contentBlocks[_type == "valueProposition"][0] {
          _type,
          heading,
          subheadline,
          "itemCount": count(items)
        }
      }
    `)

    console.log('\n🔍 Verification:')
    const vpBlock = verify.contentBlocks?.[0]
    console.log(`- Has heading: ${vpBlock?.heading !== undefined}`)
    console.log(`- Has subheadline: ${vpBlock?.subheadline !== undefined}`)
    console.log(`- Items count: ${vpBlock?.itemCount || 0}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

removeVPSubheadline()