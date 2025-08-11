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

async function checkHeroStatus() {
  console.log('Checking forbrug-tracker hero status...')

  // Get current page
  const currentPage = await client.fetch('*[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]')
  
  if (!currentPage) {
    console.error('Page not found!')
    return
  }

  // Find the hero block
  const heroBlock = currentPage.contentBlocks?.find((block: any) => 
    block._key === 'hero-forbrug-tracker' && block._type === 'hero'
  )

  if (!heroBlock) {
    console.error('Hero block not found!')
    return
  }

  console.log('\n✅ Hero block found:')
  console.log('   Headline:', heroBlock.headline)
  console.log('   Subheadline:', heroBlock.subheadline)
  console.log('   Background Style:', heroBlock.backgroundStyle || 'NOT SET')
  console.log('   Text Color:', heroBlock.textColor || 'NOT SET')
  console.log('   Padding:', heroBlock.padding || 'NOT SET')
  console.log('   Alignment:', heroBlock.alignment || 'NOT SET')
  
  if (!heroBlock.backgroundStyle) {
    console.log('\n⚠️  WARNING: No background style is set on the hero!')
    console.log('   This explains why the gradient is not showing.')
  } else if (heroBlock.backgroundStyle === 'gradientGreenMist') {
    console.log('\n✨ Green Mist gradient is correctly set!')
  }
}

// Run the check
checkHeroStatus()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })