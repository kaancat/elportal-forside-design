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

async function comparePages() {
  try {
    console.log('Comparing working vs broken pages...\n')
    
    // Pages to compare
    const pagesToTest = [
      { slug: 'elpriser', name: 'Elpriser (WORKING)' },
      { slug: 'elselskaber', name: 'Elselskaber (WORKING)' },
      { slug: 'ladeboks', name: 'Ladeboks (BROKEN)' }
    ]
    
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      "slug": slug.current,
      seoMetaTitle,
      seoMetaDescription,
      "contentBlockCount": count(contentBlocks),
      "contentBlockTypes": contentBlocks[]._type,
      "hasHero": count(contentBlocks[_type == "hero"]) > 0,
      "hasPageSection": count(contentBlocks[_type == "pageSection"]) > 0,
      "firstBlockType": contentBlocks[0]._type,
      "documentCreated": _createdAt,
      "documentUpdated": _updatedAt,
      "isPublished": !(_id in path("drafts.**"))
    }`
    
    for (const pageInfo of pagesToTest) {
      console.log(`\n🔍 ${pageInfo.name}:`)
      console.log('='.repeat(50))
      
      const page = await client.fetch(query, { slug: pageInfo.slug })
      
      if (!page) {
        console.log('❌ Page not found!')
        continue
      }
      
      console.log(`✅ Found: ${page.title}`)
      console.log(`   ID: ${page._id}`)
      console.log(`   Slug: ${page.slug}`)
      console.log(`   Published: ${page.isPublished ? 'YES' : 'NO (DRAFT)'}`)
      console.log(`   Content blocks: ${page.contentBlockCount}`)
      console.log(`   First block: ${page.firstBlockType}`)
      console.log(`   Has hero: ${page.hasHero}`)
      console.log(`   Has pageSection: ${page.hasPageSection}`)
      console.log(`   Created: ${page.documentCreated}`)
      console.log(`   Updated: ${page.documentUpdated}`)
      
      console.log('   Block types:', page.contentBlockTypes.join(', '))
      
      // Check for draft version
      const draftQuery = `*[_id == "drafts." + $pageId][0] {
        _id,
        title,
        "lastModified": _updatedAt
      }`
      
      const draft = await client.fetch(draftQuery, { pageId: page._id })
      if (draft) {
        console.log(`   🚧 DRAFT exists: ${draft.title} (modified: ${draft.lastModified})`)
      }
    }
    
    // Check if there's something specific about page IDs
    console.log('\n🆔 Page ID Analysis:')
    console.log('='.repeat(50))
    
    const allPages = await client.fetch(`*[_type == "page"] {
      _id,
      title,
      "slug": slug.current,
      "isPublished": !(_id in path("drafts.**")),
      "hasManualId": _id != ("page." + slug.current)
    }`)
    
    console.log('Page ID patterns:')
    allPages.forEach((page: any) => {
      const idPattern = page.hasManualId ? 'CUSTOM ID' : 'AUTO ID'
      const status = page.isPublished ? 'PUBLISHED' : 'DRAFT'
      console.log(`  - ${page.slug}: ${page._id} (${idPattern}, ${status})`)
    })
    
    // Check navigation structure
    console.log('\n🧭 Navigation Analysis:')
    console.log('='.repeat(50))
    
    const navigation = await client.fetch(`*[_type == "siteSettings"][0] {
      headerLinks[] {
        _type,
        title,
        _type == 'link' => {
          linkType,
          "targetSlug": internalLink->slug.current,
          "targetExists": defined(internalLink->_id)
        }
      }
    }`)
    
    console.log('Navigation links:')
    navigation.headerLinks.forEach((link: any) => {
      if (link._type === 'link') {
        const status = link.targetExists ? '✅' : '❌'
        console.log(`  ${status} "${link.title}" → /${link.targetSlug}`)
      }
    })

  } catch (error) {
    console.error('❌ Error comparing pages:', error)
  }
}

comparePages()