import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixLeadingTextArrayError() {
  try {
    console.log('🔧 Fixing leadingText Array to String conversion...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Check block 3
    const block3 = homepage.contentBlocks[3]
    console.log(`📊 Block 3 details:`)
    console.log(`   Type: ${block3._type}`)
    if (block3.title) console.log(`   Title: "${block3.title}"`)
    
    // Check if leadingText is an array
    if (block3.leadingText && Array.isArray(block3.leadingText)) {
      console.log(`\n❌ Found leadingText as Array in block 3`)
      
      // Extract text from Portable Text array
      let extractedText = ''
      if (block3.leadingText.length > 0 && block3.leadingText[0]._type === 'block') {
        extractedText = block3.leadingText[0].children
          ?.map((child: any) => child.text || '')
          .join('') || ''
      }
      
      console.log(`   Extracted text: "${extractedText}"`)
      
      // Update the content blocks
      const updatedContentBlocks = [...homepage.contentBlocks]
      updatedContentBlocks[3] = {
        ...block3,
        leadingText: extractedText
      }
      
      console.log('\n📝 Updating homepage...')
      
      const result = await client.patch(homepage._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log('\n✅ Successfully converted leadingText from Array to String!')
    } else {
      console.log('\n✅ leadingText is already a string or not present')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixLeadingTextArrayError()