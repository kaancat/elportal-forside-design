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

async function alignContentLeft() {
  console.log('🔧 Aligning all content blocks to the left...\n')
  
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_type == "page" && slug.current == "leverandoer-sammenligning"][0]`)
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }
    
    console.log('✅ Found page:', page.title)
    console.log('📋 Processing content blocks...\n')
    
    // Update all content blocks to have left alignment
    const updatedContentBlocks = page.contentBlocks.map((block: any, index: number) => {
      const updates: string[] = []
      
      // Handle different block types
      if (block._type === 'pageSection' && block.headerAlignment !== 'left') {
        updates.push(`headerAlignment: center → left`)
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      if (block._type === 'declarationGridmix' && block.headerAlignment !== 'left') {
        updates.push(`headerAlignment: ${block.headerAlignment} → left`)
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      if (block._type === 'consumptionMap' && block.headerAlignment !== 'left') {
        updates.push(`headerAlignment: ${block.headerAlignment} → left`)
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      if (block._type === 'featureList') {
        updates.push(`featureList (always left-aligned)`)
      }
      
      if (block._type === 'valueProposition') {
        updates.push(`valueProposition (always left-aligned)`)
      }
      
      if (updates.length > 0) {
        console.log(`✏️ Block ${index + 1} (${block._type}): ${updates.join(', ')}`)
      }
      
      return block
    })
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ All content blocks aligned to the left!')
    console.log('🔗 View at: https://dinelportal.dk/leverandoer-sammenligning')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

alignContentLeft()