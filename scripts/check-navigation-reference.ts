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

async function checkNavigation() {
  console.log('Checking navigation structure...\n')
  
  // Get siteSettings
  const siteSettings = await client.fetch(`*[_id == "siteSettings"][0]{
    navigation{
      headerLinks[]{
        _type,
        linkText,
        linkType,
        externalUrl,
        "internalPageSlug": internalPage->slug.current,
        "internalPageId": internalPage->_id,
        subLinks[]{
          _type,
          linkText,
          linkType,
          externalUrl,
          "internalPageSlug": internalPage->slug.current,
          "internalPageId": internalPage->_id
        }
      }
    }
  }`)
  
  console.log('Navigation structure:')
  console.log(JSON.stringify(siteSettings, null, 2))
  
  // Check if any link references our page
  const findPageReferences = (links: any[], level = 0) => {
    const indent = '  '.repeat(level)
    links?.forEach(link => {
      if (link.internalPageSlug === 'leverandoer-sammenligning' || link.internalPageId === 'page.leverandoer-sammenligning') {
        console.log(`\n${indent}✅ Found reference to leverandoer-sammenligning:`)
        console.log(`${indent}   Text: ${link.linkText}`)
        console.log(`${indent}   Page ID: ${link.internalPageId}`)
        console.log(`${indent}   Slug: ${link.internalPageSlug}`)
      }
      if (link.subLinks) {
        findPageReferences(link.subLinks, level + 1)
      }
    })
  }
  
  console.log('\nSearching for leverandoer-sammenligning references:')
  findPageReferences(siteSettings?.navigation?.headerLinks)
}

checkNavigation()