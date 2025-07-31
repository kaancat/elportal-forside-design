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

// Proper descriptions for each value item
const descriptions = {
  'flexibility': 'Flyt dit forbrug til timer med lave priser. Brug timere på vaskemaskine, opvaskemaskine og varmepumpe. Historisk data viser besparelser på 20-30%.',
  'monitor': 'Følg daglige og timevise prisudsving. Brug apps eller vores prisgraf til at se næste dags priser kl. 13:00. Planlæg stort forbrug efter prisfald.',
  'seasonal': 'Overvej fast pris om vinteren hvis du har højt varmeforbrug. Skift til variabel pris om sommeren for at udnytte lave priser og negative perioder.',
  'invest': 'Batterier, solceller og smart home-løsninger betaler sig hurtigere med varierende priser. Historisk data hjælper med at beregne tilbagebetalingstid.'
}

async function fixValuePropositionDescriptions() {
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('Page not found')
      return
    }

    console.log('Current page found:', page.title)

    // Find the value proposition block
    const valuePropIndex = page.contentBlocks?.findIndex((block: any) => 
      block._type === 'valueProposition' && block._key === 'saving-tips'
    )

    if (valuePropIndex === -1) {
      console.error('Value proposition block not found')
      return
    }

    const valueProp = page.contentBlocks[valuePropIndex]
    console.log('Found value proposition:', valueProp.title)

    // Update each item with proper descriptions
    const updatedItems = valueProp.items.map((item: any) => {
      const description = descriptions[item._key as keyof typeof descriptions]
      
      if (!description) {
        console.warn(`No description found for ${item._key}`)
        return item
      }

      console.log(`Updating description for ${item.heading}`)
      
      return {
        ...item,
        description: description
      }
    })

    // Create updated value proposition
    const updatedValueProp = {
      ...valueProp,
      items: updatedItems
    }

    // Update contentBlocks with new value proposition
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[valuePropIndex] = updatedValueProp

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('\n✅ Successfully updated value proposition descriptions!')
    console.log('Updated items:')
    updatedItems.forEach((item: any) => {
      console.log(`- ${item.heading}: "${item.description.substring(0, 50)}..."`)
    })
    
  } catch (error) {
    console.error('Error updating value proposition descriptions:', error)
  }
}

// Run the fix
fixValuePropositionDescriptions()