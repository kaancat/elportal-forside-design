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
  console.log('Starting comprehensive fix for prognoser page...')

  try {
    // Fetch the current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('Prognoser page not found!')
      return
    }

    console.log('Found prognoser page, analyzing and fixing issues...')

    let updatedContentBlocks = [...currentPage.contentBlocks]

    // 1. Fix Hero Section - skip for now since we don't have an image
    const heroIndex = updatedContentBlocks.findIndex((block: any) => block._type === 'hero')
    if (heroIndex !== -1) {
      console.log('Hero section found - needs manual image upload')
      // We'll skip updating the hero image for now to avoid reference errors
    }

    // 2. Fix Live Price Graph - add priceArea field
    updatedContentBlocks = updatedContentBlocks.map((block: any) => {
      if (block._type === 'pageSection' && block.content) {
        const updatedContent = block.content.map((item: any) => {
          if (item._type === 'livePriceGraph') {
            console.log('Fixing Live Price Graph - adding priceArea...')
            return {
              ...item,
              priceArea: 'DK1', // Default to DK1, can be changed to DK2 if needed
              showPriceCalculator: true
            }
          }
          return item
        })
        return { ...block, content: updatedContent }
      }
      return block
    })

    // 3. Fix Info Cards Section - convert icon objects to strings
    const infoCardsIndex = updatedContentBlocks.findIndex((block: any) => block._type === 'infoCardsSection')
    if (infoCardsIndex !== -1) {
      console.log('Fixing Info Cards Section icons...')
      
      const infoCardsBlock = updatedContentBlocks[infoCardsIndex]
      
      // Fix icons based on card content
      const fixedCards = infoCardsBlock.cards.map((card: any, index: number) => {
        let iconString = 'zap' // default
        
        // Determine appropriate icon based on title and content
        const title = card.title?.toLowerCase() || ''
        const content = card.content?.toLowerCase() || ''
        
        if (title.includes('opdater') || title.includes('real-time') || 
            content.includes('minut') || content.includes('opdater')) {
          iconString = 'clock'
        } else if (title.includes('prognoser') || title.includes('forecast') ||
                   title.includes('præcis') || content.includes('nøjagtig')) {
          iconString = 'trending-up'
        } else if (title.includes('pålidelig') || title.includes('sikker') ||
                   content.includes('garanti') || content.includes('tillid')) {
          iconString = 'shield'
        } else if (title.includes('beregn') || title.includes('calculator') ||
                   content.includes('udregn')) {
          iconString = 'calculator'
        } else if (title.includes('info') || title.includes('viden')) {
          iconString = 'info'
        }
        
        return {
          ...card,
          icon: iconString
        }
      })

      updatedContentBlocks[infoCardsIndex] = {
        ...infoCardsBlock,
        cards: fixedCards,
        backgroundColor: infoCardsBlock.backgroundColor || 'white',
        textColor: infoCardsBlock.textColor || 'dark'
      }
    }

    // 4. Fix Value Proposition Box - populate with meaningful content
    const valuePropositionIndex = updatedContentBlocks.findIndex((block: any) => block._type === 'valueProposition')
    if (valuePropositionIndex !== -1) {
      console.log('Fixing Value Proposition Box...')
      
      const vpBlock = updatedContentBlocks[valuePropositionIndex]
      
      // Ensure proper heading and subheading
      if (!vpBlock.heading || vpBlock.heading.trim() === '') {
        vpBlock.heading = 'Præcise Elprognoser for Din Virksomhed'
      }
      
      if (!vpBlock.subheading || vpBlock.subheading.trim() === '') {
        vpBlock.subheading = 'Få adgang til pålidelige elprisprognoser og optimer dit energiforbrug med vores avancerede forecasting-værktøjer'
      }

      // Fix items with proper content
      const defaultItems = [
        {
          heading: 'Real-time Prognoser',
          description: 'Få opdaterede prognoser baseret på de seneste markedsdata, vejrudsigter og produktionskapacitet'
        },
        {
          heading: 'Historisk Analyse',
          description: 'Analyser historiske prismønstre og sæsonvariationer for bedre at forudsige fremtidige tendenser'
        },
        {
          heading: 'Grøn Energi Forecast',
          description: 'Se hvornår der er mest vedvarende energi på nettet og planlæg dit forbrug bæredygtigt'
        }
      ]

      // Ensure we have proper items
      if (!vpBlock.items || vpBlock.items.length === 0) {
        vpBlock.items = defaultItems.map((item, index) => ({
          _type: 'valueItem',
          _key: `value-item-${index}`,
          ...item
        }))
      } else {
        // Fix existing items
        vpBlock.items = vpBlock.items.map((item: any, index: number) => ({
          ...item,
          _type: 'valueItem',
          _key: item._key || `value-item-${index}`,
          heading: item.heading || defaultItems[index]?.heading || `Feature ${index + 1}`,
          description: item.description || defaultItems[index]?.description || 'Beskrivelse mangler'
        }))
      }

      updatedContentBlocks[valuePropositionIndex] = vpBlock
    }

    // Update the page
    console.log('Updating page in Sanity...')
    
    const result = await client.patch('qgCxJyBbKpvhb2oGYkdQx3')
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Successfully updated prognoser page!')
    console.log('Page ID:', result._id)

    // Detailed summary
    console.log('\n📋 FIXES APPLIED:')
    console.log('1. ⏭️  Hero Section - Skipped (needs manual image upload)')
    console.log('2. ✅ Live Price Graph - Added priceArea: "DK1"')
    console.log('3. ✅ Info Cards - Converted icon objects to strings')
    console.log('4. ✅ Value Proposition - Populated with meaningful content')

    console.log('\n⚠️  MANUAL STEPS REQUIRED:')
    console.log('1. Upload a hero image to Sanity Studio:')
    console.log('   - Go to https://dinelportal.sanity.studio')
    console.log('   - Navigate to Media/Assets')
    console.log('   - Upload an energy forecasting/dashboard image')
    console.log('   - Copy the asset ID (format: image-xxxxx-1920x1080-jpg)')
    console.log('   - Update the hero section with the actual asset ID')
    console.log('\n2. Suggested image themes:')
    console.log('   - Energy data visualization dashboard')
    console.log('   - Electricity grid with forecast overlay')
    console.log('   - Modern energy monitoring interface')
    console.log('   - Wind turbines with data charts')

  } catch (error) {
    console.error('Error fixing prognoser page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

// Run the fix
fixPrognoserPage()