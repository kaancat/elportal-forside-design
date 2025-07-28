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

async function fixPrognoserContent() {
  console.log('🔧 Fixing prognoser page content and validation errors...\n')
  
  try {
    // First, fetch the current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    console.log('✅ Found prognoser page:', currentPage.title)
    
    // Create proper FAQ items with unique IDs
    console.log('\n📝 Creating FAQ items...')
    const faqItems = [
      {
        _id: `faq-prognoser-${Date.now()}-1`,
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
        _id: `faq-prognoser-${Date.now()}-2`,
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
        _id: `faq-prognoser-${Date.now()}-3`,
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
        _id: `faq-prognoser-${Date.now()}-4`,
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
    
    // Create FAQ items
    const createdFaqs = []
    for (const faq of faqItems) {
      const created = await client.createOrReplace(faq)
      createdFaqs.push(created)
      console.log(`✅ Created FAQ: ${faq.question}`)
    }
    
    // Now update the page content
    console.log('\n📄 Updating page content...')
    
    // Find and update content blocks
    const updatedBlocks = currentPage.contentBlocks.map(block => {
      // Replace dailyPriceTimeline with livePriceGraph
      if (block._type === 'dailyPriceTimeline') {
        console.log('🔄 Replacing dailyPriceTimeline with livePriceGraph')
        return {
          _key: block._key,
          _type: 'livePriceGraph',
          title: 'Elpriser Time for Time - Næste 48 Timer',
          subtitle: 'Se præcis hvornår strømmen er billigst i morgen. Grønne timer viser lav pris, røde timer viser høj pris. Opdateres dagligt kl. 13:00.',
          apiRegion: 'both',
          headerAlignment: 'center'
        }
      }
      
      // Fix FAQ group references
      if (block._type === 'faqGroup') {
        console.log('🔄 Updating FAQ group references')
        return {
          ...block,
          faqItems: createdFaqs.map(faq => ({
            _type: 'reference',
            _ref: faq._id,
            _key: `ref-${faq._id}`
          }))
        }
      }
      
      // Update info cards section
      if (block._type === 'infoCardsSection') {
        console.log('🔄 Fixing infoCardsSection')
        return {
          _key: block._key,
          _type: 'infoCardsSection',
          title: 'Vigtige Fakta om Elpris Prognoser',
          subtitle: 'Alt du behøver at vide for at udnytte elpris prognoser optimalt',
          headerAlignment: 'center',
          cards: [
            {
              _key: 'card1',
              title: 'Daglig Opdatering',
              description: [
                {
                  _type: 'block',
                  _key: 'card1-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Elpriser for næste dag offentliggøres hver dag kl. 13:00',
                      _key: 'card1-span1'
                    }
                  ]
                }
              ],
              icon: {
                _type: 'iconPicker',
                name: 'Clock',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
              }
            },
            {
              _key: 'card2',
              title: '48 Timers Horisont',
              description: [
                {
                  _type: 'block',
                  _key: 'card2-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Vi viser altid priser for i dag og i morgen time for time',
                      _key: 'card2-span1'
                    }
                  ]
                }
              ],
              icon: {
                _type: 'iconPicker',
                name: 'Calendar',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
              }
            },
            {
              _key: 'card3',
              title: 'Vejrbaseret',
              description: [
                {
                  _type: 'block',
                  _key: 'card3-block1',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Vindprognoser er afgørende for præcise prisprognoser',
                      _key: 'card3-span1'
                    }
                  ]
                }
              ],
              icon: {
                _type: 'iconPicker',
                name: 'Cloud',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>'
              }
            }
          ],
          columns: 3
        }
      }
      
      // Return unchanged blocks
      return block
    })
    
    // Update the page
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Page updated successfully!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + currentPage._id)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixPrognoserContent()
  .then(() => {
    console.log('\n🎉 Content fixes completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })