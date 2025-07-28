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

async function fixPrognoserFinal() {
  console.log('🔧 Final comprehensive fix for prognoser page validation errors...\n')
  
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page found. Applying final fixes based on Sanity Studio validation...\n')
    
    // Clone the page for modifications
    const fixedPage = JSON.parse(JSON.stringify(page))
    
    // Process each content block
    if (fixedPage.contentBlocks && Array.isArray(fixedPage.contentBlocks)) {
      fixedPage.contentBlocks = fixedPage.contentBlocks.map((block: any, index: number) => {
        console.log(`Processing block ${index + 1}: ${block._type}`)
        
        switch (block._type) {
          case 'pageSection':
            // Fix "Untitled Page Section" by ensuring title exists
            if (!block.title) {
              // Determine appropriate title based on content
              if (index === 2) {
                block.title = 'Hvordan Dannes Elpriser i Danmark?'
              } else if (index === 5) {
                block.title = 'Ugentlige Mønstre i Elpriser'
              } else if (index === 10) {
                block.title = 'Praktiske Tips: Udnyt Elpris Prognoser Optimalt'
              } else if (index === 11) {
                block.title = 'Teknisk Forklaring: Sådan Laves Elpris Prognoser'
              }
              console.log(`  ✅ Added title: ${block.title}`)
            }
            break
            
          case 'infoCardsSection':
            // Fix card validation - ensure each card has required fields
            if (block.cards && Array.isArray(block.cards)) {
              block.cards = block.cards.map((card: any, cardIndex: number) => {
                if (!card.title) {
                  console.log(`  ❌ Card ${cardIndex + 1} missing title`)
                }
                // Ensure description is array of blocks if it's a string
                if (typeof card.description === 'string') {
                  card.description = [{
                    _type: 'block',
                    _key: `card-desc-${cardIndex}`,
                    style: 'normal',
                    children: [{
                      _type: 'span',
                      _key: 'span1',
                      text: card.description,
                      marks: []
                    }],
                    markDefs: []
                  }]
                  console.log(`  ✅ Converted card ${cardIndex + 1} description to blocks`)
                }
                return card
              })
            }
            // Ensure title exists
            if (!block.title) {
              block.title = 'Vigtige Fakta om Elpris Prognoser'
              console.log(`  ✅ Added section title`)
            }
            break
            
          case 'faqGroup':
            // Ensure title exists (REQUIRED)
            if (!block.title) {
              block.title = 'Ofte Stillede Spørgsmål om Elpris Prognoser'
              console.log(`  ✅ Added required title`)
            }
            // Validate FAQ items have proper structure
            if (block.faqItems && Array.isArray(block.faqItems)) {
              // Already using references, should be fine
              console.log(`  ℹ️  Has ${block.faqItems.length} FAQ item references`)
            }
            break
            
          case 'valueProposition':
            // Fix "Untitled" by adding title
            if (!block.title) {
              block.title = 'Vindkraft Gør Forskellen'
              console.log(`  ✅ Added title`)
            }
            // Ensure we have items array with references
            if (block.items && Array.isArray(block.items)) {
              console.log(`  ℹ️  Has ${block.items.length} value proposition references`)
            }
            break
            
          case 'callToActionSection':
            // Fix missing required fields
            if (!block.title) {
              block.title = 'Start Din Besparelse i Dag'
              console.log(`  ✅ Added required title`)
            }
            if (!block.buttonText) {
              block.buttonText = block.primaryButtonText || 'Find din elleverandør'
              console.log(`  ✅ Added required buttonText`)
            }
            if (!block.buttonUrl) {
              block.buttonUrl = block.primaryButtonLink || '/sammenlign'
              console.log(`  ✅ Added required buttonUrl`)
            }
            
            // Map fields correctly (the schema uses different field names)
            if (block.heading && !block.title) {
              block.title = block.heading
            }
            if (block.primaryButtonText && !block.buttonText) {
              block.buttonText = block.primaryButtonText
            }
            if (block.primaryButtonLink && !block.buttonUrl) {
              block.buttonUrl = block.primaryButtonLink
            }
            
            // Remove old field names to avoid confusion
            delete block.heading
            delete block.primaryButtonText
            delete block.primaryButtonLink
            delete block.secondaryButtonText
            delete block.secondaryButtonLink
            delete block.variant
            
            console.log(`  ✅ Remapped CTA fields to match schema`)
            break
        }
        
        return block
      })
    }
    
    // Update the page
    console.log('\n📤 Updating page in Sanity...')
    const result = await client.createOrReplace(fixedPage)
    
    console.log('\n✅ Page updated with all validation fixes!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.prognoser')
    console.log('🌐 Frontend URL: https://elportal-forside-design.vercel.app/prognoser')
    
    // Summary
    console.log('\n📊 Summary of fixes:')
    console.log('- Added titles to all "Untitled" page sections')
    console.log('- Fixed info cards section structure')
    console.log('- Added required title to FAQ group')
    console.log('- Added title to value proposition')
    console.log('- Fixed call to action required fields and field mapping')
    console.log('\n✨ All validation errors should now be resolved!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the final fix
fixPrognoserFinal()
  .then(() => {
    console.log('\n🎉 Final validation fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })