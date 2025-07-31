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

async function findRemainingValidationErrors() {
  try {
    console.log('🔍 Finding remaining validation errors...\n')
    
    // Fetch the homepage with detailed structure
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      _id,
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
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    let errorCount = 0
    const errors: any[] = []
    
    // Check all content blocks
    homepage.contentBlocks?.forEach((block: any, blockIndex: number) => {
      if (block._type === 'pageSection') {
        
        // Check content array for Monthly Production Chart issues
        if (block.content) {
          block.content.forEach((item: any, itemIndex: number) => {
            if (item._type === 'monthlyProductionChart') {
              console.log(`\n📊 Monthly Production Chart found in section "${block.title}"`)
              console.log(`   Position: Block ${blockIndex + 1}, Item ${itemIndex + 1}`)
              console.log(`   Title: "${item.title}"`)
              console.log(`   Leading Text Type: ${Array.isArray(item.leadingText) ? 'Array ❌' : typeof item.leadingText}`)
              
              if (Array.isArray(item.leadingText)) {
                errorCount++
                errors.push({
                  type: 'Monthly Production Chart - Array leadingText',
                  section: block.title,
                  position: `Block ${blockIndex + 1}, Item ${itemIndex + 1}`,
                  blockKey: block._key,
                  itemKey: item._key
                })
                
                // Show the array structure
                console.log('   Array content:', JSON.stringify(item.leadingText, null, 2))
              }
            }
          })
        }
        
        // Check CTA URL
        if (block.cta) {
          console.log(`\n🔗 CTA found in section "${block.title}"`)
          console.log(`   Position: Block ${blockIndex + 1}`)
          console.log(`   Text: "${block.cta.text}"`)
          console.log(`   URL: "${block.cta.url}"`)
          
          // Validate URL
          const url = block.cta.url
          const isValidUrl = url && (
            url.startsWith('/') || 
            url.startsWith('http://') || 
            url.startsWith('https://') ||
            url.startsWith('#')
          )
          
          if (!isValidUrl) {
            console.log(`   Status: Invalid URL ❌`)
            errorCount++
            errors.push({
              type: 'Invalid CTA URL',
              section: block.title,
              position: `Block ${blockIndex + 1}`,
              blockKey: block._key,
              currentUrl: url
            })
          } else {
            console.log(`   Status: Valid URL ✅`)
          }
        }
      }
    })
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📋 SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total errors found: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\nErrors details:')
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}`)
        console.log(`   Section: ${error.section}`)
        console.log(`   Position: ${error.position}`)
        console.log(`   Block Key: ${error.blockKey}`)
        if (error.itemKey) console.log(`   Item Key: ${error.itemKey}`)
        if (error.currentUrl !== undefined) console.log(`   Current URL: "${error.currentUrl}"`)
      })
    }
    
    return errors
    
  } catch (error) {
    console.error('❌ Error finding validation errors:', error)
  }
}

// Run the script
findRemainingValidationErrors()