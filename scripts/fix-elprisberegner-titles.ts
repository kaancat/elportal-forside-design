import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixPageSectionTitles() {
  try {
    console.log('🔍 Fetching elprisberegner page...')
    
    // Fetch the current page
    const page = await client.getDocument('f7ecf92783e749828f7281a6e5829d52')
    
    if (!page) {
      throw new Error('Page not found')
    }
    
    console.log('📋 Checking pageSection titles...')
    
    // Map to track pageSection positions and content
    const pageSectionInfo: { index: number; hasTitle: boolean; contentSummary: string }[] = []
    
    // Process content blocks to add titles to pageSections
    const updatedContentBlocks = page.contentBlocks.map((block: any, index: number) => {
      if (block._type === 'pageSection') {
        // Check if it has a title
        const hasTitle = !!block.title || !!block.heading
        
        // Get a summary of content for context
        const contentSummary = block.content?.[0]?.children?.[0]?.text?.substring(0, 50) || 'No text content'
        
        pageSectionInfo.push({ index, hasTitle, contentSummary })
        
        // Based on the content and position, assign appropriate titles
        if (!hasTitle) {
          console.log(`⚠️  PageSection at index ${index} is missing a title`)
          
          // Determine title based on content
          if (index === 3) {
            // This is the price components explanation section
            return {
              ...block,
              title: 'Forstå Din Elpris - Alle Komponenter Forklaret',
              heading: 'Forstå Din Elpris - Alle Komponenter Forklaret',
              headerAlignment: block.headerAlignment || 'left'
            }
          } else if (index === 12) {
            // This is the price example table section
            return {
              ...block,
              title: 'Priseksempler for Forskellige Husstande',
              heading: 'Priseksempler for Forskellige Husstande',
              headerAlignment: block.headerAlignment || 'left'
            }
          } else if (index === 14) {
            // This is the final value proposition section
            return {
              ...block,
              title: 'Derfor Skal Du Bruge Vores Elprisberegner',
              heading: 'Derfor Skal Du Bruge Vores Elprisberegner',
              headerAlignment: block.headerAlignment || 'left'
            }
          }
        }
      }
      
      return block
    })
    
    // Log the pageSection analysis
    console.log('\n📊 PageSection Analysis:')
    pageSectionInfo.forEach(info => {
      console.log(`- Index ${info.index}: ${info.hasTitle ? '✅ Has title' : '❌ Missing title'} - Content: "${info.contentSummary}..."`)
    })
    
    // Update the page
    console.log('\n📝 Updating page with fixed titles...')
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ PageSection titles fixed successfully!')
    
    // Verify all sections now have proper structure
    console.log('\n📋 Final content structure:')
    updatedContentBlocks.forEach((block: any, index: number) => {
      const title = block.title || block.heading || block.headline || 'No title'
      console.log(`${index + 1}. ${block._type} - ${title}`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing titles:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Run the fix
fixPageSectionTitles()