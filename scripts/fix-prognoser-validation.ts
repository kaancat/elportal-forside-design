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

async function fixPrognoserPage() {
  console.log('🔧 Fixing prognoser page validation errors...')
  
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page found. Applying fixes...')
    
    // Create a copy to modify
    const fixedPage = { ...page }
    
    // Fix page-level fields
    if (page.description) {
      fixedPage.seoMetaDescription = page.description
      delete fixedPage.description
      console.log('✅ Fixed: Moved description to seoMetaDescription')
    }
    
    // Add missing SEO keywords
    if (!fixedPage.seoKeywords) {
      fixedPage.seoKeywords = ['elpriser i morgen', 'elpris prognose', 'spotpris el', 'elpriser time for time', 'strømpriser', 'vindenergi prognose']
      console.log('✅ Added: SEO keywords')
    }
    
    // Fix content blocks
    if (fixedPage.contentBlocks && Array.isArray(fixedPage.contentBlocks)) {
      fixedPage.contentBlocks = fixedPage.contentBlocks.map((block: any, index: number) => {
        const fixedBlock = { ...block }
        
        // Fix hero block
        if (block._type === 'hero') {
          // Remove non-existent fields
          delete fixedBlock.ctaText
          delete fixedBlock.ctaLink
          
          // Fix heading -> headline
          if (block.heading) {
            fixedBlock.headline = block.heading
            delete fixedBlock.heading
            console.log(`✅ Fixed block ${index + 1}: hero heading -> headline`)
          }
          
          // Ensure subheadline is plain text (not array)
          if (fixedBlock.subheading) {
            fixedBlock.subheadline = fixedBlock.subheading
            delete fixedBlock.subheading
          }
        }
        
        // Fix providerList block
        if (block._type === 'providerList') {
          // Remove non-existent subtitle field
          if (block.description || block.subtitle) {
            delete fixedBlock.description
            delete fixedBlock.subtitle
            console.log(`✅ Fixed block ${index + 1}: Removed providerList subtitle (field doesn't exist)`)
          }
        }
        
        // Fix renewableEnergyForecast block
        if (block._type === 'renewableEnergyForecast') {
          // Ensure description is plain text (not array)
          if (Array.isArray(block.description)) {
            fixedBlock.description = extractTextFromPortableText(block.description)
            console.log(`✅ Fixed block ${index + 1}: renewableEnergyForecast description to plain text`)
          }
          
          // leadingText should be plain text for this component
          if (Array.isArray(block.leadingText)) {
            fixedBlock.leadingText = extractTextFromPortableText(block.leadingText)
            console.log(`✅ Fixed block ${index + 1}: renewableEnergyForecast leadingText to plain text`)
          }
        }
        
        // Fix monthlyProductionChart block
        if (block._type === 'monthlyProductionChart') {
          // leadingText should be plain text for this component
          if (Array.isArray(block.leadingText)) {
            fixedBlock.leadingText = extractTextFromPortableText(block.leadingText)
            console.log(`✅ Fixed block ${index + 1}: monthlyProductionChart leadingText to plain text`)
          }
        }
        
        // Ensure all required fields have default values
        if (block._type === 'dailyPriceTimeline' || 
            block._type === 'co2EmissionsChart' || 
            block._type === 'regionalComparison' || 
            block._type === 'pricingComparison') {
          if (!fixedBlock.headerAlignment) {
            fixedBlock.headerAlignment = 'center'
          }
        }
        
        return fixedBlock
      })
    }
    
    // Update the page
    console.log('\n📤 Updating page in Sanity...')
    const result = await client.createOrReplace(fixedPage)
    
    console.log('✅ Page updated successfully!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.prognoser')
    
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
          .map((span: any) => span.text)
          .join('')
      }
      return ''
    })
    .join('\n\n')
}

// Run the fix
fixPrognoserPage()
  .then(() => {
    console.log('🎉 All fixes applied successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })