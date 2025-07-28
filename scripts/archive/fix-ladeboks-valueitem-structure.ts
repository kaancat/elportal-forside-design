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

async function fixLadeboksValueItemStructure() {
  try {
    console.log('Fixing Ladeboks page valueItem structure...\n')
    
    // Get the current page
    const currentPage = await client.getDocument('page.ladeboks')
    
    if (!currentPage) {
      console.error('Page not found!')
      return
    }

    console.log('Current page found, processing content blocks...')
    
    // Fix the content blocks
    const fixedContentBlocks = currentPage.contentBlocks?.map((block: any) => {
      if (block._type === 'valueProposition' && block.values) {
        console.log(`Fixing valueProposition: "${block.heading || block.title}"`)
        
        // Map old structure to new structure
        const fixedItems = block.values.map((item: any, index: number) => ({
          _type: 'valueItem',
          _key: item._key || `value-item-${index}`,
          // Remove the invalid string icon - user will select manually
          // icon: undefined,  // User will populate in Sanity Studio
          heading: item.heading || item.text || `Benefit ${index + 1}`,
          description: item.description || `Description for benefit ${index + 1}`
        }))

        return {
          ...block,
          title: block.heading || block.title, // Ensure title field exists
          items: fixedItems, // Use 'items' instead of 'values'
          heading: undefined, // Remove heading field
          values: undefined   // Remove values field
        }
      }
      return block
    })

    // Create the fixed page
    const fixedPage = {
      ...currentPage,
      contentBlocks: fixedContentBlocks
    }

    console.log('\nUpdating page in Sanity...')
    const result = await client.createOrReplace(fixedPage)
    
    console.log('✅ Ladeboks page valueItem structure fixed successfully!')
    console.log('Page ID:', result._id)
    console.log('View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.ladeboks')
    
    console.log('\n📝 Next steps:')
    console.log('1. Go to Sanity Studio')
    console.log('2. Navigate to the Ladeboks page')
    console.log('3. Edit the value proposition section')
    console.log('4. Manually select appropriate icons for each value item')

  } catch (error) {
    console.error('❌ Error fixing page:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

// Run the fix
fixLadeboksValueItemStructure()