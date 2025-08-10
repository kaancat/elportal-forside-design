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

async function applyHeroGradient() {
  console.log('Applying Green Mist gradient to forbrug-tracker hero...')

  // Get current page
  const currentPage = await client.fetch('*[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]')
  
  if (!currentPage) {
    console.error('Page not found!')
    return
  }

  // Update the hero block with the gradient style
  const updatedContentBlocks = currentPage.contentBlocks.map((block: any) => {
    if (block._key === 'hero-forbrug-tracker' && block._type === 'hero') {
      return {
        ...block,
        backgroundStyle: 'gradientGreenMist',
        textColor: 'dark',
        padding: 'large',
        alignment: 'center'
      }
    }
    return block
  })

  try {
    const result = await client.patch('f5IMbE4BjT3OYPNFYb8v2Z')
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
      
    console.log('✅ Hero gradient applied successfully!')
    console.log('   - Applied Green Mist gradient')
    console.log('   - Set dark text color for contrast')
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;f5IMbE4BjT3OYPNFYb8v2Z`)
    
    return result
  } catch (error) {
    console.error('❌ Failed to apply gradient:', error)
    throw error
  }
}

// Run the update
applyHeroGradient()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })