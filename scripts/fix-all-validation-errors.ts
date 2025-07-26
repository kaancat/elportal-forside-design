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

async function fixAllValidationErrors() {
  console.log('🔧 Fixing all validation errors on prognoser page...\n')
  
  try {
    // Fetch current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    // Create value items for value proposition
    console.log('📝 Creating value items...')
    const valueItems = [
      {
        _id: `value-item-${Date.now()}-1`,
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
        _id: `value-item-${Date.now()}-2`,
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
        _id: `value-item-${Date.now()}-3`,
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
    
    // Create value items
    const createdValueItems = []
    for (const item of valueItems) {
      const created = await client.createOrReplace(item)
      createdValueItems.push(created)
      console.log(`✅ Created value item: ${item.heading}`)
    }
    
    // Now fix the content blocks
    console.log('\n📄 Fixing content blocks...')
    
    const fixedBlocks = currentPage.contentBlocks.map(block => {
      // Fix FAQ Group - use direct embeds instead of references
      if (block._type === 'faqGroup') {
        console.log('🔄 Fixing FAQ Group')
        return {
          ...block,
          faqItems: [
            {
              _key: `faq-${Date.now()}-1`,
              _type: 'faqItem',
              question: 'Hvordan beregnes elpriser i morgen?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq1-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Elpriser for næste dag fastsættes dagligt kl. 13:00 på Nord Pool elbørsen. Priserne bestemmes af udbud og efterspørgsel, hvor faktorer som vejr, vindproduktion, solenergi, og forventet forbrug spiller ind. Vores prognoser analyserer alle disse faktorer for at give dig det bedste overblik.',
                      _key: 'faq1-span1'
                    }
                  ]
                }
              ]
            },
            {
              _key: `faq-${Date.now()}-2`,
              _type: 'faqItem',
              question: 'Hvornår er strømmen billigst?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq2-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Typisk er strømmen billigst om natten (kl. 00-06) og når vindproduktionen er høj. I weekender er priserne ofte lavere pga. mindre industriforbrug. Vores time for time prognose viser præcis, hvornår du kan spare mest på dit elforbrug.',
                      _key: 'faq2-span1'
                    }
                  ]
                }
              ]
            },
            {
              _key: `faq-${Date.now()}-3`,
              _type: 'faqItem',
              question: 'Kan jeg stole på elpris prognoser?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq3-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Vores prognoser er baseret på avancerede modeller og realtidsdata. For næste dag er nøjagtigheden meget høj (95%+), da priserne allerede er fastsat. For længere prognoser (2-7 dage) er der større usikkerhed, især omkring vejrforhold.',
                      _key: 'faq3-span1'
                    }
                  ]
                }
              ]
            },
            {
              _key: `faq-${Date.now()}-4`,
              _type: 'faqItem',
              question: 'Hvad er forskellen på DK1 og DK2 priser?',
              answer: [
                {
                  _type: 'block',
                  _key: 'faq4-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Danmark er delt i to elprisområder - DK1 (Jylland/Fyn) og DK2 (Sjælland/Bornholm). Priserne kan variere mellem områderne pga. forskellige produktionsforhold og forbindelser til nabolande. Vores prognose viser begge områder.',
                      _key: 'faq4-span1'
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
      
      // Fix Value Proposition
      if (block._type === 'valueProposition') {
        console.log('🔄 Fixing Value Proposition')
        return {
          _key: block._key,
          _type: 'valueProposition',
          title: 'Vindkraft Gør Forskellen',
          items: createdValueItems.map(item => ({
            _type: 'reference',
            _ref: item._id,
            _key: `ref-${item._id}`
          }))
        }
      }
      
      // Fix CTA Section
      if (block._type === 'callToActionSection') {
        console.log('🔄 Fixing CTA Section')
        return {
          _key: block._key,
          _type: 'callToActionSection',
          title: 'Start Din Besparelse i Dag',
          buttonText: 'Find din elleverandør',
          buttonUrl: '/sammenlign'
        }
      }
      
      // Fix pricing comparison if it exists
      if (block._type === 'pricingComparison') {
        console.log('🔄 Fixing Pricing Comparison')
        return {
          ...block,
          title: block.title || 'Fast Pris eller Variabel? Prognoser Hjælper Dig Vælge',
          subtitle: block.subtitle || 'Med gode prognoser kan variable priser være det bedste valg for de fleste.',
          leadingText: block.leadingText || [
            {
              _type: 'block',
              _key: 'pricing-lead',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Variable elpriser giver dig mulighed for at spare penge ved at flytte dit forbrug til billige timer. Med vores prognoser kan du se præcis, hvornår det bedst kan betale sig.',
                  _key: 'pricing-span'
                }
              ]
            }
          ]
        }
      }
      
      // Return other blocks unchanged
      return block
    })
    
    // Update the page
    console.log('\n📝 Updating page with fixed content...')
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: fixedBlocks })
      .commit()
    
    console.log('\n✅ All validation errors fixed!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + currentPage._id)
    
    // Clean up old FAQ items that might be orphaned
    console.log('\n🧹 Cleaning up old FAQ items...')
    const oldFaqIds = [
      'faq-prognoser-1753558711191-1',
      'faq-prognoser-1753558711191-2', 
      'faq-prognoser-1753558711191-3',
      'faq-prognoser-1753558711191-4'
    ]
    
    for (const id of oldFaqIds) {
      try {
        await client.delete(id)
        console.log(`✅ Deleted old FAQ item: ${id}`)
      } catch (e) {
        // Ignore if already deleted
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixAllValidationErrors()
  .then(() => {
    console.log('\n🎉 All validation errors have been fixed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })