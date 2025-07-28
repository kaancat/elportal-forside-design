import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixNavigationValidation() {
  console.log('🔧 Starting navigation validation fix...\n')

  try {
    // Fetch the current site settings
    const siteSettings = await client.fetch(`
      *[_type == "siteSettings"][0] {
        _id,
        _type,
        title,
        description,
        colorThemes,
        logo,
        favicon,
        headerLinks,
        footerLinks
      }
    `)

    if (!siteSettings) {
      console.log('❌ No site settings document found!')
      return
    }

    console.log('📋 Current site settings retrieved')
    console.log(`🔗 Found ${siteSettings.headerLinks?.length || 0} header links\n`)

    // Fix header links
    const fixedHeaderLinks = siteSettings.headerLinks.map((item: any) => {
      console.log(`Processing: ${item.title}`)

      // Handle megaMenu items - they're already correct
      if (item._type === 'megaMenu') {
        console.log('  ✅ MegaMenu - fixing menu items...')
        
        // Fix the mega menu items to use proper link structure
        const fixedContent = item.content.map((column: any) => ({
          ...column,
          _type: 'megaMenuColumn',
          items: column.items.map((menuItem: any) => {
            const fixedItem: any = {
              _type: 'megaMenuItem',
              _key: menuItem._key,
              title: menuItem.title,
              description: menuItem.description,
              icon: menuItem.icon
            }

            // Create proper link object
            if (menuItem.internalLink) {
              fixedItem.link = {
                _type: 'link',
                _key: `${menuItem._key}-link`,
                title: menuItem.title,
                linkType: 'internal',
                internalLink: menuItem.internalLink
              }
            } else if (menuItem.externalLink) {
              fixedItem.link = {
                _type: 'link',
                _key: `${menuItem._key}-link`,
                title: menuItem.title,
                linkType: 'external',
                externalUrl: menuItem.externalLink
              }
            }

            return fixedItem
          })
        }))

        return {
          ...item,
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
        fixedItem.internalLink = item.internalLink
      }
      if (item.externalUrl) {
        fixedItem.externalUrl = item.externalUrl
      }
      if (item.isButton) {
        fixedItem.isButton = item.isButton
      }

      return fixedItem
    })

    console.log('\n📝 Updating site settings with fixed navigation...')

    // Update the site settings
    const result = await client
      .patch(siteSettings._id)
      .set({ headerLinks: fixedHeaderLinks })
      .commit()

    console.log('✅ Navigation validation fixed successfully!')
    console.log('\n🎉 All navigation items now have proper _type fields')
    console.log('🔄 Please refresh Sanity Studio to see the changes')

  } catch (error) {
    console.error('❌ Error fixing navigation:', error)
  }
}

// Run the fix
fixNavigationValidation().catch(console.error)