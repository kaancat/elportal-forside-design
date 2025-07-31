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

async function checkHomepageValidationErrors() {
  try {
    console.log('🔍 Checking homepage for validation errors...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      _id,
      seoMetaTitle,
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
          cta
        }
      }
    }`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Check SEO Meta Title length
    console.log('1️⃣ SEO Meta Title:')
    console.log(`   Current: "${homepage.seoMetaTitle}"`)
    console.log(`   Length: ${homepage.seoMetaTitle?.length || 0} characters`)
    if (homepage.seoMetaTitle && homepage.seoMetaTitle.length > 60) {
      console.log('   ❌ Too long! Should be under 60 characters')
    } else {
      console.log('   ✅ Good length')
    }
    
    // Check for Monthly Production Chart with Array leadingText
    console.log('\n2️⃣ Monthly Production Chart Leading Text:')
    let foundChartIssue = false
    homepage.contentBlocks?.forEach((block: any, blockIndex: number) => {
      if (block._type === 'pageSection' && block.content) {
        block.content.forEach((item: any, itemIndex: number) => {
          if (item._type === 'monthlyProductionChart') {
            console.log(`   Found in block ${blockIndex + 1}, item ${itemIndex + 1}:`)
            console.log(`   Title: "${item.title}"`)
            console.log(`   Leading Text type: ${Array.isArray(item.leadingText) ? 'Array' : typeof item.leadingText}`)
            if (Array.isArray(item.leadingText)) {
              console.log('   ❌ Leading Text is Array (should be String)')
              foundChartIssue = true
            }
          }
        })
      }
    })
    if (!foundChartIssue) {
      console.log('   No Monthly Production Chart found or no Array issue')
    }
    
    // Check CTA URLs
    console.log('\n3️⃣ Call to Action Button URLs:')
    let foundCTAIssue = false
    homepage.contentBlocks?.forEach((block: any, blockIndex: number) => {
      if (block._type === 'pageSection' && block.cta) {
        console.log(`   Found in block ${blockIndex + 1}:`)
        console.log(`   Button Text: "${block.cta.text}"`)
        console.log(`   Button URL: "${block.cta.url}"`)
        
        // Check if it's a valid URL
        if (block.cta.url) {
          const isValidUrl = block.cta.url.startsWith('/') || 
                           block.cta.url.startsWith('http://') || 
                           block.cta.url.startsWith('https://')
          if (!isValidUrl) {
            console.log('   ❌ Invalid URL format')
            foundCTAIssue = true
          } else {
            console.log('   ✅ Valid URL format')
          }
        }
      }
    })
    if (!foundCTAIssue) {
      console.log('   All CTA URLs are valid or no CTAs found')
    }
    
    // Get available pages for URL reference
    console.log('\n📄 Available pages for internal linking:')
    const pages = await client.fetch(`*[_type == "page"]{
      title,
      "url": "/" + slug.current
    }`)
    
    pages.forEach((page: any) => {
      console.log(`   - ${page.url} (${page.title})`)
    })
    
  } catch (error) {
    console.error('❌ Error checking validation errors:', error)
  }
}

// Run the script
checkHomepageValidationErrors()