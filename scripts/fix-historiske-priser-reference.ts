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

async function fixHistoriskePriserReference() {
  console.log('🔧 Fixing Historiske Priser Navigation\n')
  
  // 1. Find pages with valid IDs (not page.slug pattern)
  console.log('📄 Finding valid historiske priser pages...')
  const validPages = await client.fetch(`
    *[_type == "page" && !(_id in path("page.*")) && slug.current == "historiske-priser"] {
      _id,
      title,
      "slug": slug.current,
      _createdAt
    }
  `)
  
  if (validPages.length === 0) {
    console.log('❌ No valid historiske-priser page found!')
    console.log('\n📝 Searching for any page with historiske priser content...')
    
    const anyHistoriskePage = await client.fetch(`
      *[_type == "page" && !(_id in path("page.*")) && title match "*historisk*"] {
        _id,
        title,
        "slug": slug.current,
        _createdAt
      }
    `)
    
    if (anyHistoriskePage.length > 0) {
      console.log('\nFound alternative pages:')
      anyHistoriskePage.forEach((page: any) => {
        console.log(`  - ${page.title} (/${page.slug})`)
        console.log(`    ID: ${page._id}`)
      })
    }
    
    return
  }
  
  const validPage = validPages[0]
  console.log(`\n✅ Found valid page:`)
  console.log(`   Title: ${validPage.title}`)
  console.log(`   ID: ${validPage._id}`)
  console.log(`   Slug: /${validPage.slug}`)
  
  // 2. Get the current mega menu structure
  console.log('\n🔍 Finding the broken reference in mega menu...')
  const siteSettings = await client.fetch(`
    *[_type == "siteSettings"][0] {
      _id,
      _rev,
      headerLinks[] {
        _key,
        _type,
        _type == 'megaMenu' => {
          title,
          content[] {
            _key,
            title,
            items[] {
              _key,
              title,
              link {
                linkType,
                internalLink {
                  _ref
                }
              }
            }
          }
        }
      }
    }
  `)
  
  // Find the broken reference
  let foundBrokenRef = false
  let megaMenuKey: string | null = null
  let columnKey: string | null = null
  let itemKey: string | null = null
  
  siteSettings.headerLinks.forEach((headerLink: any) => {
    if (headerLink._type === 'megaMenu') {
      megaMenuKey = headerLink._key
      headerLink.content.forEach((column: any) => {
        column.items.forEach((item: any) => {
          if (item.title === 'Historiske priser' && 
              item.link?.internalLink?._ref === 'page.historiske-priser') {
            foundBrokenRef = true
            columnKey = column._key
            itemKey = item._key
            console.log(`\n❌ Found broken reference:`)
            console.log(`   Menu: ${headerLink.title}`)
            console.log(`   Column: ${column.title}`)
            console.log(`   Item: ${item.title}`)
            console.log(`   Bad Ref: ${item.link.internalLink._ref}`)
          }
        })
      })
    }
  })
  
  if (!foundBrokenRef) {
    console.log('\n✅ No broken reference found - navigation might already be fixed!')
    return
  }
  
  // 3. Fix the reference
  console.log(`\n🔧 Updating reference to: ${validPage._id}`)
  
  try {
    // We need to update the specific item in the nested array
    const result = await client
      .patch(siteSettings._id)
      .set({
        [`headerLinks[_key=="${megaMenuKey}"].content[_key=="${columnKey}"].items[_key=="${itemKey}"].link.internalLink`]: {
          _type: 'reference',
          _ref: validPage._id
        }
      })
      .commit()
    
    console.log('\n✅ Successfully updated the reference!')
    console.log('\n📝 Next steps:')
    console.log('   1. Refresh your browser')
    console.log('   2. The "Historiske priser" link should now work!')
    console.log('   3. If using webhook, the change should propagate automatically')
    
  } catch (error) {
    console.error('\n❌ Error updating reference:', error)
    console.log('\n💡 Manual fix instructions:')
    console.log('   1. Go to Sanity Studio')
    console.log('   2. Navigate to Site Settings')
    console.log('   3. Find "Bliv klogere på" in Header Links')
    console.log('   4. In the "Priser" column, click "Historiske priser"')
    console.log(`   5. Update the Internal Link to reference: "${validPage.title}"`)
  }
}

fixHistoriskePriserReference().catch(console.error)