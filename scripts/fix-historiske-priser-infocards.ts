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

async function fixHistoriskePriserInfoCards() {
  console.log('🔧 Fixing historiske-priser infoCardsSection...')
  
  try {
    // Fetch the page
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _rev,
      contentBlocks
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Found page, checking contentBlocks...')
    
    // Find the infoCardsSection
    const infoCardIndex = page.contentBlocks.findIndex((block: any) => 
      block._type === 'infoCardsSection'
    )
    
    if (infoCardIndex === -1) {
      console.error('❌ InfoCardsSection not found!')
      return
    }
    
    console.log(`✅ Found infoCardsSection at index ${infoCardIndex}`)
    
    // Create the corrected cards with proper structure
    const correctedCards = [
      {
        title: 'Timing er Alt',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Historiske data viser, at elpriser typisk er lavest om natten (kl. 00-06) og i weekender. Planlæg energikrævende aktiviteter i disse perioder.'
              }
            ],
            markDefs: []
          }
        ],
        icon: 'clock',
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Sæsonvariationer',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Sommerperioden har historisk set de laveste priser grundet mindre opvarmningsbehov og højere solcelleproduktion.'
              }
            ],
            markDefs: []
          }
        ],
        icon: 'zap', // Changed from 'sun' to valid icon
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        title: 'Følg Tendenserne',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Brug historiske mønstre til at forudsige fremtidige prisudsving. Vindrige perioder giver konsekvent lavere priser.'
              }
            ],
            markDefs: []
          }
        ],
        icon: 'trending-up', // Changed from 'chart' to valid icon
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Prisspidser',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Historisk data viser prisspidser kl. 17-20 på hverdage. Undgå stort forbrug i disse timer for at spare penge.'
              }
            ],
            markDefs: []
          }
        ],
        icon: 'shield', // Changed from 'alert' to valid icon
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ]
    
    // Update the contentBlock
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[infoCardIndex] = {
      ...updatedContentBlocks[infoCardIndex],
      title: 'Sådan Udnytter Du Historiske Prismønstre',
      subtitle: undefined, // Clear the subtitle
      cards: correctedCards,
      columns: 4,
      headerAlignment: 'center'
    }
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Page updated successfully!')
    
    // Verify the update
    const updatedPage = await client.fetch(query)
    const updatedSection = updatedPage.contentBlocks[infoCardIndex]
    
    console.log('\n📊 Verification:')
    console.log(`- Cards count: ${updatedSection.cards?.length || 0}`)
    console.log(`- Columns: ${updatedSection.columns}`)
    console.log('- Cards icons:', updatedSection.cards?.map((c: any) => c.icon).join(', '))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

function generateKey() {
  return Math.random().toString(36).substring(2, 9)
}

// Run the fix
fixHistoriskePriserInfoCards()