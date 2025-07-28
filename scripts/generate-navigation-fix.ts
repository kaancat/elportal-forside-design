import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import * as fs from 'fs'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01'
})

async function generateNavigationFix() {
  console.log('🔧 Generating navigation fix data...\n')

  try {
    // Fetch the current site settings
    const siteSettings = await client.fetch(`
      *[_type == "siteSettings"][0] {
        _id,
        _type,
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

    console.log('📋 Analyzing navigation structure...\n')

    // Fix header links
    const fixedHeaderLinks = siteSettings.headerLinks.map((item: any) => {
      console.log(`Processing: ${item.title}`)

      // Handle megaMenu items
      if (item._type === 'megaMenu') {
        console.log('  ✅ MegaMenu - fixing menu items...')
        
        // Fix the mega menu items to use proper link structure
        const fixedContent = item.content.map((column: any) => ({
          _type: 'megaMenuColumn',
          _key: column._key,
          title: column.title,
          items: column.items.map((menuItem: any) => {
            const fixedItem: any = {
              _type: 'megaMenuItem',
              _key: menuItem._key,
              title: menuItem.title,
              description: menuItem.description
            }

            // Include icon if present
            if (menuItem.icon) {
              fixedItem.icon = menuItem.icon
            }

            // Create proper link object
            if (menuItem.internalLink) {
              fixedItem.link = {
                _type: 'link',
                _key: `link-${menuItem._key}`,
                title: menuItem.title,
                linkType: 'internal',
                internalLink: {
                  _type: 'reference',
                  _ref: menuItem.internalLink._ref || menuItem.internalLink._id
                }
              }
            } else if (menuItem.externalLink) {
              fixedItem.link = {
                _type: 'link',
                _key: `link-${menuItem._key}`,
                title: menuItem.title,
                linkType: 'external',
                externalUrl: menuItem.externalLink
              }
            }

            return fixedItem
          })
        }))

        return {
          _type: 'megaMenu',
          _key: item._key,
          title: item.title,
          content: fixedContent
        }
      }

      // Fix regular link items
      console.log('  🔧 Fixing link type...')
      
      // This is a link item, fix the _type
      const fixedItem: any = {
        _type: 'link',
        _key: item._key,
        title: item.title,
        linkType: item.linkType || (item.internalLink ? 'internal' : 'external')
      }

      // Copy relevant fields
      if (item.internalLink) {
        fixedItem.internalLink = {
          _type: 'reference',
          _ref: item.internalLink._id
        }
      }
      if (item.externalUrl) {
        fixedItem.externalUrl = item.externalUrl
      }
      if (item.isButton) {
        fixedItem.isButton = item.isButton
      }

      return fixedItem
    })

    // Save the fixed data to a file
    const outputPath = resolve(__dirname, '../navigation-fix.json')
    const fixData = {
      instructions: [
        "MANUAL FIX INSTRUCTIONS:",
        "1. Go to Sanity Studio: https://dinelportal.sanity.studio",
        "2. Navigate to Site Settings",
        "3. In the Header Navigation section, you need to:",
        "   - Delete all existing navigation items",
        "   - Re-add them with the correct structure below",
        "4. For each item in the 'headerLinks' array below:",
        "   - Add a new item",
        "   - Select the correct type (Link or Mega Menu)",
        "   - Fill in the fields as shown",
        "",
        "IMPORTANT: The main issue is that 'Link' items are missing their _type field.",
        "When adding links, make sure to select 'Link' from the dropdown."
      ],
      headerLinks: fixedHeaderLinks
    }

    fs.writeFileSync(outputPath, JSON.stringify(fixData, null, 2))

    console.log('\n✅ Fix data generated successfully!')
    console.log(`📄 Output saved to: ${outputPath}`)
    console.log('\n📋 Summary of fixes:')
    console.log(`   - Fixed ${fixedHeaderLinks.filter((i: any) => i._type === 'link').length} link items`)
    console.log(`   - Fixed ${fixedHeaderLinks.filter((i: any) => i._type === 'megaMenu').length} mega menu items`)
    console.log('\n🔧 Follow the instructions in the generated file to manually apply the fixes.')

    // Also create a more readable version
    const readablePath = resolve(__dirname, '../navigation-fix-readable.md')
    let readableContent = '# Navigation Fix Instructions\n\n'
    readableContent += '## Issue\n'
    readableContent += 'The navigation items in Sanity are missing their `_type` field, causing validation errors.\n\n'
    readableContent += '## Solution\n'
    readableContent += '1. Go to [Sanity Studio](https://dinelportal.sanity.studio)\n'
    readableContent += '2. Navigate to **Site Settings**\n'
    readableContent += '3. In the **Header Navigation** section:\n\n'
    
    readableContent += '### Delete all existing items and re-add them as follows:\n\n'
    
    fixedHeaderLinks.forEach((item: any, index: number) => {
      readableContent += `#### ${index + 1}. ${item.title}\n`
      if (item._type === 'link') {
        readableContent += `- Type: **Link**\n`
        readableContent += `- Link Type: **${item.linkType}**\n`
        if (item.linkType === 'internal' && item.internalLink) {
          const pageInfo = siteSettings.headerLinks[index].internalLink
          readableContent += `- Internal Page: **${pageInfo.title}**\n`
        }
        if (item.linkType === 'external' && item.externalUrl) {
          readableContent += `- External URL: **${item.externalUrl}**\n`
        }
        if (item.isButton) {
          readableContent += `- Is Button: **Yes** ✓\n`
        }
      } else if (item._type === 'megaMenu') {
        readableContent += `- Type: **Mega Menu**\n`
        readableContent += `- Columns:\n`
        item.content.forEach((column: any, colIndex: number) => {
          readableContent += `  - **${column.title || `Column ${colIndex + 1}`}**\n`
          column.items.forEach((menuItem: any) => {
            readableContent += `    - ${menuItem.title}\n`
          })
        })
      }
      readableContent += '\n'
    })

    fs.writeFileSync(readablePath, readableContent)
    console.log(`📝 Readable instructions saved to: ${readablePath}`)

  } catch (error) {
    console.error('❌ Error generating fix:', error)
  }
}

// Run the generator
generateNavigationFix().catch(console.error)