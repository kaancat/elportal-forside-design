import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function debugHistoriskePriser() {
  console.log('🔍 Debugging Historiske Priser Navigation Issue\n')
  
  // 1. Find all pages with "historisk" in title or slug
  console.log('📄 Searching for historiske priser pages...')
  const historiskePages = await client.fetch(`
    *[_type == "page" && (title match "historisk*" || slug.current match "historisk*")] {
      _id,
      title,
      "slug": slug.current,
      _createdAt,
      _updatedAt
    }
  `)
  
  console.log('Found pages:')
  historiskePages.forEach((page: any) => {
    console.log(`  - ${page.title}`)
    console.log(`    ID: ${page._id}`)
    console.log(`    Slug: /${page.slug}`)
    console.log(`    Created: ${page._createdAt}`)
    console.log('')
  })
  
  // 2. Check mega menu structure
  console.log('🔗 Checking Mega Menu references...')
  const siteSettings = await client.fetch(`
    *[_type == "siteSettings"][0] {
      headerLinks[] {
        _type,
        _key,
        _type == 'megaMenu' => {
          title,
          content[] {
            _key,
            title,
            items[] {
              _key,
              title,
              link {
                _key,
                linkType,
                internalLink {
                  _ref,
                  _type
                }
              }
            }
          }
        }
      }
    }
  `)
  
  // Find the specific menu item
  const megaMenu = siteSettings.headerLinks.find((item: any) => item._type === 'megaMenu')
  if (megaMenu) {
    console.log(`\nMega Menu: "${megaMenu.title}"`)
    
    megaMenu.content.forEach((column: any) => {
      const priserItems = column.items.filter((item: any) => 
        item.title.toLowerCase().includes('pris')
      )
      
      if (priserItems.length > 0) {
        console.log(`\n  Column: "${column.title}"`)
        priserItems.forEach((item: any) => {
          console.log(`    - "${item.title}"`)
          console.log(`      Link Type: ${item.link?.linkType || 'NO LINK'}`)
          console.log(`      Internal Ref: ${item.link?.internalLink?._ref || 'NO REF'}`)
        })
      }
    })
  }
  
  // 3. Try to resolve the reference
  console.log('\n🔍 Attempting to resolve menu references...')
  const megaMenuWithResolved = await client.fetch(`
    *[_type == "siteSettings"][0].headerLinks[_type == 'megaMenu'][0] {
      content[] {
        title,
        items[] {
          title,
          link {
            linkType,
            internalLink->{
              _id,
              title,
              "slug": slug.current
            }
          }
        }[title match "*historisk*" || title match "*Pris*"]
      }
    }
  `)
  
  console.log('\nResolved References:')
  megaMenuWithResolved.content.forEach((col: any) => {
    if (col.items.length > 0) {
      console.log(`\n  ${col.title}:`)
      col.items.forEach((item: any) => {
        console.log(`    - "${item.title}"`)
        if (item.link?.internalLink) {
          console.log(`      ✅ Resolves to: ${item.link.internalLink.title} (/${item.link.internalLink.slug})`)
        } else {
          console.log(`      ❌ BROKEN REFERENCE`)
        }
      })
    }
  })
  
  // 4. Provide fix suggestions
  console.log('\n💡 Suggested Fix:')
  if (historiskePages.length > 0) {
    const correctPage = historiskePages[0]
    console.log(`\n1. In Sanity Studio, go to Site Settings > Header Links`)
    console.log(`2. Find "Bliv klogere på" mega menu`)
    console.log(`3. In the "Priser" column, find "Historiske priser"`)
    console.log(`4. Click on it and update the Internal Link to:`)
    console.log(`   - Document: "${correctPage.title}"`)
    console.log(`   - This should reference ID: ${correctPage._id}`)
  }
}

debugHistoriskePriser().catch(console.error)