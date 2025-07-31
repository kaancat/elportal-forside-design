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

function generateKey() {
  return Math.random().toString(36).substring(2, 15)
}

async function fixPrognoserPage() {
  console.log('🔧 Starting comprehensive fix for prognoser page...')

  try {
    // 1. Fetch the current page
    const currentPage = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!currentPage) {
      console.error('❌ Prognoser page not found!')
      return
    }

    console.log('✅ Found prognoser page, analyzing structure...')

    // Make a copy of contentBlocks to work with
    let updatedContentBlocks = [...currentPage.contentBlocks]

    // 2. Fix the hero section
    const heroIndex = updatedContentBlocks.findIndex((block: any) => block._type === 'hero')
    if (heroIndex !== -1) {
      console.log('🖼️  Fixing hero section...')
      
      // Create updated hero with placeholder for image
      updatedContentBlocks[heroIndex] = {
        ...updatedContentBlocks[heroIndex],
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            // This will need to be replaced with actual asset ID after uploading
            _ref: 'image-placeholder-1920x1080-jpg'
          },
          alt: 'Elprognose og forecasting dashboard med real-time data'
        }
      }

      console.log(`
⚠️  HERO IMAGE INSTRUCTIONS:
1. Go to Unsplash.com and search for:
   - "analytics dashboard dark"
   - "data visualization energy"
   - "forecasting charts"
   - "electricity grid monitoring"
   
2. Download a high-quality image (1920x1080 or larger)

3. Upload to Sanity Studio:
   - Go to https://dinelportal.sanity.studio
   - Click Media/Assets
   - Upload the image
   - Copy the asset ID (format: image-XXXXX-1920x1080-jpg)

4. Update the script with the actual asset ID
`)
    }

    // 3. Fix Live Price Graph - add priceArea field
    updatedContentBlocks = updatedContentBlocks.map((block: any) => {
      if (block._type === 'pageSection' && block.content) {
        const updatedContent = block.content.map((item: any) => {
          if (item._type === 'livePriceGraph') {
            console.log('📊 Fixing Live Price Graph - adding priceArea...')
            return {
              ...item,
              priceArea: 'DK1', // Default to DK1
              showPriceCalculator: true,
              height: 400
            }
          }
          return item
        })
        return { ...block, content: updatedContent }
      }
      return block
    })

    // 4. Fix Info Cards Section - convert icon objects to strings
    const infoCardsIndex = updatedContentBlocks.findIndex((block: any) => block._type === 'infoCardsSection')
    if (infoCardsIndex !== -1) {
      console.log('🎯 Fixing Info Cards Section icons...')
      
      const infoCardsBlock = updatedContentBlocks[infoCardsIndex]
      
      // Define icon mapping based on card content
      const updatedCards = infoCardsBlock.cards.map((card: any, index: number) => {
        let iconString = 'zap' // default
        
        // Determine icon based on title or content
        const titleLower = (card.title || '').toLowerCase()
        const contentLower = (card.content || '').toLowerCase()
        
        if (titleLower.includes('opdater') || titleLower.includes('real-time') || 
            contentLower.includes('minut') || contentLower.includes('timer')) {
          iconString = 'clock'
        } else if (titleLower.includes('pris') || titleLower.includes('prognos') ||
                   titleLower.includes('forecast') || contentLower.includes('forudsig')) {
          iconString = 'trending-up'
        } else if (titleLower.includes('pålidelig') || titleLower.includes('præcis') ||
                   contentLower.includes('nøjagtig') || contentLower.includes('kvalitet')) {
          iconString = 'shield'
        } else if (titleLower.includes('beregn') || titleLower.includes('kalkul') ||
                   contentLower.includes('optimal')) {
          iconString = 'calculator'
        } else if (titleLower.includes('energi') || titleLower.includes('strøm')) {
          iconString = 'zap'
        } else if (titleLower.includes('info') || titleLower.includes('data')) {
          iconString = 'info'
        }
        
        // Map specific card positions to icons
        const positionIconMap = ['clock', 'trending-up', 'shield', 'calculator', 'zap', 'info']
        if (index < positionIconMap.length) {
          iconString = positionIconMap[index]
        }
        
        return {
          ...card,
          _key: card._key || generateKey(),
          icon: iconString,
          // Ensure all fields are populated
          title: card.title || `Feature ${index + 1}`,
          content: card.content || 'Beskrivelse kommer snart'
        }
      })

      // Update the info cards block with proper settings
      updatedContentBlocks[infoCardsIndex] = {
        ...infoCardsBlock,
        cards: updatedCards,
        backgroundColor: infoCardsBlock.backgroundColor || 'gray',
        textColor: infoCardsBlock.textColor || 'dark',
        cardStyle: infoCardsBlock.cardStyle || 'bordered',
        columns: infoCardsBlock.columns || 3
      }
    }

    // 5. Fix Value Proposition Box - populate with relevant content
    const valuePropositionIndex = updatedContentBlocks.findIndex((block: any) => block._type === 'valueProposition')
    if (valuePropositionIndex !== -1) {
      console.log('💡 Fixing Value Proposition Box...')
      
      const valuePropositionBlock = updatedContentBlocks[valuePropositionIndex]
      
      // Create comprehensive forecasting-focused content
      const forecastingItems = [
        {
          _key: generateKey(),
          _type: 'valueItem',
          heading: 'AI-Drevne Prognoser',
          description: 'Vores avancerede algoritmer analyserer historiske data, vejrudsigter og markedstendenser for at give dig de mest præcise elprisprognoser.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          heading: 'Timepræcise Forudsigelser',
          description: 'Få detaljerede prognoser time for time op til 48 timer frem, så du kan planlægge dit energiforbrug når priserne er lavest.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          heading: 'Grøn Energi Timing',
          description: 'Se hvornår der er mest vedvarende energi på nettet og bidrag til den grønne omstilling ved at forbruge på de rigtige tidspunkter.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          heading: 'Prisalarmer & Notifikationer',
          description: 'Modtag automatiske advarsler når elpriserne falder under din grænse, så du aldrig går glip af de bedste priser.'
        }
      ]

      updatedContentBlocks[valuePropositionIndex] = {
        ...valuePropositionBlock,
        _key: valuePropositionBlock._key || generateKey(),
        heading: 'Præcise Elprognoser for Optimal Planlægning',
        subheading: 'Udnyt avanceret forecasting til at minimere dine elomkostninger og maksimere brugen af grøn energi',
        items: forecastingItems,
        backgroundColor: valuePropositionBlock.backgroundColor || 'white',
        layout: valuePropositionBlock.layout || 'grid',
        showIcons: true
      }
    }

    // 6. Ensure proper structure for all blocks
    updatedContentBlocks = updatedContentBlocks.map((block: any) => ({
      ...block,
      _key: block._key || generateKey()
    }))

    // 7. Update the page in Sanity
    console.log('📤 Updating page in Sanity...')
    
    const result = await client.createOrReplace({
      _id: 'page.prognoser',
      _type: 'page',
      ...currentPage,
      contentBlocks: updatedContentBlocks
    })

    console.log('✅ Successfully updated prognoser page!')
    console.log('Page ID:', result._id)

    // Summary of changes
    console.log(`
📋 SUMMARY OF CHANGES:
✅ Hero Section: Prepared for image (needs manual upload)
✅ Live Price Graph: Added priceArea field (set to DK1)
✅ Info Cards: Fixed icons - converted to strings (clock, trending-up, shield, calculator, zap, info)
✅ Info Cards: Added background color (gray) and text color settings
✅ Value Proposition: Populated with forecasting-focused content
✅ All blocks: Ensured proper _key fields

🎨 RECOMMENDED HERO IMAGES:
1. Search Unsplash for:
   - "data visualization dark mode"
   - "electricity grid monitoring"
   - "energy dashboard analytics"
   - "forecasting charts technology"

2. Look for images with:
   - Dark backgrounds (matches site theme)
   - Charts/graphs visible
   - Professional/technical feel
   - Blue/green color accents

3. Alternative: Create custom image showing:
   - ElPortal dashboard mockup
   - Price forecast charts
   - Danish electricity zones (DK1/DK2)

📝 NEXT STEPS:
1. Upload hero image to Sanity Studio
2. Run this script again with actual image asset ID
3. Test the page at /prognoser
4. Verify all components render correctly
`)

  } catch (error) {
    console.error('❌ Error fixing prognoser page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

// Run the fix
fixPrognoserPage()