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

async function verifyValuePropositionFix() {
  console.log('🔍 Verifying valueProposition fix...\n')
  
  try {
    // Fetch using the same GROQ query as frontend
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"]{
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
    }`
    
    const page = await client.fetch(query)
    
    if (!page || !page.contentBlocks || page.contentBlocks.length === 0) {
      console.error('❌ No valueProposition found')
      return
    }
    
    const valueProposition = page.contentBlocks[0]
    
    console.log('✅ ValueProposition data structure:')
    console.log('----------------------------------------')
    console.log(`📌 Type: ${valueProposition._type}`)
    console.log(`📌 Key: ${valueProposition._key}`)
    console.log(`📌 Heading: "${valueProposition.heading || 'EMPTY'}"`)
    console.log(`📌 Subheading: "${valueProposition.subheading || 'EMPTY'}"`)
    console.log(`📌 Content: ${valueProposition.content ? `${valueProposition.content.length} blocks` : 'EMPTY'}`)
    console.log(`📌 ValueItems: ${valueProposition.valueItems ? `${valueProposition.valueItems.length} items` : 'EMPTY'}`)
    
    if (valueProposition.valueItems && valueProposition.valueItems.length > 0) {
      console.log('\n📇 ValueItems details:')
      valueProposition.valueItems.forEach((item: any, index: number) => {
        console.log(`\n   Item ${index + 1}:`)
        console.log(`   - Key: ${item._key}`)
        console.log(`   - Heading: "${item.heading}"`)
        console.log(`   - Description: ${item.description ? 'Present' : 'Missing'}`)
        console.log(`   - Icon: ${item.icon ? 'Present' : 'Missing'}`)
      })
    }
    
    // Check for deprecated fields
    const rawQuery = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"]
    }`
    
    const rawPage = await client.fetch(rawQuery)
    const rawBlock = rawPage.contentBlocks[0]
    
    console.log('\n⚠️  Checking for deprecated fields:')
    console.log(`   - title (deprecated): ${!!rawBlock.title}`)
    console.log(`   - items (deprecated): ${!!rawBlock.items}`)
    console.log(`   - propositions (deprecated): ${!!rawBlock.propositions}`)
    
    console.log('\n🎯 Summary:')
    if (valueProposition.heading && valueProposition.valueItems) {
      console.log('✅ SUCCESS: ValueProposition is properly structured!')
      console.log('✅ Sanity Studio should now show populated fields!')
    } else {
      console.log('❌ ISSUE: Some required fields are still missing')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run verification
verifyValuePropositionFix()