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

async function fixLadeboksValueProposition() {
  try {
    console.log('🔍 Fetching Ladeboks page...\n')
    
    // Fetch the page
    const page = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]`)
    
    if (!page) {
      console.log('❌ Ladeboks page not found!')
      return
    }

    console.log('📄 Page found:', page._id)
    
    // Find the valueProposition block
    const vpBlock = page.contentBlocks?.find((block: any) => block._type === 'valueProposition')
    
    if (!vpBlock) {
      console.log('❌ No valueProposition block found!')
      return
    }

    console.log('\n📊 Current ValueProposition block:')
    console.log('Key:', vpBlock._key)
    console.log('Title:', vpBlock.title)
    console.log('Heading:', vpBlock.heading)
    console.log('Subheading:', vpBlock.subheading)
    console.log('Items count:', vpBlock.items?.length || 0)
    console.log('ValueItems count:', vpBlock.valueItems?.length || 0)
    
    // Check if we need to migrate from items to valueItems
    if (vpBlock.items && vpBlock.items.length > 0 && (!vpBlock.valueItems || vpBlock.valueItems.length === 0)) {
      console.log('\n✅ Found items that need to be migrated to valueItems!')
      
      // Show current items
      console.log('\n📋 Current items:')
      vpBlock.items.forEach((item: any, index: number) => {
        console.log(`\n${index + 1}. ${item.heading}`)
        console.log(`   Description: ${item.description}`)
        console.log(`   Icon: ${item.icon?.icon || 'No icon'}`)
      })

      // Create the updated block with valueItems
      const updatedBlock = {
        ...vpBlock,
        heading: vpBlock.title || vpBlock.heading || 'Fordele ved hjemmeopladning',
        valueItems: vpBlock.items // Move items to valueItems
      }

      // Remove deprecated fields
      delete updatedBlock.title
      delete updatedBlock.items

      // Update the page
      console.log('\n🔄 Updating page with corrected valueProposition...')
      
      const updatedContentBlocks = page.contentBlocks.map((block: any) => 
        block._key === vpBlock._key ? updatedBlock : block
      )

      await client
        .patch(page._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()

      console.log('✅ Successfully updated valueProposition block!')
      
      // Verify the update
      const updatedPage = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]`)
      const updatedVP = updatedPage.contentBlocks?.find((block: any) => block._type === 'valueProposition')
      
      console.log('\n📊 Updated ValueProposition:')
      console.log('Heading:', updatedVP.heading)
      console.log('ValueItems count:', updatedVP.valueItems?.length || 0)
      
    } else if (vpBlock.valueItems && vpBlock.valueItems.length > 0) {
      console.log('\n✅ ValueProposition already using correct valueItems field!')
    } else {
      console.log('\n⚠️ No items found in either items or valueItems field!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixLadeboksValueProposition()