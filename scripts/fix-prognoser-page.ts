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

async function fixPrognoserPage() {
  console.log('Starting to fix prognoser page...')

  try {
    // 1. First, fetch the current page to understand its structure
    const currentPage = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!currentPage) {
      console.error('Prognoser page not found!')
      return
    }

    console.log('Found prognoser page, analyzing structure...')

    // 2. Fix the hero section with a proper image
    const heroBlock = currentPage.contentBlocks?.find((block: any) => block._type === 'hero')
    if (heroBlock) {
      console.log('Fixing hero section...')
      
      // Update hero with an image reference
      // Note: You'll need to upload an image to Sanity first and use its asset ID
      const updatedHero = {
        ...heroBlock,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            // TODO: Replace with actual Sanity image asset ID after uploading
            _ref: 'image-XXXXX-1920x1080-jpg'
          },
          alt: 'Elprognose og forecasting dashboard'
        }
      }

      // Find the hero index
      const heroIndex = currentPage.contentBlocks.findIndex((block: any) => block._key === heroBlock._key)
      currentPage.contentBlocks[heroIndex] = updatedHero
    }

    // 3. Fix Live Price Graph - add price area
    const livePriceGraphBlock = currentPage.contentBlocks?.find((block: any) => 
      block.content?.some((item: any) => item._type === 'livePriceGraph')
    )
    
    if (livePriceGraphBlock) {
      console.log('Fixing Live Price Graph...')
      
      const graphIndex = livePriceGraphBlock.content.findIndex((item: any) => item._type === 'livePriceGraph')
      if (graphIndex !== -1) {
        livePriceGraphBlock.content[graphIndex] = {
          ...livePriceGraphBlock.content[graphIndex],
          priceArea: 'DK1', // Set to DK1 by default
          showPriceCalculator: true
        }
      }
    }

    // 4. Fix Info Cards Section - convert icon objects to strings
    const infoCardsBlock = currentPage.contentBlocks?.find((block: any) => block._type === 'infoCardsSection')
    
    if (infoCardsBlock) {
      console.log('Fixing Info Cards Section icons...')
      
      // Map icon objects to string values based on common icon names
      const iconMapping: { [key: string]: string } = {
        'clock': 'clock',
        'timer': 'clock',
        'trending-up': 'trending-up',
        'chart': 'trending-up',
        'zap': 'zap',
        'lightning': 'zap',
        'shield': 'shield',
        'check': 'shield'
      }

      infoCardsBlock.cards = infoCardsBlock.cards.map((card: any) => {
        // If icon is already a string, keep it
        if (typeof card.icon === 'string') {
          return card
        }
        
        // If icon is an object, try to extract a meaningful string
        if (card.icon && typeof card.icon === 'object') {
          // Try to determine icon type from title or content
          let iconString = 'zap' // default
          
          const titleLower = card.title?.toLowerCase() || ''
          const contentLower = card.content?.toLowerCase() || ''
          
          if (titleLower.includes('time') || titleLower.includes('tid') || 
              contentLower.includes('minut') || contentLower.includes('timer')) {
            iconString = 'clock'
          } else if (titleLower.includes('pris') || titleLower.includes('price') ||
                     titleLower.includes('graf') || titleLower.includes('trend')) {
            iconString = 'trending-up'
          } else if (titleLower.includes('sikker') || titleLower.includes('garanti') ||
                     contentLower.includes('pålidelig')) {
            iconString = 'shield'
          }
          
          return {
            ...card,
            icon: iconString
          }
        }
        
        return card
      })

      // Also ensure background settings are populated
      if (!infoCardsBlock.backgroundColor) {
        infoCardsBlock.backgroundColor = 'white'
      }
      if (!infoCardsBlock.textColor) {
        infoCardsBlock.textColor = 'dark'
      }
    }

    // 5. Fix Value Proposition Box - populate with content from frontend
    const valuePropositionBlock = currentPage.contentBlocks?.find((block: any) => block._type === 'valueProposition')
    
    if (valuePropositionBlock) {
      console.log('Fixing Value Proposition Box...')
      
      // Ensure the block has proper content
      if (!valuePropositionBlock.heading) {
        valuePropositionBlock.heading = 'Præcise Elprognoser for Din Virksomhed'
      }
      
      if (!valuePropositionBlock.subheading) {
        valuePropositionBlock.subheading = 'Få adgang til pålidelige elprisprognoser og optimer dit energiforbrug'
      }

      // Ensure items have proper structure
      if (valuePropositionBlock.items && valuePropositionBlock.items.length > 0) {
        valuePropositionBlock.items = valuePropositionBlock.items.map((item: any, index: number) => {
          // Default values if missing
          const defaults = [
            {
              heading: 'Real-time Prognoser',
              description: 'Få opdaterede prognoser baseret på de seneste markedsdata og vejrudsigter'
            },
            {
              heading: 'Historisk Analyse',
              description: 'Se hvordan priserne har udviklet sig og lær af historiske mønstre'
            },
            {
              heading: 'Grøn Energi Forecast',
              description: 'Følg med i hvornår der er mest vedvarende energi på nettet'
            }
          ]

          return {
            ...item,
            _key: item._key || `item-${index}`,
            heading: item.heading || defaults[index]?.heading || `Feature ${index + 1}`,
            description: item.description || defaults[index]?.description || 'Beskrivelse mangler'
          }
        })
      }
    }

    // 6. Update the page
    console.log('Updating page in Sanity...')
    
    const result = await client.patch('page.prognoser')
      .set({ contentBlocks: currentPage.contentBlocks })
      .commit()

    console.log('✅ Successfully updated prognoser page!')
    console.log('Result:', result._id)

    // Log reminders
    console.log('\n⚠️  IMPORTANT REMINDERS:')
    console.log('1. You need to upload a hero image to Sanity and update the _ref in the hero section')
    console.log('2. The Live Price Graph now has priceArea set to "DK1" - change if needed')
    console.log('3. Info Cards icons have been converted to strings')
    console.log('4. Value Proposition content has been populated with defaults')
    console.log('\nPlease review the changes in Sanity Studio!')

  } catch (error) {
    console.error('Error fixing prognoser page:', error)
  }
}

// Run the fix
fixPrognoserPage()