import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkAllPagesValidation() {
  try {
    console.log('🔍 Checking all pages for validation errors...\n')
    
    // Fetch all pages
    const pages = await client.fetch(`*[_type == "page"]{
      _id,
      title,
      "slug": slug.current,
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          title,
          content[]{
            _type,
            _key,
            _type == "monthlyProductionChart" => {
              title,
              leadingText
            }
          },
          cta {
            text,
            url
          }
        }
      }
    }`)
    
    let totalErrors = 0
    const errorsByPage: any = {}
    
    // Check each page
    for (const page of pages) {
      const errors: any[] = []
      
      page.contentBlocks?.forEach((block: any, blockIndex: number) => {
        if (block._type === 'pageSection') {
          
          // Check content array for Monthly Production Chart issues
          if (block.content) {
            block.content.forEach((item: any, itemIndex: number) => {
              if (item._type === 'monthlyProductionChart' && Array.isArray(item.leadingText)) {
                errors.push({
                  type: 'Monthly Production Chart - Array leadingText',
                  section: block.title,
                  position: `Block ${blockIndex + 1}, Item ${itemIndex + 1}`,
                  blockKey: block._key,
                  itemKey: item._key,
                  leadingText: item.leadingText
                })
              }
            })
          }
          
          // Check CTA URL
          if (block.cta) {
            const url = block.cta.url
            const isValidUrl = url && (
              url.startsWith('/') || 
              url.startsWith('http://') || 
              url.startsWith('https://') ||
              url.startsWith('#')
            )
            
            if (!isValidUrl) {
              errors.push({
                type: 'Invalid CTA URL',
                section: block.title,
                position: `Block ${blockIndex + 1}`,
                blockKey: block._key,
                currentUrl: url,
                ctaText: block.cta.text
              })
            }
          }
        }
      })
      
      if (errors.length > 0) {
        errorsByPage[page.slug] = {
          title: page.title,
          _id: page._id,
          errors: errors
        }
        totalErrors += errors.length
      }
    }
    
    // Display results
    console.log('='.repeat(60))
    console.log('📋 VALIDATION REPORT')
    console.log('='.repeat(60))
    console.log(`Total pages checked: ${pages.length}`)
    console.log(`Total errors found: ${totalErrors}`)
    
    if (totalErrors > 0) {
      console.log('\n🚨 PAGES WITH ERRORS:')
      
      Object.entries(errorsByPage).forEach(([slug, data]: [string, any]) => {
        console.log(`\n📄 Page: ${data.title} (/${slug})`)
        console.log(`   ID: ${data._id}`)
        console.log(`   Errors: ${data.errors.length}`)
        
        data.errors.forEach((error: any, index: number) => {
          console.log(`\n   ${index + 1}. ${error.type}`)
          console.log(`      Section: ${error.section || 'N/A'}`)
          console.log(`      Position: ${error.position}`)
          if (error.currentUrl !== undefined) {
            console.log(`      Current URL: "${error.currentUrl}"`)
            console.log(`      Button Text: "${error.ctaText}"`)
          }
          if (error.leadingText) {
            console.log(`      Array content:`, JSON.stringify(error.leadingText, null, 6))
          }
        })
      })
    } else {
      console.log('\n✅ No validation errors found in any pages!')
    }
    
  } catch (error) {
    console.error('❌ Error checking pages:', error)
  }
}

// Run the script
checkAllPagesValidation()