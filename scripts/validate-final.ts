import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function validateFinal() {
  console.log('🔍 Running final validation check on prognoser page...\n')
  
  try {
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Page found. Checking all components...\n')
    
    let hasErrors = false
    
    // Check each block
    page.contentBlocks.forEach((block: any, index: number) => {
      console.log(`[${index + 1}] ${block._type}:`)
      
      switch (block._type) {
        case 'pageSection':
          if (!block.title) {
            console.log('  ❌ Missing title (will show as "Untitled")')
            hasErrors = true
          } else {
            console.log(`  ✅ Title: "${block.title}"`)
          }
          break
          
        case 'infoCardsSection':
          if (!block.title) {
            console.log('  ⚠️  Missing title (using default)')
          } else {
            console.log(`  ✅ Title: "${block.title}"`)
          }
          if (block.cards) {
            const invalidCards = block.cards.filter((card: any) => !card.title)
            if (invalidCards.length > 0) {
              console.log(`  ❌ ${invalidCards.length} cards missing title`)
              hasErrors = true
            } else {
              console.log(`  ✅ All ${block.cards.length} cards have titles`)
            }
          }
          break
          
        case 'faqGroup':
          if (!block.title) {
            console.log('  ❌ Missing required title')
            hasErrors = true
          } else {
            console.log(`  ✅ Title: "${block.title}"`)
          }
          if (block.faqItems) {
            console.log(`  ✅ Has ${block.faqItems.length} FAQ references`)
          }
          break
          
        case 'valueProposition':
          if (!block.title) {
            console.log('  ⚠️  Missing title (will show as "Untitled")')
          } else {
            console.log(`  ✅ Title: "${block.title}"`)
          }
          if (block.items) {
            console.log(`  ✅ Has ${block.items.length} value proposition references`)
          }
          break
          
        case 'callToActionSection':
          const requiredFields = ['heading', 'description', 'primaryButtonText', 'primaryButtonLink']
          const missingFields = requiredFields.filter(field => !block[field])
          
          if (missingFields.length > 0) {
            console.log(`  ❌ Missing required fields: ${missingFields.join(', ')}`)
            hasErrors = true
          } else {
            console.log(`  ✅ All required fields present`)
            console.log(`     - Heading: "${block.heading}"`)
            console.log(`     - Button: "${block.primaryButtonText}" -> ${block.primaryButtonLink}`)
          }
          break
          
        default:
          console.log(`  ✅ Component OK`)
      }
    })
    
    console.log('\n' + '='.repeat(60))
    if (hasErrors) {
      console.log('❌ VALIDATION FAILED - Some errors remain')
    } else {
      console.log('✅ VALIDATION PASSED - All components properly configured!')
    }
    console.log('='.repeat(60))
    
    console.log('\n📊 Page Summary:')
    console.log(`- Title: ${page.title}`)
    console.log(`- Total blocks: ${page.contentBlocks.length}`)
    console.log(`- SEO Description: ${page.seoMetaDescription ? '✅ Present' : '❌ Missing'}`)
    console.log(`- SEO Keywords: ${page.seoKeywords && page.seoKeywords.length > 0 ? `✅ ${page.seoKeywords.length} keywords` : '❌ Missing'}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run validation
validateFinal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })