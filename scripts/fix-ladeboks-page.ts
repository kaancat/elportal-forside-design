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

async function fixLadeboksPage() {
  try {
    console.log('Fetching Ladeboks page...')
    
    // Fetch the current page
    const currentPage = await client.getDocument('page.ladeboks')
    
    if (!currentPage) {
      console.error('Page not found!')
      return
    }
    
    console.log('Current page structure:', JSON.stringify(currentPage, null, 2))
    
    // Fix the page structure
    const fixedPage = {
      ...currentPage,
      sections: currentPage.sections.map((section: any) => {
        // Fix each section based on its _type
        switch (section._type) {
          case 'hero':
            // Fix: heading -> headline, remove non-existent ctaText and ctaLink
            return {
              ...section,
              headline: section.heading || section.headline,
              heading: undefined, // Remove the incorrect field
              ctaText: undefined, // Remove non-existent field
              ctaLink: undefined  // Remove non-existent field
            }
          
          case 'pageSection':
            // Fix: heading -> title
            return {
              ...section,
              title: section.heading || section.title,
              heading: undefined // Remove the incorrect field
            }
          
          case 'valueProposition':
            // Fix: heading -> title, values -> items
            return {
              ...section,
              title: section.heading || section.title,
              items: section.values || section.items || [],
              heading: undefined, // Remove the incorrect field
              values: undefined   // Remove the incorrect field
            }
          
          case 'livePriceGraph':
            // Fix: heading -> title, remove non-existent fields
            return {
              ...section,
              title: section.heading || section.title,
              heading: undefined,     // Remove the incorrect field
              description: undefined, // Remove non-existent field
              showDetails: undefined  // Remove non-existent field
            }
          
          case 'faqGroup':
            // Fix: heading -> title, faqs -> faqItems
            return {
              ...section,
              title: section.heading || section.title,
              faqItems: section.faqs || section.faqItems || [],
              heading: undefined, // Remove the incorrect field
              faqs: undefined     // Remove the incorrect field
            }
          
          case 'featureList':
            // Fix: heading -> title
            return {
              ...section,
              title: section.heading || section.title,
              heading: undefined // Remove the incorrect field
            }
          
          case 'callToActionSection':
            // Fix: headline -> title
            return {
              ...section,
              title: section.headline || section.title,
              headline: undefined // Remove the incorrect field
            }
          
          case 'richTextSection':
            // This doesn't have a title field at all, just content
            return {
              ...section,
              heading: undefined, // Remove any incorrect field
              title: undefined    // Remove any incorrect field
            }
          
          case 'chargingBoxShowcase':
            // This actually uses 'heading' - it's correct
            return section
          
          default:
            // Return as-is for any other types
            return section
        }
      }).filter((section: any) => {
        // Clean up any sections that might have become empty
        const { _key, _type, ...fields } = section
        const cleanedFields = Object.entries(fields).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value
          }
          return acc
        }, {} as any)
        
        // Keep the section if it has any meaningful fields
        return Object.keys(cleanedFields).length > 0
      })
    }
    
    console.log('\nFixed page structure:', JSON.stringify(fixedPage, null, 2))
    
    // Update the page
    console.log('\nUpdating page in Sanity...')
    const result = await client
      .patch('page.ladeboks')
      .set(fixedPage)
      .commit()
    
    console.log('✅ Page successfully updated!')
    console.log('Updated page ID:', result._id)
    
  } catch (error) {
    console.error('❌ Error fixing page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      if ('details' in error) {
        console.error('Validation details:', JSON.stringify((error as any).details, null, 2))
      }
    }
  }
}

// Run the fix
fixLadeboksPage()