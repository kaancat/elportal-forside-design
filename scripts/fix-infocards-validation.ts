import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

// Load environment variables
dotenv.config()

// Generate unique keys for content blocks
const generateKey = () => crypto.randomBytes(8).toString('hex')

// Initialize Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to create Portable Text blocks
function createTextBlock(text: string, style: string = 'normal'): any {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks: []
      }
    ],
    markDefs: []
  }
}

async function fixInfoCardsSection() {
  try {
    console.log('🔍 Fetching elprisberegner page...')
    
    // Fetch the current page
    const page = await client.getDocument('f7ecf92783e749828f7281a6e5829d52')
    
    if (!page) {
      throw new Error('Page not found')
    }
    
    console.log('📋 Fixing infoCardsSection validation errors...')
    
    // Fix content blocks
    const fixedContentBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'infoCardsSection') {
        console.log('🔧 Fixing infoCardsSection structure...')
        
        // Create properly structured cards WITHOUT _type and _key
        // and using simple string icons from the allowed list
        const fixedCards = [
          {
            // NO _type or _key for inline objects!
            title: 'Grøn strøm koster det samme',
            description: [
              createTextBlock('Vidste du at grøn strøm ikke behøver koste mere? Mange elselskaber tilbyder 100% vedvarende energi til samme pris som almindelig strøm.')
            ],
            icon: 'shield', // Simple string value from allowed list
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            title: 'Skift elselskab på 5 minutter',
            description: [
              createTextBlock('Det er nemt og gratis at skifte elselskab. Dit nye selskab klarer alt det praktiske, og du mister aldrig strømmen.')
            ],
            icon: 'clock', // Simple string value
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            title: 'Tjek priser hver 3. måned',
            description: [
              createTextBlock('Elpriserne ændrer sig konstant. Ved at tjekke priser kvartalsvis sikrer du dig altid det bedste tilbud.')
            ],
            icon: 'trending-up', // Simple string value
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }
        ]
        
        return {
          _type: 'infoCardsSection',
          _key: block._key,
          title: 'Vigtig Information om Elpriser',
          subtitle: 'Tips til at få mest ud af din elaftale',
          headerAlignment: 'center',
          leadingText: [
            createTextBlock('Her er tre vigtige ting du bør vide om elpriser og hvordan du kan spare penge på din elregning.')
          ],
          cards: fixedCards, // Array of plain objects without _type or _key
          columns: 3
        }
      }
      
      // Return other blocks unchanged
      return block
    })
    
    // Update the page
    console.log('\n📝 Updating page with fixed infoCardsSection...')
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
    
    console.log('✅ InfoCardsSection validation errors fixed!')
    
    // Log what was fixed
    console.log('\n📋 Key fixes applied:')
    console.log('- Removed _type: "infoCard" from cards (not a real schema type)')
    console.log('- Removed _key from individual cards (not needed for inline objects)')
    console.log('- Changed icon from complex objects to simple strings')
    console.log('- Removed unsupported linkText/linkUrl fields')
    console.log('- Used allowed icon values: shield, clock, trending-up')
    console.log('- Added proper Tailwind color classes')
    
  } catch (error) {
    console.error('❌ Error fixing infoCardsSection:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Run the fix
fixInfoCardsSection()