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

async function deepDebugValueProposition() {
  console.log('🔬 Deep debugging valueProposition issue...\n')
  
  try {
    // 1. Check raw document structure
    console.log('1️⃣ Checking raw document structure...')
    const rawDoc = await client.fetch(`*[_type == "page" && slug.current == "historiske-priser"][0]`)
    
    // Find the valueProposition block index
    const vpIndex = rawDoc.contentBlocks?.findIndex((b: any) => b._type === 'valueProposition')
    
    if (vpIndex === -1) {
      console.error('❌ No valueProposition found!')
      return
    }
    
    const vpBlock = rawDoc.contentBlocks[vpIndex]
    
    console.log(`Found valueProposition at index ${vpIndex}`)
    console.log('Raw _type value:', JSON.stringify(vpBlock._type))
    console.log('Type length:', vpBlock._type.length)
    console.log('Type char codes:', Array.from(vpBlock._type).map((c: string) => c.charCodeAt(0)))
    
    // 2. Check if there are any hidden characters or encoding issues
    console.log('\n2️⃣ Checking for hidden characters...')
    const cleanType = vpBlock._type.trim()
    if (cleanType !== vpBlock._type) {
      console.log('⚠️  FOUND WHITESPACE! Original has extra spaces')
    }
    
    // Check for zero-width characters
    const hasZeroWidth = /[\u200B-\u200D\uFEFF]/.test(vpBlock._type)
    if (hasZeroWidth) {
      console.log('⚠️  FOUND ZERO-WIDTH CHARACTERS!')
    }
    
    // 3. Check the actual data structure depth
    console.log('\n3️⃣ Checking data structure depth...')
    console.log('Block keys:', Object.keys(vpBlock))
    console.log('Has _key:', !!vpBlock._key)
    console.log('Has _type:', !!vpBlock._type)
    console.log('Has heading:', !!vpBlock.heading)
    console.log('Has valueItems:', !!vpBlock.valueItems)
    
    // 4. Check if valueItems have the right structure
    if (vpBlock.valueItems && vpBlock.valueItems.length > 0) {
      console.log('\n4️⃣ Checking valueItems structure...')
      const firstItem = vpBlock.valueItems[0]
      console.log('First item keys:', Object.keys(firstItem))
      console.log('Has _key:', !!firstItem._key)
      console.log('Has heading:', !!firstItem.heading)
      console.log('Has description:', !!firstItem.description)
      console.log('Description type:', typeof firstItem.description)
      
      // Check if description is actually an array (Portable Text)
      if (Array.isArray(firstItem.description)) {
        console.log('⚠️  Description is an ARRAY, not a string!')
        console.log('Description:', JSON.stringify(firstItem.description, null, 2))
      }
    }
    
    // 5. Compare with working blocks
    console.log('\n5️⃣ Comparing with working blocks...')
    const heroBlock = rawDoc.contentBlocks.find((b: any) => b._type === 'hero')
    if (heroBlock) {
      console.log('Hero block _type:', JSON.stringify(heroBlock._type))
      console.log('Hero type char codes:', Array.from(heroBlock._type).map((c: string) => c.charCodeAt(0)))
      console.log('Types identical:', heroBlock._type === 'hero' && vpBlock._type === 'valueProposition')
    }
    
    // 6. Check if there's a draft/published mismatch
    console.log('\n6️⃣ Checking draft vs published...')
    const draftDoc = await client.fetch(`*[_id == "drafts.page.historiske-priser"][0]`)
    if (draftDoc) {
      const draftVpIndex = draftDoc.contentBlocks?.findIndex((b: any) => b._type === 'valueProposition')
      console.log('Draft has valueProposition:', draftVpIndex !== -1)
      if (draftVpIndex !== -1) {
        console.log('Draft valueProposition heading:', draftDoc.contentBlocks[draftVpIndex].heading)
      }
    }
    
    // 7. Check the exact query that frontend uses
    console.log('\n7️⃣ Testing exact frontend query...')
    const frontendQuery = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[]{
        ...,
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
      }
    }`
    
    const frontendResult = await client.fetch(frontendQuery)
    const frontendVp = frontendResult.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    
    console.log('Frontend query returns valueProposition:', !!frontendVp)
    if (frontendVp) {
      console.log('Frontend VP structure:', JSON.stringify(frontendVp, null, 2).substring(0, 200) + '...')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run deep debug
deepDebugValueProposition()