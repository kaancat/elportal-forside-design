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

async function diagnoseValuePropositionFrontend() {
  console.log('🔍 Diagnosing valueProposition frontend issue...\n')
  
  try {
    // 1. Check what fields are present in the raw data
    const rawQuery = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"]
    }`
    
    const rawPage = await client.fetch(rawQuery)
    const rawBlock = rawPage.contentBlocks?.[0]
    
    if (!rawBlock) {
      console.error('❌ No valueProposition found on page!')
      return
    }
    
    console.log('📊 Raw data structure:')
    console.log('All fields present:', Object.keys(rawBlock).join(', '))
    console.log('\n📝 Raw JSON:')
    console.log(JSON.stringify(rawBlock, null, 2))
    
    // 2. Check if frontend would show this data
    console.log('\n🖥️  Frontend Component Analysis:')
    console.log('The component looks for:')
    console.log('- Title: block.heading || block.title')
    console.log('- Items: block.valueItems || block.items || block.propositions')
    
    const hasTitle = !!(rawBlock.heading || rawBlock.title)
    const hasItems = !!(rawBlock.valueItems || rawBlock.items || rawBlock.propositions)
    
    console.log('\n✅ Data check:')
    console.log(`- Has title data: ${hasTitle} (heading: ${!!rawBlock.heading}, title: ${!!rawBlock.title})`)
    console.log(`- Has items data: ${hasItems} (valueItems: ${!!rawBlock.valueItems}, items: ${!!rawBlock.items})`)
    
    // 3. Check if items array is empty
    const items = rawBlock.valueItems || rawBlock.items || []
    console.log(`- Items count: ${items.length}`)
    
    if (items.length === 0) {
      console.log('\n❌ PROBLEM: Items array is empty!')
    }
    
    // 4. Why "Untitled" in Studio?
    console.log('\n📌 Studio Preview Issue:')
    console.log('The schema is missing a preview configuration.')
    console.log('Without preview, Sanity defaults to "Untitled"')
    
    // 5. Missing fields
    console.log('\n⚠️  Missing fields:')
    if (!rawBlock.subheading) console.log('- subheading is empty')
    if (!rawBlock.content || rawBlock.content?.length === 0) console.log('- content is empty')
    
    console.log('\n💡 DIAGNOSIS:')
    if (!hasItems || items.length === 0) {
      console.log('❌ Frontend not showing because items array is empty or missing!')
    } else if (!hasTitle) {
      console.log('⚠️  Component might show but without title')
    } else {
      console.log('✅ Data structure looks correct for frontend display')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run diagnosis
diagnoseValuePropositionFrontend()