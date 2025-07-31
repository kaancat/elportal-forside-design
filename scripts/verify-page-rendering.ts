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

async function verifyPageRendering() {
  try {
    const pageId = '1BrgDwXdqxJ08rMIoYfLjP'
    
    console.log('Verifying page data structure...')
    
    // Fetch using the same query pattern as the frontend
    const query = `*[_id == "${pageId}"][0]{
      _id,
      _type,
      title,
      slug,
      contentBlocks[]{
        _type,
        _key,
        _type == "heroWithCalculator" => {
          _key,
          _type,
          headline,
          subheadline,
          content,
          calculatorTitle,
          showLivePrice,
          showProviderComparison,
          stats[]{
            value,
            label
          }
        },
        _type == "featureList" => {
          _key,
          _type,
          title,
          features[]{
            _key,
            _type,
            title,
            description,
            icon
          }
        },
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{
            _key,
            heading,
            description,
            icon
          }
        }
      }[0...5]
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Page not found!')
      return
    }
    
    console.log('\nPage loaded successfully:')
    console.log('- Title:', page.title)
    console.log('- Slug:', page.slug?.current)
    console.log('\nFirst 5 content blocks:')
    
    page.contentBlocks.forEach((block: any, index: number) => {
      console.log(`\n${index + 1}. ${block._type} (key: ${block._key})`)
      
      if (block._type === 'heroWithCalculator') {
        console.log('   - Headline:', block.headline || 'MISSING')
        console.log('   - Subheadline:', block.subheadline ? 'Present' : 'MISSING')
        console.log('   - Stats:', block.stats?.length || 0, 'items')
      }
    })
    
    // Check for any validation issues
    const allKeys = page.contentBlocks.map((b: any) => b._key)
    const uniqueKeys = new Set(allKeys)
    
    if (allKeys.length !== uniqueKeys.size) {
      console.error('\n❌ Still have duplicate keys!')
    } else {
      console.log('\n✅ All keys are unique')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the script
verifyPageRendering()