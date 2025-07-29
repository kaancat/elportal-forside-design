#!/usr/bin/env npx tsx

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
  throw new Error('Missing required environment variables')
}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Helper function to generate unique keys
const generateKey = () => Math.random().toString(36).substr(2, 9)

// Helper function to create text blocks
const createTextBlock = (text: string, style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' = 'normal') => ({
  _type: 'block',
  _key: generateKey(),
  style,
  children: [{
    _type: 'span',
    _key: generateKey(),
    text,
    marks: []
  }]
})

async function fixLeverandoerSammenligning() {
  console.log('🔧 Fixing Leverandør Sammenligning page issues...')

  try {
    // First, fetch the current page
    const currentPage = await client.fetch(`*[_id == "page.leverandoer-sammenligning"][0]`)
    
    if (!currentPage) {
      throw new Error('Page not found!')
    }

    console.log('📄 Found page, updating components...')

    // Find and update the valueProposition component
    const updatedContentBlocks = currentPage.contentBlocks.map((block: any) => {
      // Fix Value Proposition - add missing fields
      if (block._type === 'valueProposition') {
        console.log('✏️ Updating Value Proposition...')
        return {
          ...block,
          subheadline: 'Opdag fordelene ved at sammenligne og skifte elselskab',
          content: [
            createTextBlock('Med over 40 elselskaber på det danske marked kan det betale sig at bruge 5 minutter på at sammenligne priser og services. Vores platform gør det nemt at finde præcis det elselskab, der matcher dine behov - uanset om du prioriterer lave priser, grøn energi eller excellent kundeservice.')
          ]
        }
      }
      
      // Fix Feature List icons - ensure proper metadata
      if (block._type === 'featureList') {
        console.log('🎨 Fixing Feature List icons...')
        return {
          ...block,
          features: block.features.map((feature: any) => ({
            ...feature,
            icon: {
              _type: 'icon.manager',
              name: feature.icon?.name || 'circle',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors',
                width: 24,
                height: 24,
                viewBox: '0 0 24 24',
                strokeWidth: 2,
                stroke: 'currentColor',
                fill: 'none'
              }
            }
          }))
        }
      }
      
      return block
    })

    // Update the page
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Page updated successfully!')
    console.log('🔗 View at: https://dinelportal.dk/leverandoer-sammenligning')
    
  } catch (error) {
    console.error('❌ Update failed:', error)
    throw error
  }
}

// Execute fix
fixLeverandoerSammenligning()
  .then(() => {
    console.log('\n🎉 Fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fix failed with error:', error)
    process.exit(1)
  })