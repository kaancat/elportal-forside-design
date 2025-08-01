import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

// Mapping from old string icons to icon names in icon.manager
// These should match available icons in your icon.manager collection
const iconMapping: Record<string, string> = {
  'trending-up': 'trending-up',
  'shield': 'shield',
  'calculator': 'calculator', 
  'clock': 'clock',
  'zap': 'zap',
  'info': 'info'
}

async function migrateInfoCardsIcons() {
  console.log('Starting InfoCards icon migration...')
  
  try {
    // Fetch all documents that contain infoCardsSection blocks
    const query = `*[_type in ["page"] && contentBlocks[_type == "infoCardsSection"]]`
    const documents = await client.fetch(query)
    
    console.log(`Found ${documents.length} documents with InfoCards sections`)
    
    for (const doc of documents) {
      let hasChanges = false
      const updatedContentBlocks = doc.contentBlocks.map((block: any) => {
        if (block._type === 'infoCardsSection' && block.cards) {
          const updatedCards = block.cards.map((card: any) => {
            if (typeof card.icon === 'string' && iconMapping[card.icon]) {
              hasChanges = true
              console.log(`  Converting icon "${card.icon}" to icon.manager format`)
              
              // Create icon.manager structure
              // Note: You'll need to adjust these values based on your actual icon collection
              return {
                ...card,
                icon: {
                  _type: 'icon.manager',
                  icon: iconMapping[card.icon],
                  metadata: {
                    iconName: iconMapping[card.icon],
                    collectionId: 'lucide', // Adjust based on your icon collection
                    collectionName: 'Lucide Icons',
                    url: `https://api.iconify.design/lucide/${iconMapping[card.icon]}.svg`,
                    inlineSvg: '', // This would be populated by the icon manager
                    downloadUrl: `https://api.iconify.design/lucide/${iconMapping[card.icon]}.svg?download=1`,
                    size: {
                      width: 24,
                      height: 24
                    }
                  }
                }
              }
            }
            return card
          })
          
          return {
            ...block,
            cards: updatedCards
          }
        }
        return block
      })
      
      if (hasChanges) {
        console.log(`Updating document ${doc._id}...`)
        await client
          .patch(doc._id)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        console.log(`✓ Updated document ${doc._id}`)
      }
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateInfoCardsIcons()