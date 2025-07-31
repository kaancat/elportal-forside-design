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

async function checkLeverandoerState() {
  console.log('🔍 Checking current state of leverandoer-sammenligning page...\n')

  try {
    // Fetch the page with all content blocks
    const page = await client.fetch(`
      *[_id == "page.leverandoer-sammenligning"][0] {
        _id,
        _type,
        title,
        slug,
        contentBlocks[] {
          _type,
          _key,
          ...select(
            _type == "heroWithCalculator" => {
              headline,
              subheadline,
              image
            },
            _type == "valueProposition" => {
              heading,
              subheadline,
              items[] {
                _key,
                heading,
                description,
                icon {
                  _type,
                  name,
                  manager,
                  metadata
                }
              }
            },
            _type == "featureList" => {
              title,
              subtitle,
              features[] {
                _key,
                title,
                description,
                icon {
                  _type,
                  name,
                  manager,
                  metadata
                }
              }
            },
            _type == "providerList" => {
              title,
              providers
            },
            {
              "summary": "Other component type: " + _type
            }
          )
        }
      }
    `)

    if (!page) {
      console.log('❌ Page not found!')
      return
    }

    console.log('📄 Page found!')
    console.log(`ID: ${page._id}`)
    console.log(`Title: ${page.title}`)
    console.log(`Slug: ${page.slug?.current}\n`)

    console.log('📦 Content blocks:')
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n${index + 1}. ${block._type} (key: ${block._key})`)
      
      if (block._type === 'heroWithCalculator') {
        console.log(`   Headline: ${block.headline || '❌ MISSING'}`)
        console.log(`   Subheadline: ${block.subheadline || '❌ MISSING'}`)
        console.log(`   Image: ${block.image ? '✅ Present' : '❌ MISSING'}`)
      }
      
      if (block._type === 'valueProposition') {
        console.log(`   Heading: ${block.heading || '❌ MISSING'}`)
        console.log(`   Subheadline: ${block.subheadline || '⚠️  Field not in schema'}`)
        console.log(`   Items: ${block.items?.length || 0}`)
        block.items?.forEach((item: any, i: number) => {
          console.log(`     ${i+1}. ${item.heading}`)
          console.log(`        Icon: ${item.icon?.name || '❌ MISSING'} (${item.icon?.manager || 'NO MANAGER'})`)
          if (item.icon && !item.icon.metadata) {
            console.log(`        ⚠️  Icon missing metadata!`)
          }
        })
      }
      
      if (block._type === 'featureList') {
        console.log(`   Title: ${block.title || '❌ MISSING'}`)
        console.log(`   Subtitle: ${block.subtitle || '❌ MISSING'}`)
        console.log(`   Features: ${block.features?.length || 0}`)
        block.features?.forEach((feature: any, i: number) => {
          console.log(`     ${i+1}. ${feature.title}`)
          console.log(`        Icon: ${feature.icon?.name || '❌ MISSING'} (${feature.icon?.manager || 'NO MANAGER'})`)
          if (feature.icon && !feature.icon.metadata) {
            console.log(`        ⚠️  Icon missing metadata!`)
          }
        })
      }
      
      if (block.summary) {
        console.log(`   ${block.summary}`)
      }
    })

    // Check for specific issues
    console.log('\n🚨 Issues Summary:')
    
    // Check hero
    const hero = page.contentBlocks?.find((b: any) => b._type === 'heroWithCalculator')
    if (!hero?.headline || !hero?.subheadline) {
      console.log('- Hero with Calculator: Missing headline/subheadline')
    }
    
    // Check value proposition
    const vp = page.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    if (vp) {
      if (vp.subheadline !== undefined) {
        console.log('- Value Proposition: Has invalid "subheadline" field (not in schema)')
      }
      const missingIcons = vp.items?.filter((item: any) => !item.icon || !item.icon.metadata)
      if (missingIcons?.length > 0) {
        console.log(`- Value Proposition: ${missingIcons.length} items with missing/invalid icons`)
      }
    }
    
    // Check feature list
    const fl = page.contentBlocks?.find((b: any) => b._type === 'featureList')
    if (fl) {
      const missingIcons = fl.features?.filter((f: any) => !f.icon || !f.icon.metadata)
      if (missingIcons?.length > 0) {
        console.log(`- Feature List: ${missingIcons.length} features with missing/invalid icons`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkLeverandoerState()