import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from the Sanity CMS project
dotenv.config({ path: resolve(__dirname, '../../sanityelpriscms/.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function validateLadeboksPage() {
  try {
    console.log('🔍 Validating Ladeboks page...\n')
    
    // Fetch the page directly from Sanity
    const page = await client.fetch(`*[_id == "page.ladeboks"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Page found in Sanity!')
    console.log('\n📋 Page Structure Validation:')
    
    // Check required fields
    const checks = [
      { field: '_id', value: page._id, expected: 'page.ladeboks' },
      { field: '_type', value: page._type, expected: 'page' },
      { field: 'title', value: page.title, type: 'string' },
      { field: 'slug.current', value: page.slug?.current, expected: 'ladeboks' },
      { field: 'seoMetaTitle', value: page.seoMetaTitle, type: 'string' },
      { field: 'seoMetaDescription', value: page.seoMetaDescription, type: 'string' },
      { field: 'seoKeywords', value: Array.isArray(page.seoKeywords), expected: true },
      { field: 'contentBlocks', value: Array.isArray(page.contentBlocks), expected: true },
    ]
    
    let allPassed = true
    
    checks.forEach(check => {
      if (check.expected !== undefined) {
        const passed = check.value === check.expected
        console.log(`   ${passed ? '✅' : '❌'} ${check.field}: ${check.value} ${passed ? '' : `(expected: ${check.expected})`}`)
        if (!passed) allPassed = false
      } else if (check.type) {
        const passed = typeof check.value === check.type && check.value
        console.log(`   ${passed ? '✅' : '❌'} ${check.field}: ${passed ? 'present' : 'missing/invalid'}`)
        if (!passed) allPassed = false
      }
    })
    
    console.log('\n📊 Content Analysis:')
    console.log(`   - Keywords: ${page.seoKeywords?.length || 0} keywords`)
    console.log(`   - Content blocks: ${page.contentBlocks?.length || 0} blocks`)
    
    if (page.contentBlocks?.length > 0) {
      console.log('\n📦 Content Blocks:')
      page.contentBlocks.forEach((block, index) => {
        console.log(`   ${index + 1}. ${block._type}${block.heading ? `: "${block.heading}"` : ''}`)
        if (block._type === 'pageSection' && block.components) {
          block.components.forEach((comp, cIndex) => {
            console.log(`      - ${comp._type}${comp.heading ? `: "${comp.heading}"` : ''}`)
          })
        }
      })
    }
    
    // Check for common validation issues
    console.log('\n🔧 Schema Validation:')
    
    // Check for _key in arrays
    let hasKeys = true
    if (page.contentBlocks) {
      page.contentBlocks.forEach((block, index) => {
        if (!block._key) {
          console.log(`   ❌ Missing _key in contentBlocks[${index}]`)
          hasKeys = false
        }
        if (block._type === 'pageSection' && block.components) {
          block.components.forEach((comp, cIndex) => {
            if (!comp._key) {
              console.log(`   ❌ Missing _key in contentBlocks[${index}].components[${cIndex}]`)
              hasKeys = false
            }
          })
        }
      })
    }
    
    if (hasKeys) {
      console.log('   ✅ All array items have _key properties')
    }
    
    // Check SEO structure
    if (page.seo) {
      console.log('   ❌ Found nested seo object (should be flat fields)')
    } else {
      console.log('   ✅ SEO fields are flat (correct structure)')
    }
    
    // Check slug structure
    if (page.slug && typeof page.slug === 'object' && page.slug._type === 'slug') {
      console.log('   ✅ Slug has correct object structure')
    } else {
      console.log('   ❌ Slug structure is incorrect')
    }
    
    console.log('\n' + (allPassed && hasKeys ? '✅ Page is valid and ready!' : '❌ Page has validation issues'))
    
    // Test frontend accessibility
    console.log('\n🌐 Frontend Check:')
    console.log('   URL: https://dinelportal.dk/ladeboks')
    console.log('   API: https://yxesi03x.api.sanity.io/v2025-01-01/data/query/production')
    
  } catch (error) {
    console.error('❌ Error validating page:', error)
  }
}

// Run validation
validateLadeboksPage()