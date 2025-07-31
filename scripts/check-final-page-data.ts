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

async function checkFinalPageData() {
  console.log('🔍 Final comprehensive check of valueProposition issue...\n')
  
  try {
    // 1. Use EXACT same query as frontend getPageBySlug function
    const frontendQuery = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _type,
      title,
      slug,
      description,
      contentBlocks[]{
        _key,
        _type,
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
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                collectionId,
                collectionName,
                icon,
                size
              }
            }
          }
        }
      }
    }`
    
    const page = await client.fetch(frontendQuery)
    
    console.log('📄 Page title:', page.title)
    console.log('📦 Total blocks:', page.contentBlocks?.length)
    
    // Find valueProposition in the array
    const blockIndex = page.contentBlocks?.findIndex((b: any) => b._type === 'valueProposition')
    const vpBlock = page.contentBlocks?.[blockIndex]
    
    if (vpBlock) {
      console.log(`\n✅ Found valueProposition at index ${blockIndex} (position ${blockIndex + 1} of ${page.contentBlocks.length})`)
      console.log('\n📊 Block structure:')
      console.log('  _type:', vpBlock._type)
      console.log('  _key:', vpBlock._key)
      console.log('  heading:', vpBlock.heading ? `"${vpBlock.heading}"` : 'NULL')
      console.log('  subheading:', vpBlock.subheading ? `"${vpBlock.subheading}"` : 'NULL')
      console.log('  content:', vpBlock.content ? `${vpBlock.content.length} blocks` : 'NULL')
      console.log('  valueItems:', vpBlock.valueItems ? `${vpBlock.valueItems.length} items` : 'NULL')
      
      // Check what comes before and after
      console.log('\n🔍 Context blocks:')
      if (blockIndex > 0) {
        console.log(`  Before (${blockIndex - 1}):`, page.contentBlocks[blockIndex - 1]._type)
      }
      if (blockIndex < page.contentBlocks.length - 1) {
        console.log(`  After (${blockIndex + 1}):`, page.contentBlocks[blockIndex + 1]._type)
      }
      
      // Check if any fields are causing issues
      console.log('\n⚠️  Potential issues:')
      if (!vpBlock.heading && !vpBlock.title) {
        console.log('  ❌ No heading or title - component will not show title')
      }
      if (!vpBlock.valueItems && !vpBlock.items && !vpBlock.propositions) {
        console.log('  ❌ No items - component will return null!')
      }
      if (vpBlock.valueItems?.length === 0) {
        console.log('  ❌ Empty valueItems array - component will return null!')
      }
      
      // Raw check - what's actually in the data?
      console.log('\n📝 Raw data check:')
      const rawQuery = `*[_type == "page" && slug.current == "historiske-priser"][0].contentBlocks[${blockIndex}]`
      const rawBlock = await client.fetch(rawQuery)
      console.log('All fields in raw data:', Object.keys(rawBlock))
      
      // Check if there are any hidden/deprecated fields still present
      const deprecatedFields = ['title', 'items', 'propositions']
      deprecatedFields.forEach(field => {
        if (rawBlock[field]) {
          console.log(`  ⚠️  Deprecated field "${field}" still exists:`, rawBlock[field])
        }
      })
      
    } else {
      console.log('\n❌ No valueProposition block found!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run check
checkFinalPageData()