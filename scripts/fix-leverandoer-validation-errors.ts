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

// Helper to create proper icon metadata
const createIconMetadata = () => ({
  version: '0.469.0',
  license: {
    name: 'ISC',
    url: 'https://opensource.org/licenses/ISC'
  },
  author: {
    name: 'Lucide Contributors',
    url: 'https://github.com/lucide-icons/lucide/graphs/contributors'
  },
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  strokeWidth: 2,
  stroke: 'currentColor',
  fill: 'none'
})

async function fixValidationErrors() {
  console.log('🔧 Fixing validation errors in leverandoer-sammenligning page...\n')
  
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_type == "page" && slug.current == "leverandoer-sammenligning"][0]`)
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }
    
    console.log('✅ Found page:', page.title)
    
    // 1. Fix SEO Meta Title (under 60 characters)
    const newSeoTitle = 'Sammenlign Elselskaber 2025 - Find Bedste Elpris'
    console.log('\n📝 Fixing SEO Meta Title:')
    console.log(`   Old (${page.seoMetaTitle.length} chars): ${page.seoMetaTitle}`)
    console.log(`   New (${newSeoTitle.length} chars): ${newSeoTitle}`)
    
    // 2. Fix content blocks with icon issues
    console.log('\n🎨 Fixing icon metadata...')
    
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      // Fix Value Proposition icons
      if (block._type === 'valueProposition' && block.items) {
        console.log('   ✏️ Fixing Value Proposition icons')
        return {
          ...block,
          items: block.items.map((item: any) => ({
            ...item,
            icon: {
              ...item.icon,
              metadata: createIconMetadata()
            }
          }))
        }
      }
      
      // Fix Feature List icons
      if (block._type === 'featureList' && block.features) {
        console.log('   ✏️ Fixing Feature List icons')
        return {
          ...block,
          features: block.features.map((feature: any) => ({
            ...feature,
            icon: {
              ...feature.icon,
              metadata: createIconMetadata()
            }
          }))
        }
      }
      
      return block
    })
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ 
        seoMetaTitle: newSeoTitle,
        contentBlocks: updatedContentBlocks 
      })
      .commit()
    
    console.log('\n✅ All validation errors fixed!')
    console.log('   - SEO title shortened to under 60 characters')
    console.log('   - Icon metadata converted from strings to proper objects')
    console.log('\n🔗 View at: https://dinelportal.dk/leverandoer-sammenligning')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixValidationErrors()