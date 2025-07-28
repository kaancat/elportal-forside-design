#!/usr/bin/env npx tsx

/**
 * Validate a specific page using Sanity's validation API
 */

import { createClient } from '@sanity/client'
import { config } from 'dotenv'

// Load environment variables
config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G'

async function validatePage() {
  try {
    console.log('🔍 Running validation for page:', PAGE_ID)
    
    // Try to fetch validation status from Sanity
    const page = await client.fetch(`
      *[_id == $pageId][0]{
        _id,
        _type,
        title,
        "blockCount": count(contentBlocks),
        "blocks": contentBlocks[]{
          _type,
          _key,
          "hasRequiredFields": defined(title) || defined(headline) || defined(heading)
        }
      }
    `, { pageId: PAGE_ID })
    
    if (!page) {
      console.error('❌ Page not found')
      return
    }
    
    console.log('✅ Page validation check:')
    console.log(`  - Page ID: ${page._id}`)
    console.log(`  - Title: ${page.title}`)
    console.log(`  - Total blocks: ${page.blockCount}`)
    
    // Check for common validation issues
    const missingKeys = page.blocks?.filter((block: any) => !block._key) || []
    if (missingKeys.length > 0) {
      console.log(`⚠️  Found ${missingKeys.length} blocks missing _key fields`)
    } else {
      console.log('✅ All blocks have _key fields')
    }
    
    // Try to use Sanity's validation endpoint if available
    try {
      const validationResult = await fetch(`https://api.sanity.io/v2025-01-01/data/validate/production/documents/${PAGE_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SANITY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (validationResult.ok) {
        const validation = await validationResult.json()
        console.log('📋 Sanity validation result:', JSON.stringify(validation, null, 2))
      } else {
        console.log('⚠️  Could not fetch validation from Sanity API')
      }
    } catch (error) {
      console.log('⚠️  Validation API not accessible, using manual checks')
    }
    
    // Check if page can be published by trying to fetch it with publishing filters
    const publishCheck = await client.fetch(`
      *[_id == $pageId && !(_id in path("drafts.**"))][0]{
        _id,
        title,
        "isPublished": true
      }
    `, { pageId: PAGE_ID })
    
    if (publishCheck) {
      console.log('✅ Page appears to be publishable')
    } else {
      console.log('⚠️  Page may have publishing issues or is in draft mode')
    }
    
    console.log('\n🔗 View page in Studio:')
    console.log(`   https://dinelportal.sanity.studio/structure/page;${PAGE_ID}`)
    
  } catch (error) {
    console.error('❌ Validation error:', error)
  }
}

validatePage()