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

async function finalVerificationValidationFixes() {
  try {
    console.log('🔍 Final verification of validation fixes...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      seoMetaTitle,
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          title,
          content[]{
            _type,
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
    
    let allPassed = true
    
    // 1. Check SEO Meta Title
    console.log('1️⃣ SEO Meta Title:')
    console.log(`   Value: "${homepage.seoMetaTitle}"`)
    console.log(`   Length: ${homepage.seoMetaTitle?.length} characters`)
    const seoTitlePass = homepage.seoMetaTitle?.length <= 60
    console.log(`   Status: ${seoTitlePass ? '✅ PASS (under 60 chars)' : '❌ FAIL (over 60 chars)'}`)
    if (!seoTitlePass) allPassed = false
    
    // 2. Check Monthly Production Chart Leading Text
    console.log('\n2️⃣ Monthly Production Chart Leading Text:')
    let chartPass = true
    homepage.contentBlocks?.forEach((block: any) => {
      if (block._type === 'pageSection' && block.content) {
        block.content.forEach((item: any) => {
          if (item._type === 'monthlyProductionChart') {
            console.log(`   Found in section "${block.title}"`)
            console.log(`   Chart Title: "${item.title}"`)
            console.log(`   Leading Text Type: ${typeof item.leadingText}`)
            console.log(`   Leading Text Value: "${item.leadingText || '(empty)'}"`)
            const isString = typeof item.leadingText === 'string'
            console.log(`   Status: ${isString ? '✅ PASS (is string)' : '❌ FAIL (not string)'}`)
            if (!isString) {
              chartPass = false
              allPassed = false
            }
          }
        })
      }
    })
    
    // 3. Check CTA URLs
    console.log('\n3️⃣ Call to Action Button URLs:')
    let ctaPass = true
    let ctaCount = 0
    homepage.contentBlocks?.forEach((block: any) => {
      if (block._type === 'pageSection' && block.cta) {
        ctaCount++
        console.log(`   CTA ${ctaCount}:`)
        console.log(`   - Text: "${block.cta.text}"`)
        console.log(`   - URL: "${block.cta.url}"`)
        
        const isValidUrl = block.cta.url && (
          block.cta.url.startsWith('/') || 
          block.cta.url.startsWith('http://') || 
          block.cta.url.startsWith('https://')
        )
        
        console.log(`   - Status: ${isValidUrl ? '✅ PASS (valid URL)' : '❌ FAIL (invalid URL)'}`)
        if (!isValidUrl) {
          ctaPass = false
          allPassed = false
        }
      }
    })
    
    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 FINAL SUMMARY:')
    console.log('='.repeat(50))
    console.log(`SEO Meta Title: ${seoTitlePass ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Monthly Production Chart: ${chartPass ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`CTA URLs: ${ctaPass ? '✅ PASS' : '❌ FAIL'}`)
    console.log('\n' + (allPassed ? '✅ ALL VALIDATION ERRORS FIXED!' : '❌ Some issues remain'))
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
  }
}

// Run the script
finalVerificationValidationFixes()