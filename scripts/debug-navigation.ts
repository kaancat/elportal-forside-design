import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function debugNavigation() {
  console.log('🔍 Fetching site settings to debug navigation...\n')

  try {
    // Fetch complete site settings with expanded references
    const siteSettings = await client.fetch(`
      *[_type == "siteSettings"][0] {
        _id,
        _type,
        title,
        headerLinks[] {
          ...,
          _type,
          _key,
          // For links
          linkType,
          internalLink->{
            _id,
            _type,
            title,
            slug
          },
          externalUrl,
          // For mega menus
          content[] {
            ...,
            _type,
            _key,
            items[] {
              ...,
              _type,
              _key,
              link {
                ...,
                _type,
                linkType,
                internalLink->{
                  _id,
                  _type,
                  title,
                  slug
                },
                externalUrl
              }
            }
          }
        }
      }
    `)

    if (!siteSettings) {
      console.log('❌ No site settings document found!')
      return
    }

    console.log('📋 Site Settings Document:')
    console.log(JSON.stringify(siteSettings, null, 2))
    console.log('\n---\n')

    // Analyze headerLinks
    if (!siteSettings.headerLinks || siteSettings.headerLinks.length === 0) {
      console.log('⚠️  No header links found!')
    } else {
      console.log(`📌 Found ${siteSettings.headerLinks.length} header links:\n`)
      
      siteSettings.headerLinks.forEach((item: any, index: number) => {
        console.log(`\n[${index + 1}] ${item.title || 'Untitled'}`)
        console.log(`  Type: ${item._type}`)
        console.log(`  Key: ${item._key}`)
        
        // Check for validation issues
        const issues: string[] = []
        
        if (!item._type) {
          issues.push('Missing _type field')
        }
        
        if (!item._key) {
          issues.push('Missing _key field')
        }
        
        if (item._type === 'link') {
          if (!item.linkType) {
            issues.push('Missing linkType field')
          }
          if (item.linkType === 'internal' && !item.internalLink) {
            issues.push('Missing internalLink reference')
          }
          if (item.linkType === 'external' && !item.externalUrl) {
            issues.push('Missing externalUrl')
          }
        }
        
        if (item._type === 'megaMenu') {
          if (!item.content || !Array.isArray(item.content)) {
            issues.push('Missing or invalid content array')
          } else {
            item.content.forEach((column: any, colIndex: number) => {
              if (!column._type) {
                issues.push(`Column ${colIndex + 1}: Missing _type`)
              }
              if (!column.items || !Array.isArray(column.items)) {
                issues.push(`Column ${colIndex + 1}: Missing or invalid items array`)
              } else {
                column.items.forEach((menuItem: any, itemIndex: number) => {
                  if (!menuItem._type) {
                    issues.push(`Column ${colIndex + 1}, Item ${itemIndex + 1}: Missing _type`)
                  }
                  if (!menuItem.link) {
                    issues.push(`Column ${colIndex + 1}, Item ${itemIndex + 1}: Missing link`)
                  }
                })
              }
            })
          }
        }
        
        if (issues.length > 0) {
          console.log('  ⚠️  Issues found:')
          issues.forEach(issue => console.log(`    - ${issue}`))
        } else {
          console.log('  ✅ No validation issues')
        }
      })
    }

    // Check for any raw/malformed data
    console.log('\n📊 Data Structure Analysis:')
    const hasInvalidTypes = siteSettings.headerLinks.some((item: any) => 
      !item._type || (item._type !== 'link' && item._type !== 'megaMenu')
    )
    
    if (hasInvalidTypes) {
      console.log('❌ Found items with invalid or missing _type!')
      console.log('   Expected types: "link" or "megaMenu"')
    } else {
      console.log('✅ All items have valid _type fields')
    }

  } catch (error) {
    console.error('❌ Error fetching site settings:', error)
  }
}

// Run the debug script
debugNavigation().catch(console.error)