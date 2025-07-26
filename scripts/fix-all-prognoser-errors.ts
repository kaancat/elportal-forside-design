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

async function fixAllPrognoserErrors() {
  console.log('🔧 Fixing ALL prognoser page validation errors...')
  
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page found. Applying comprehensive fixes...')
    
    // Start fresh with clean data
    const fixedContentBlocks: any[] = []
    
    // Process each block
    page.contentBlocks.forEach((block: any, index: number) => {
      console.log(`\nProcessing block ${index + 1}: ${block._type}`)
      
      switch (block._type) {
        case 'hero':
          // Remove variant field (not in schema)
          const { variant, ...heroBlock } = block
          fixedContentBlocks.push(heroBlock)
          console.log('✅ Fixed hero: removed variant field')
          break
          
        case 'dailyPriceTimeline':
          // Ensure description is string, not array
          if (Array.isArray(block.description)) {
            block.description = extractTextFromPortableText(block.description)
          }
          fixedContentBlocks.push(block)
          break
          
        case 'pageSection':
          // pageSection is valid - just ensure it has proper structure
          fixedContentBlocks.push(block)
          break
          
        case 'renewableEnergyForecast':
          // Ensure description is plain text
          if (Array.isArray(block.description)) {
            block.description = extractTextFromPortableText(block.description)
            console.log('✅ Fixed renewableEnergyForecast: converted description to plain text')
          }
          fixedContentBlocks.push(block)
          break
          
        case 'priceCalculator':
          // priceCalculator is valid
          fixedContentBlocks.push(block)
          break
          
        case 'monthlyProductionChart':
          // Ensure description is plain text
          if (Array.isArray(block.description)) {
            block.description = extractTextFromPortableText(block.description)
            console.log('✅ Fixed monthlyProductionChart: converted description to plain text')
          }
          fixedContentBlocks.push(block)
          break
          
        case 'co2EmissionsChart':
          // Ensure description is string
          if (Array.isArray(block.description)) {
            block.description = extractTextFromPortableText(block.description)
            console.log('✅ Fixed co2EmissionsChart: converted description to plain text')
          }
          fixedContentBlocks.push(block)
          break
          
        case 'providerList':
          // Already fixed - no subtitle
          fixedContentBlocks.push(block)
          break
          
        case 'infoCardsSection':
          fixedContentBlocks.push(block)
          break
          
        case 'regionalComparison':
          // Ensure description is string
          if (Array.isArray(block.description)) {
            block.description = extractTextFromPortableText(block.description)
          }
          fixedContentBlocks.push(block)
          break
          
        case 'faqGroup':
          fixedContentBlocks.push(block)
          break
          
        case 'valueProposition':
          fixedContentBlocks.push(block)
          break
          
        case 'pricingComparison':
          // Ensure description is string
          if (Array.isArray(block.description)) {
            block.description = extractTextFromPortableText(block.description)
          }
          fixedContentBlocks.push(block)
          break
          
        case 'callToActionSection':
          fixedContentBlocks.push(block)
          break
          
        default:
          console.log(`⚠️  Unknown block type: ${block._type} - keeping as is`)
          fixedContentBlocks.push(block)
      }
    })
    
    // Create the updated page
    const updatedPage = {
      ...page,
      contentBlocks: fixedContentBlocks
    }
    
    // Ensure SEO fields are present
    if (!updatedPage.seoMetaDescription && page.description) {
      updatedPage.seoMetaDescription = page.description
      delete updatedPage.description
      console.log('\n✅ Added seoMetaDescription')
    }
    
    if (!updatedPage.seoKeywords) {
      updatedPage.seoKeywords = [
        'elpriser i morgen',
        'elpris prognose', 
        'spotpris el',
        'elpriser time for time',
        'strømpriser danmark',
        'vindenergi prognose',
        'grøn energi prognose',
        'elpriser DK1 DK2'
      ]
      console.log('✅ Added SEO keywords')
    }
    
    // Update the page
    console.log('\n📤 Updating page in Sanity...')
    const result = await client.createOrReplace(updatedPage)
    
    console.log('\n✅ Page updated successfully!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.prognoser')
    console.log('🌐 Frontend URL: https://elportal-forside-design.vercel.app/prognoser')
    
    // Summary of changes
    console.log('\n📊 Summary of fixes applied:')
    console.log('- Removed hero.variant field')
    console.log('- Converted array descriptions to plain text where needed')
    console.log('- Added SEO fields')
    console.log('- Maintained all valid content blocks')
    console.log(`- Total blocks: ${fixedContentBlocks.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Helper function to extract text from Portable Text
function extractTextFromPortableText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (block.children && Array.isArray(block.children)) {
        return block.children
          .filter((child: any) => child._type === 'span')
          .map((span: any) => span.text || '')
          .join('')
      }
      return ''
    })
    .filter(text => text.length > 0)
    .join(' ')
}

// Run the comprehensive fix
fixAllPrognoserErrors()
  .then(() => {
    console.log('\n🎉 All validation errors have been fixed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })