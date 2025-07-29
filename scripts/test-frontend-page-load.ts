#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: process.env.VITE_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // Same as frontend
  token: process.env.SANITY_API_TOKEN,
})

async function testFrontendPageLoad() {
  console.log('🧪 Testing exact frontend page load scenario...\n')
  
  // 1. Test the EXACT query used by getPageBySlug
  const pageQuery = `*[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    seoMetaTitle,
    seoMetaDescription,
    contentBlocks[] {
      ...,
      _type == "pageSection" => {
        ...,
        theme->{ 
          "background": background.hex,
          "text": text.hex,
          "primary": primary.hex
        },
        settings,
        content[]{ 
          ...,
          _type == "livePriceGraph" => {
            _key,
            _type,
            title
          }
        }
      }
    }
  }`
  
  console.log('📋 Testing with slug: leverandoer-sammenligning')
  console.log('🔍 Using exact frontend query...\n')
  
  const page = await client.fetch(pageQuery, { slug: 'leverandoer-sammenligning' })
  
  if (page) {
    console.log('✅ Page found successfully!')
    console.log(`   ID: ${page._id}`)
    console.log(`   Title: ${page.title}`)
    console.log(`   Slug: ${page.slug.current}`)
    console.log(`   Content blocks: ${page.contentBlocks?.length || 0}`)
    console.log('\n✅ The page SHOULD load in the frontend!')
  } else {
    console.log('❌ Page NOT found with the frontend query!')
    console.log('This explains why the link doesn\'t work.\n')
    
    // Let's debug why
    console.log('🔍 Debugging...')
    
    // Test without parameters
    const allPages = await client.fetch(`*[_type == "page"] { _id, "slug": slug.current, title }`)
    const ourPage = allPages.find((p: any) => p.slug === 'leverandoer-sammenligning')
    
    if (ourPage) {
      console.log('\n✅ Page exists in Sanity:')
      console.log(JSON.stringify(ourPage, null, 2))
      console.log('\n❌ But the parametrized query is failing!')
    } else {
      console.log('\n❌ Page doesn\'t exist with this slug!')
    }
  }
}

testFrontendPageLoad()