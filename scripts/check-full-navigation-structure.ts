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

async function checkFullNavigationStructure() {
  console.log('🔍 Checking full navigation structure...\n')
  
  // Get the exact query used by getSiteSettings
  const query = `*[_type == "siteSettings"][0] {
    ...,
    headerLinks[] {
      ...,
      _type == 'link' => {
        ...,
        internalLink->{ "slug": slug.current, _type }
      },
      _type == 'megaMenu' => {
        ...,
        content[] {
          ...,
          _type == 'megaMenuColumn' => {
            ...,
            items[] {
              ...,
              icon {
                ...,
                metadata {
                  inlineSvg,
                  iconName,
                  url,
                  color
                }
              },
              link {
                ...,
                linkType,
                title,
                externalUrl,
                internalLink->{ "slug": slug.current, _type }
              }
            }
          }
        }
      }
    }
  }`
  
  const siteSettings = await client.fetch(query)
  
  if (!siteSettings) {
    console.log('❌ No site settings found')
    return
  }
  
  console.log('📋 Header Links:')
  
  // Function to find our page in the navigation
  const findLeverandoerLink = (items: any[], path = '') => {
    items?.forEach((item, index) => {
      const currentPath = `${path}[${index}]`
      
      // Check direct link
      if (item._type === 'link' && item.internalLink?.slug === 'leverandoer-sammenligning') {
        console.log(`\n✅ Found leverandoer-sammenligning as direct link at ${currentPath}:`)
        console.log('   Title:', item.title)
        console.log('   Link Type:', item.linkType)
        console.log('   Internal Link:', item.internalLink)
      }
      
      // Check megaMenu
      if (item._type === 'megaMenu') {
        console.log(`\n📁 Mega Menu: ${item.title}`)
        item.content?.forEach((column: any, colIndex: number) => {
          if (column._type === 'megaMenuColumn') {
            console.log(`   📋 Column ${colIndex}: ${column.title || 'Untitled'}`)
            column.items?.forEach((megaItem: any, itemIndex: number) => {
              if (megaItem.link?.internalLink?.slug === 'leverandoer-sammenligning') {
                console.log(`\n✅ Found leverandoer-sammenligning in mega menu at ${currentPath}.content[${colIndex}].items[${itemIndex}]:`)
                console.log('      Title:', megaItem.title)
                console.log('      Link:', megaItem.link)
                console.log('      Link Type:', megaItem.link?.linkType)
                console.log('      Internal Link:', megaItem.link?.internalLink)
              }
            })
          }
        })
      }
    })
  }
  
  findLeverandoerLink(siteSettings.headerLinks, 'headerLinks')
  
  // Also check the raw query to see what's actually being fetched
  console.log('\n📊 Raw check - finding all references to our page:')
  const rawCheck = await client.fetch(`*[_type == "siteSettings"][0] {
    "refs": *[references("page.leverandoer-sammenligning")]
  }`)
  
  console.log('References found:', rawCheck.refs?.length || 0)
}

checkFullNavigationStructure()