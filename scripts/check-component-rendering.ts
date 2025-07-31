// This script will check if the valueProposition is being fetched correctly
// and simulate the exact rendering logic

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkComponentRendering() {
  console.log('🔍 Checking valueProposition rendering issue...\n')
  
  try {
    // 1. Fetch using the EXACT query from sanityService.ts
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
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
    
    const page = await client.fetch(query)
    
    // Find the valueProposition block
    const vpBlock = page.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    
    if (!vpBlock) {
      console.error('❌ No valueProposition block found using frontend query!')
      return
    }
    
    console.log('✅ ValueProposition block found')
    console.log('Block data:', JSON.stringify(vpBlock, null, 2))
    
    // 2. Check for potential issues
    console.log('\n🔍 Checking for issues:')
    
    // Check if fields are null/undefined
    if (!vpBlock.heading && !vpBlock.title) {
      console.log('❌ No heading or title field!')
    }
    
    if (!vpBlock.valueItems && !vpBlock.items) {
      console.log('❌ No valueItems or items field!')
    }
    
    // 3. Simulate component logic
    console.log('\n🎭 Simulating component logic:')
    const items = vpBlock.valueItems || vpBlock.items || []
    console.log(`Items found: ${items.length}`)
    
    if (items.length === 0) {
      console.log('❌ Component would return null - no items!')
    } else {
      console.log('✅ Component should render')
    }
    
    // 4. Check for draft vs published
    console.log('\n📝 Checking draft vs published:')
    const draftQuery = `*[_id == "drafts.page.historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"][0]{
        heading,
        valueItems
      }
    }`
    
    const publishedQuery = `*[_id == "page.historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"][0]{
        heading,
        valueItems
      }
    }`
    
    const draft = await client.fetch(draftQuery)
    const published = await client.fetch(publishedQuery)
    
    console.log('Draft has data:', !!draft?.contentBlocks?.heading)
    console.log('Published has data:', !!published?.contentBlocks?.heading)
    
    // 5. Check if old fields still exist
    console.log('\n🔍 Checking for old fields:')
    const oldFieldsQuery = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"][0]{
        title,
        items
      }
    }`
    
    const oldFields = await client.fetch(oldFieldsQuery)
    console.log('Old title field exists:', !!oldFields?.contentBlocks?.title)
    console.log('Old items field exists:', !!oldFields?.contentBlocks?.items)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkComponentRendering()