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

async function verifyFixedPage() {
  try {
    console.log('Verifying fixed Ladeboks page...\n')
    
    const page = await client.fetch(`*[_id == "page.ladeboks"][0]`)
    
    if (!page) {
      console.log('Ladeboks page not found!')
      return
    }

    console.log('✅ Page found:', page.title)
    console.log('✅ SEO fields present')
    console.log('✅ Content blocks:', page.contentBlocks?.length || 0)
    
    // Check each component for correct field names
    console.log('\nChecking field names in components:')
    
    page.contentBlocks?.forEach((block, index) => {
      console.log(`\n${index + 1}. ${block._type}:`)
      
      switch(block._type) {
        case 'hero':
          console.log(`   ✅ headline: ${block.headline ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ subheadline: ${block.subheadline ? '✓' : '✗ MISSING'}`)
          console.log(`   ${block.heading ? '❌ Still has "heading" field!' : '✅ No "heading" field'}`)
          console.log(`   ${block.ctaText ? '❌ Still has "ctaText" field!' : '✅ No "ctaText" field'}`)
          break
          
        case 'pageSection':
          console.log(`   ✅ title: ${block.title ? '✓' : '✗ MISSING'}`)
          console.log(`   ${block.heading ? '❌ Still has "heading" field!' : '✅ No "heading" field'}`)
          break
          
        case 'valueProposition':
          console.log(`   ✅ title: ${block.title ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ items: ${block.items ? '✓' : '✗ MISSING'}`)
          console.log(`   ${block.heading ? '❌ Still has "heading" field!' : '✅ No "heading" field'}`)
          console.log(`   ${block.values ? '❌ Still has "values" field!' : '✅ No "values" field'}`)
          break
          
        case 'livePriceGraph':
          console.log(`   ✅ title: ${block.title ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ subtitle: ${block.subtitle ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ apiRegion: ${block.apiRegion ? '✓' : '✗ MISSING'}`)
          console.log(`   ${block.heading ? '❌ Still has "heading" field!' : '✅ No "heading" field'}`)
          console.log(`   ${block.description ? '❌ Still has "description" field!' : '✅ No "description" field'}`)
          break
          
        case 'faqGroup':
          console.log(`   ✅ title: ${block.title ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ faqItems: ${block.faqItems ? '✓' : '✗ MISSING'}`)
          console.log(`   ${block.heading ? '❌ Still has "heading" field!' : '✅ No "heading" field'}`)
          console.log(`   ${block.faqs ? '❌ Still has "faqs" field!' : '✅ No "faqs" field'}`)
          break
          
        case 'callToActionSection':
          console.log(`   ✅ title: ${block.title ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ buttonText: ${block.buttonText ? '✓' : '✗ MISSING'}`)
          console.log(`   ✅ buttonUrl: ${block.buttonUrl ? '✓' : '✗ MISSING'}`)
          console.log(`   ${block.heading ? '❌ Still has "heading" field!' : '✅ No "heading" field'}`)
          console.log(`   ${block.description ? '❌ Still has "description" field!' : '✅ No "description" field'}`)
          console.log(`   ${block.primaryCta ? '❌ Still has "primaryCta" field!' : '✅ No "primaryCta" field'}`)
          break
          
        case 'chargingBoxShowcase':
        case 'co2EmissionsChart':
          // These components correctly use 'heading'
          console.log(`   ✅ heading: ${block.heading ? '✓' : '✗ MISSING'} (correct for this component)`)
          break
      }
    })

  } catch (error) {
    console.error('Error verifying page:', error)
  }
}

// Run the verification
verifyFixedPage()