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

async function completeNavigationFix() {
  console.log('🔧 Starting complete navigation fix...\n')

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
    const fixedHeaderLinks = siteSettings.headerLinks.map((item: any, index: number) => {
      console.log(`Processing [${index + 1}]: ${item.title}`)

      // Special handling for "Bliv klogere på" - it should be a megaMenu
      if (item.title === "Bliv klogere på" && item.content && item.content.length > 0) {
        console.log('  🔧 Converting to MegaMenu...')
        
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
            if (menuItem.link?.internalLink || menuItem.internalLink) {
              fixedItem.link = {
                _type: 'link',
                _key: `${menuItem._key}-link`,
                title: menuItem.link?.title || menuItem.title,
                linkType: 'internal',
                internalLink: menuItem.link?.internalLink || menuItem.internalLink
              }
            } else if (menuItem.link?.externalUrl || menuItem.externalUrl) {
              fixedItem.link = {
                _type: 'link',
                _key: `${menuItem._key}-link`,
                title: menuItem.link?.title || menuItem.title,
                linkType: 'external',
                externalUrl: menuItem.link?.externalUrl || menuItem.externalUrl
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

      // Handle megaMenu items - they're already typed correctly
      if (item._type === 'megaMenu') {
        console.log('  ✅ Already a MegaMenu')
        return item
      }

      // Fix regular link items
      console.log('  🔧 Fixing as Link...')
      
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

    console.log('✅ Navigation completely fixed!')
    console.log('\n🎉 All navigation items now have proper _type fields')
    console.log('   - Regular links have _type: "link"')
    console.log('   - Dropdown menus have _type: "megaMenu"')
    console.log('🔄 Please refresh Sanity Studio to see the changes')

  } catch (error) {
    console.error('❌ Error fixing navigation:', error)
  }
}

// Run the fix
completeNavigationFix().catch(console.error)