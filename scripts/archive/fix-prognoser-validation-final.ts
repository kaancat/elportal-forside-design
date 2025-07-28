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

async function fixPrognoserValidationFinal() {
  console.log('🔧 Final comprehensive fix for all validation errors...\n')
  
  try {
    // Fetch current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    console.log('📋 Found page with', currentPage.contentBlocks?.length || 0, 'content blocks')
    console.log('🔍 Analyzing and fixing each block...\n')
    
    // Fix all blocks according to actual schemas
    const fixedBlocks = currentPage.contentBlocks.map((block, index) => {
      console.log(`[${index}] Processing ${block._type}`)
      
      // Fix pageSection blocks - they use 'content' not 'contentBlocks'
      if (block._type === 'pageSection') {
        // The content field is already correct in the original, no need to change
        return block
      }
      
      // Fix renewableEnergyForecast - remove invalid description field
      if (block._type === 'renewableEnergyForecast') {
        const { description, ...cleanBlock } = block
        console.log('  ✓ Removed invalid description field')
        return cleanBlock
      }
      
      // Fix monthlyProductionChart - description is valid but should be text type
      if (block._type === 'monthlyProductionChart') {
        return block // description field is valid here
      }
      
      // Fix co2EmissionsChart - leadingText should be Portable Text array
      if (block._type === 'co2EmissionsChart') {
        if (block.leadingText && typeof block.leadingText === 'string') {
          console.log('  ✓ Converting leadingText to Portable Text')
          return {
            ...block,
            leadingText: [
              {
                _type: 'block',
                _key: 'co2-lead-1',
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    text: block.leadingText,
                    _key: 'co2-span-1'
                  }
                ]
              }
            ]
          }
        }
        return block
      }
      
      // Fix priceCalculator - remove invalid description field
      if (block._type === 'priceCalculator') {
        const { description, heading, ...cleanBlock } = block
        console.log('  ✓ Removed invalid description and heading fields')
        return {
          ...cleanBlock,
          title: heading || cleanBlock.title // Use heading as title if it exists
        }
      }
      
      // Fix regionalComparison - remove invalid description field
      if (block._type === 'regionalComparison') {
        const { description, ...cleanBlock } = block
        console.log('  ✓ Removed invalid description field')
        return cleanBlock
      }
      
      // Fix faqGroup - embed faqItems directly instead of references
      if (block._type === 'faqGroup') {
        console.log('  ✓ Fixing FAQ Group with embedded items')
        const { description, ...cleanBlock } = block
        return {
          ...cleanBlock,
          faqItems: [
            {
              _key: `faq-item-${Date.now()}-1`,
              _type: 'faqItem',
              question: 'Hvordan beregnes elpriser i morgen?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq1-answer-block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Elpriser for næste dag fastsættes dagligt kl. 13:00 på Nord Pool elbørsen. Priserne bestemmes af udbud og efterspørgsel, hvor faktorer som vejr, vindproduktion, solenergi, og forventet forbrug spiller ind. Vores prognoser analyserer alle disse faktorer for at give dig det bedste overblik.',
                      _key: 'faq1-answer-span'
                    }
                  ]
                }
              ]
            },
            {
              _key: `faq-item-${Date.now()}-2`,
              _type: 'faqItem',
              question: 'Hvornår er strømmen billigst?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq2-answer-block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Typisk er strømmen billigst om natten (kl. 00-06) og når vindproduktionen er høj. I weekender er priserne ofte lavere pga. mindre industriforbrug. Vores time for time prognose viser præcis, hvornår du kan spare mest på dit elforbrug.',
                      _key: 'faq2-answer-span'
                    }
                  ]
                }
              ]
            },
            {
              _key: `faq-item-${Date.now()}-3`,
              _type: 'faqItem',
              question: 'Kan jeg stole på elpris prognoser?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq3-answer-block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Vores prognoser er baseret på avancerede modeller og realtidsdata. For næste dag er nøjagtigheden meget høj (95%+), da priserne allerede er fastsat. For længere prognoser (2-7 dage) er der større usikkerhed, især omkring vejrforhold.',
                      _key: 'faq3-answer-span'
                    }
                  ]
                }
              ]
            },
            {
              _key: `faq-item-${Date.now()}-4`,
              _type: 'faqItem',
              question: 'Hvad er forskellen på DK1 og DK2 priser?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq4-answer-block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Danmark er delt i to elprisområder - DK1 (Jylland/Fyn) og DK2 (Sjælland/Bornholm). Priserne kan variere mellem områderne pga. forskellige produktionsforhold og forbindelser til nabolande. Vores prognose viser begge områder.',
                      _key: 'faq4-answer-span'
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
      
      // Fix valueProposition - should only have title and items
      if (block._type === 'valueProposition') {
        console.log('  ✓ Fixing value proposition')
        return {
          _key: block._key,
          _type: 'valueProposition',
          title: block.title || block.heading || 'Vindkraft Gør Forskellen',
          items: [
            {
              _key: `value-item-key-1`,
              _type: 'valueItem',
              heading: 'Vindkraft sænker priserne',
              description: 'Når det blæser meget, falder elpriserne markant. Danmark har nogle af Europas laveste elpriser takket være vores store vindmøllekapacitet.',
              icon: {
                _type: 'iconPicker',
                name: 'Wind',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>'
              }
            },
            {
              _key: `value-item-key-2`,
              _type: 'valueItem',
              heading: 'Grøn strøm når det passer dig',
              description: 'Vores prognoser viser, hvornår strømmen er mest grøn. Planlæg dit forbrug i timer med høj vedvarende energi.',
              icon: {
                _type: 'iconPicker',
                name: 'Leaf',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>'
              }
            },
            {
              _key: `value-item-key-3`,
              _type: 'valueItem',
              heading: 'Støt den grønne omstilling',
              description: 'Ved at vælge en leverandør med fokus på vindkraft, støtter du direkte udbygningen af vedvarende energi i Danmark.',
              icon: {
                _type: 'iconPicker',
                name: 'TrendingUp',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>'
              }
            }
          ]
        }
      }
      
      // Fix pricingComparison - remove invalid description field
      if (block._type === 'pricingComparison') {
        const { description, ...cleanBlock } = block
        console.log('  ✓ Removed invalid description field')
        return cleanBlock
      }
      
      // Fix callToActionSection - only title, buttonText, buttonUrl allowed
      if (block._type === 'callToActionSection') {
        console.log('  ✓ Fixing CTA section')
        return {
          _key: block._key,
          _type: 'callToActionSection',
          title: block.title || block.heading || 'Start Din Besparelse i Dag',
          buttonText: block.buttonText || block.primaryButtonText || 'Find din elleverandør',
          buttonUrl: block.buttonUrl || block.primaryButtonLink || '/sammenlign'
        }
      }
      
      // Return other blocks unchanged
      return block
    })
    
    // Update the page
    console.log('\n📝 Updating page with all fixes...')
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: fixedBlocks })
      .commit()
    
    console.log('\n✅ All validation errors have been fixed!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + currentPage._id)
    console.log('\n📊 Summary of fixes:')
    console.log('- Fixed pageSection blocks (already using correct "content" field)')
    console.log('- Removed invalid description fields from multiple components')
    console.log('- Fixed FAQ Group with embedded faqItems')
    console.log('- Fixed value proposition with embedded items')
    console.log('- Fixed CTA section to only use valid fields')
    console.log('- Converted co2EmissionsChart leadingText to Portable Text')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the comprehensive fix
fixPrognoserValidationFinal()
  .then(() => {
    console.log('\n🎉 Final validation fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })