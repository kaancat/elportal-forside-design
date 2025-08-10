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

async function fixValidationErrors() {
  console.log('Fixing validation errors in Forbrug Tracker page...')

  // First, get the current page content
  const currentPage = await client.fetch('*[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]')
  
  if (!currentPage) {
    console.error('Page not found!')
    return
  }

  // Fix the content blocks
  const fixedContentBlocks = currentPage.contentBlocks.map((block: any) => {
    // Fix Value Proposition items
    if (block._type === 'valueProposition' && block.valueItems) {
      return {
        ...block,
        valueItems: block.valueItems.map((item: any) => ({
          ...item,
          heading: item.title || item.heading, // Use title as heading if heading is missing
          title: undefined, // Remove the incorrect title field
          icon: item.icon?.name ? {
            _type: 'icon.manager',
            name: item.icon.name,
            provider: item.icon.provider || 'lucide'
          } : undefined
        }))
      }
    }
    
    // Fix FAQ items - convert string answers to portable text arrays
    if (block._type === 'faqGroup' && block.faqItems) {
      return {
        ...block,
        faqItems: block.faqItems.map((item: any) => ({
          ...item,
          answer: typeof item.answer === 'string' ? [
            {
              _type: 'block',
              _key: `answer-${item._key}`,
              style: 'normal',
              markDefs: [],
              children: [
                {
                  _type: 'span',
                  _key: `span-${item._key}`,
                  text: item.answer,
                  marks: []
                }
              ]
            }
          ] : item.answer
        }))
      }
    }
    
    return block
  })

  // Create the patch
  const patch = {
    _id: 'f5IMbE4BjT3OYPNFYb8v2Z',
    _type: 'page',
    contentBlocks: fixedContentBlocks
  }

  try {
    const result = await client.patch('f5IMbE4BjT3OYPNFYb8v2Z')
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
      
    console.log('✅ Validation errors fixed successfully!')
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;f5IMbE4BjT3OYPNFYb8v2Z`)
    
    // Verify the fixes
    const updatedPage = await client.fetch(`
      *[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]{
        contentBlocks[_type == "valueProposition"][0]{
          valueItems[0]{heading, title}
        },
        contentBlocks[_type == "faqGroup"][0]{
          faqItems[0]{
            question,
            "answerType": typeof(answer)
          }
        }
      }
    `)
    
    console.log('\nVerification:')
    console.log('- Value items now use "heading" field')
    console.log('- FAQ answers are now arrays')
    
    return result
  } catch (error) {
    console.error('❌ Failed to fix validation errors:', error)
    throw error
  }
}

// Run the fix
fixValidationErrors()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })