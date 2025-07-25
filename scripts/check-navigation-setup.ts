import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkNavigationSetup() {
  try {
    console.log('Checking navigation setup and existing pages...\n')
    
    // Check all pages
    const pages = await client.fetch(`*[_type == "page"] {
      _id,
      title,
      "slug": slug.current
    }`)
    
    console.log('📄 Existing Pages:')
    pages.forEach((page: any) => {
      console.log(`  - ${page.title} (/${page.slug}) [ID: ${page._id}]`)
    })
    
    // Check site settings navigation
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      headerLinks[] {
        _type,
        _key,
        title,
        _type == 'link' => {
          linkType,
          externalUrl,
          internalLink->{
            _type,
            "slug": slug.current
          }
        },
        _type == 'megaMenu' => {
          content[] {
            _type == 'megaMenuColumn' => {
              items[] {
                title,
                link {
                  linkType,
                  externalUrl,
                  internalLink->{
                    _type,
                    "slug": slug.current
                  }
                }
              }
            }
          }
        }
      }
    }`)
    
    console.log('\n🧭 Navigation Structure:')
    siteSettings.headerLinks.forEach((link: any) => {
      if (link._type === 'link') {
        const target = link.linkType === 'internal' 
          ? `/${link.internalLink?.slug || 'MISSING_SLUG'}` 
          : link.externalUrl || 'MISSING_URL'
        console.log(`  📎 Link: "${link.title}" → ${target}`)
      } else if (link._type === 'megaMenu') {
        console.log(`  📁 MegaMenu: "${link.title}"`)
        link.content?.forEach((column: any) => {
          if (column._type === 'megaMenuColumn') {
            column.items?.forEach((item: any) => {
              const target = item.link?.linkType === 'internal' 
                ? `/${item.link.internalLink?.slug || 'MISSING_SLUG'}` 
                : item.link?.externalUrl || 'MISSING_URL'
              console.log(`    - "${item.title}" → ${target}`)
            })
          }
        })
      }
    })
    
    // Check if ladeboks page exists and if it's linked correctly
    const ladeboxPage = pages.find((p: any) => p.slug === 'ladeboks')
    if (ladeboxPage) {
      console.log('\n✅ Ladeboks page exists:', ladeboxPage.title)
      
      // Check if it's in navigation
      const navLinks: any[] = []
      siteSettings.headerLinks.forEach((link: any) => {
        if (link._type === 'link' && link.internalLink?.slug === 'ladeboks') {
          navLinks.push(`Top level: "${link.title}"`)
        } else if (link._type === 'megaMenu') {
          link.content?.forEach((column: any) => {
            column.items?.forEach((item: any) => {
              if (item.link?.internalLink?.slug === 'ladeboks') {
                navLinks.push(`MegaMenu: "${item.title}" in "${link.title}"`)
              }
            })
          })
        }
      })
      
      if (navLinks.length > 0) {
        console.log('📍 Found in navigation:')
        navLinks.forEach(link => console.log(`  - ${link}`))
      } else {
        console.log('❌ NOT found in navigation structure!')
      }
    } else {
      console.log('\n❌ Ladeboks page does not exist!')
    }

  } catch (error) {
    console.error('❌ Error checking navigation:', error)
  }
}

checkNavigationSetup()