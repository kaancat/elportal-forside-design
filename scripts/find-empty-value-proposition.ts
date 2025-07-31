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

async function findEmptyValueProposition() {
  try {
    console.log('🔍 Finding empty Value Proposition boxes...\n')
    
    // Fetch all documents with value propositions
    const documents = await client.fetch(`*[_type in ["homePage", "page"]]{
      _id,
      _type,
      title,
      "slug": slug.current,
      contentBlocks[_type == "valueProposition"]{
        _key,
        heading,
        subheading,
        valueItems
      }
    }`)
    
    for (const doc of documents) {
      const valueProps = doc.contentBlocks?.filter((block: any) => block)
      
      if (valueProps && valueProps.length > 0) {
        valueProps.forEach((vp: any, index: number) => {
          console.log(`\n📄 Document: ${doc.title || 'Homepage'}`)
          console.log(`   Type: ${doc._type}`)
          console.log(`   ID: ${doc._id}`)
          if (doc.slug) console.log(`   URL: /${doc.slug}`)
          console.log(`\n   Value Proposition #${index + 1}:`)
          console.log(`   Heading: "${vp.heading || 'No heading'}"`)
          console.log(`   Subheading: "${vp.subheading || 'No subheading'}"`)
          console.log(`   Value Items: ${vp.valueItems ? vp.valueItems.length : 0} items`)
          
          if (!vp.valueItems || vp.valueItems.length === 0) {
            console.log(`   ❌ EMPTY - No value items!`)
          } else {
            vp.valueItems.forEach((item: any, i: number) => {
              console.log(`\n   Item ${i + 1}:`)
              console.log(`     Heading: "${item.heading || 'No heading'}"`)
              console.log(`     Description: "${item.description || 'No description'}"`)
              console.log(`     Icon: ${item.icon ? 'Present' : 'Missing'}`)
            })
          }
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
findEmptyValueProposition()