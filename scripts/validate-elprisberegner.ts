import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function validateElprisberegnerPage() {
  console.log('🔍 Validating Elprisberegner Page (ID: f7ecf92783e749828f7281a6e5829d52)\n')

  try {
    // Fetch the page with all content blocks expanded
    const query = `*[_type == "page" && _id == "f7ecf92783e749828f7281a6e5829d52"][0] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      seoKeywords,
      ogImage,
      "contentBlocks": contentBlocks[] {
        _type,
        _key,
        ...
      }
    }`

    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }

    console.log('📄 Page Details:')
    console.log(`Title: ${page.title}`)
    console.log(`Slug: ${page.slug?.current || 'No slug'}`)
    console.log(`SEO Title: ${page.seoMetaTitle || 'Not set'}`)
    console.log(`Total Content Blocks: ${page.contentBlocks?.length || 0}`)
    console.log('\n📋 Content Blocks Analysis:\n')

    // Analyze each content block
    page.contentBlocks?.forEach((block, index) => {
      console.log(`Block ${index + 1}: ${block._type}`)
      console.log(`Key: ${block._key}`)
      
      // Check for common issues
      const issues = []
      
      // Check if it's a pageSection without title
      if (block._type === 'pageSection' && !block.title) {
        issues.push('⚠️ Missing title field')
      }
      
      // Check for nested contentBlocks (incorrect structure)
      if (block.contentBlocks) {
        issues.push('❌ Has nested contentBlocks - should be flat')
      }
      
      // List all fields
      const fields = Object.keys(block).filter(key => !key.startsWith('_'))
      console.log(`Fields: ${fields.join(', ')}`)
      
      if (issues.length > 0) {
        console.log('Issues:')
        issues.forEach(issue => console.log(`  ${issue}`))
      } else {
        console.log('✅ No structural issues detected')
      }
      
      console.log('---')
    })

    // Export full structure for manual inspection
    console.log('\n📝 Full Page Structure (JSON):\n')
    console.log(JSON.stringify(page, null, 2))

  } catch (error) {
    console.error('❌ Error fetching page:', error)
  }
}

validateElprisberegnerPage()