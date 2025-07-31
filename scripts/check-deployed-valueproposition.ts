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

async function checkDeployedValueProposition() {
  console.log('🔍 Checking if valueProposition should be visible on frontend...\n')
  
  try {
    // Get the page data exactly as frontend would
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
              _type,
              icon,
              metadata {
                url,
                inlineSvg,
                iconName
              }
            }
          }
        }
      }
    }`
    
    const page = await client.fetch(query)
    const vpBlocks = page.contentBlocks?.filter((b: any) => b._type === 'valueProposition') || []
    
    if (vpBlocks.length === 0) {
      console.error('❌ No valueProposition blocks found in Sanity data!')
      return
    }
    
    console.log(`✅ Found ${vpBlocks.length} valueProposition block(s) in Sanity\n`)
    
    vpBlocks.forEach((block: any, index: number) => {
      console.log(`📋 ValueProposition Block ${index + 1}:`)
      console.log(`   Heading: "${block.heading || 'MISSING'}"`)
      console.log(`   Items: ${block.valueItems?.length || 0}`)
      
      if (block.valueItems && block.valueItems.length > 0) {
        console.log('   Items detail:')
        block.valueItems.forEach((item: any, i: number) => {
          console.log(`     ${i + 1}. "${item.heading}" - ${item.icon ? '✅ has icon' : '❌ no icon'}`)
        })
      }
      
      console.log('\n🎯 Expected HTML structure on frontend:')
      console.log('   <section class="py-16 lg:py-24">')
      console.log('     <div class="container mx-auto px-4">')
      console.log('       <div class="max-w-4xl mx-auto p-8 bg-green-50/60 rounded-2xl border border-green-200/60">')
      console.log(`         <h2>${block.heading}</h2>`)
      console.log('         <ul class="space-y-4 pl-1">')
      block.valueItems?.forEach((item: any) => {
        console.log(`           <li>${item.heading}</li>`)
      })
      console.log('         </ul>')
      console.log('       </div>')
      console.log('     </div>')
      console.log('   </section>')
      
      console.log('\n🔍 To verify on frontend:')
      console.log('1. Open browser DevTools')
      console.log('2. Go to /historiske-priser page')
      console.log('3. In Console, run:')
      console.log(`   document.querySelector('.bg-green-50\\\\/60')`)
      console.log(`   document.body.innerText.includes('${block.heading}')`)
      console.log('\n4. Or search page source for:')
      console.log(`   - "${block.heading}"`)
      console.log('   - "bg-green-50/60"')
      console.log('   - "[ValueProposition]" (from console logs)')
    })
    
    console.log('\n💡 If not visible, check browser console for:')
    console.log('   - [ContentBlocks] ValueProposition type matched!')
    console.log('   - [ValueProposition] Rendering with block:')
    console.log('   - [ValueProposition] Runtime error:')
    console.log('   - Error loading value proposition:')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run check
checkDeployedValueProposition()