import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixInfoCardsSection() {
  try {
    console.log('Fetching historiske-priser page...')
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('historiske-priser page not found')
      return
    }

    // Find the saving-tips infoCardsSection
    const savingTipsIndex = page.contentBlocks.findIndex(
      (block: any) => block._key === 'saving-tips'
    )

    if (savingTipsIndex === -1) {
      console.error('saving-tips section not found')
      return
    }

    const savingTipsSection = page.contentBlocks[savingTipsIndex]
    
    console.log('\nCurrent saving-tips section:')
    console.log('Title:', savingTipsSection.title)
    console.log('Type:', savingTipsSection._type)
    console.log('Cards count:', savingTipsSection.cards?.length || 0)
    
    // Check if the content is there but maybe not displaying properly
    if (savingTipsSection.cards && savingTipsSection.cards.length > 0) {
      console.log('\n✅ The infoCardsSection has content!')
      console.log('Cards:')
      savingTipsSection.cards.forEach((card: any) => {
        console.log(`- ${card.title}: ${card.icon || 'no icon'}`)
      })
      
      console.log('\nThe issue might be in Sanity Studio display, not the data.')
      console.log('The content exists and should display on the frontend.')
      
      // Let's ensure the icons are properly structured
      const updatedCards = savingTipsSection.cards.map((card: any) => {
        // If icon is just a string, convert to proper icon.manager format
        if (typeof card.icon === 'string') {
          return {
            ...card,
            icon: {
              _type: 'icon.manager',
              icon: `lucide:${card.icon}`,
              metadata: {
                iconName: card.icon,
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: `https://lucide.dev/icons/${card.icon}`,
                size: { width: 24, height: 24 }
              }
            }
          }
        }
        return card
      })
      
      // Update only if needed
      const needsUpdate = updatedCards.some((card: any, index: number) => 
        card !== savingTipsSection.cards[index]
      )
      
      if (needsUpdate) {
        const updatedContentBlocks = [...page.contentBlocks]
        updatedContentBlocks[savingTipsIndex] = {
          ...savingTipsSection,
          cards: updatedCards
        }
        
        const result = await client
          .patch(page._id)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
          
        console.log('\n✅ Updated icon structures for better Sanity Studio display')
      } else {
        console.log('\n✅ Icons are already properly structured')
      }
      
    } else {
      console.log('\n❌ The infoCardsSection is missing cards data!')
      console.log('This needs to be populated with the content from frontend.')
      
      // Recreate the full content based on the frontend display
      const fullContent = {
        ...savingTipsSection,
        cards: [
          {
            _key: 'flexibility',
            _type: 'infoCard',
            title: 'Vær Fleksibel',
            content: [
              {
                _type: 'block',
                _key: 'flex-block',
                children: [
                  {
                    _type: 'span',
                    _key: 'flex-span',
                    text: 'Flyt dit forbrug til timer med lave priser. Brug timere på vaskemaskine, opvaskemaskine og varmepumpe. Historisk data viser besparelser på 20-30%.',
                    marks: []
                  }
                ],
                style: 'normal',
                markDefs: []
              }
            ],
            highlight: false,
            icon: {
              _type: 'icon.manager',
              icon: 'lucide:clock',
              metadata: {
                iconName: 'clock',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/clock',
                size: { width: 24, height: 24 }
              }
            }
          },
          {
            _key: 'monitor',
            _type: 'infoCard',
            title: 'Overvåg Priser',
            content: [
              {
                _type: 'block',
                _key: 'monitor-block',
                children: [
                  {
                    _type: 'span',
                    _key: 'monitor-span',
                    text: 'Følg daglige og timevise prisudsving. Brug apps eller vores prisgraf til at se næste dags priser kl. 13:00. Planlæg stort forbrug efter prisfald.',
                    marks: []
                  }
                ],
                style: 'normal',
                markDefs: []
              }
            ],
            highlight: true,
            icon: {
              _type: 'icon.manager',
              icon: 'lucide:chart',
              metadata: {
                iconName: 'chart',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/chart',
                size: { width: 24, height: 24 }
              }
            }
          },
          {
            _key: 'seasonal',
            _type: 'infoCard',
            title: 'Tænk Sæson',
            content: [
              {
                _type: 'block',
                _key: 'seasonal-block',
                children: [
                  {
                    _type: 'span',
                    _key: 'seasonal-span',
                    text: 'Overvej fast pris om vinteren hvis du har højt varmeforbrug. Skift til variabel pris om sommeren for at udnytte lave priser og negative perioder.',
                    marks: []
                  }
                ],
                style: 'normal',
                markDefs: []
              }
            ],
            highlight: false,
            icon: {
              _type: 'icon.manager',
              icon: 'lucide:calendar',
              metadata: {
                iconName: 'calendar',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/calendar',
                size: { width: 24, height: 24 }
              }
            }
          },
          {
            _key: 'invest',
            _type: 'infoCard',
            title: 'Invester Smart',
            content: [
              {
                _type: 'block',
                _key: 'invest-block',
                children: [
                  {
                    _type: 'span',
                    _key: 'invest-span',
                    text: 'Batterier, solceller og smart home-løsninger betaler sig hurtigere med varierende priser. Historisk data hjælper med at beregne tilbagebetalingstid.',
                    marks: []
                  }
                ],
                style: 'normal',
                markDefs: []
              }
            ],
            highlight: true,
            icon: {
              _type: 'icon.manager',
              icon: 'lucide:lightbulb',
              metadata: {
                iconName: 'lightbulb',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/lightbulb',
                size: { width: 24, height: 24 }
              }
            }
          }
        ],
        colorScheme: 'gradient',
        columns: 2,
        description: [
          {
            _type: 'block',
            _key: 'desc-block',
            children: [
              {
                _type: 'span',
                _key: 'desc-span',
                text: 'Praktiske tips baseret på analyser af historiske elpriser og forbrugsmønstre.',
                marks: []
              }
            ],
            style: 'normal',
            markDefs: []
          }
        ]
      }
      
      const updatedContentBlocks = [...page.contentBlocks]
      updatedContentBlocks[savingTipsIndex] = fullContent
      
      const result = await client
        .patch(page._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
        
      console.log('\n✅ Populated infoCardsSection with full content!')
    }

  } catch (error) {
    console.error('Error fixing info cards section:', error)
  }
}

// Run the update
fixInfoCardsSection()