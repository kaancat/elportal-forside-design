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

async function findChartInPageSection() {
  try {
    console.log('🔍 Finding Monthly Production Chart inside pageSection content...\n')
    
    // Fetch all pages including homepage
    const documents = await client.fetch(`*[_type in ["homePage", "page"]]{
      _id,
      _type,
      title,
      "slug": slug.current,
      contentBlocks[]{
        _type,
        _key,
        title,
        _type == "pageSection" => {
          content[]{
            _type,
            _key,
            _type == "monthlyProductionChart" => {
              title,
              leadingText
            }
          }
        }
      }
    }`)
    
    let foundIssues = false
    
    for (const doc of documents) {
      const docTitle = doc.title || 'Homepage'
      const docType = doc._type
      
      doc.contentBlocks?.forEach((block: any, blockIndex: number) => {
        if (block._type === 'pageSection' && block.content) {
          block.content.forEach((item: any, itemIndex: number) => {
            if (item._type === 'monthlyProductionChart') {
              console.log(`\n📄 Document: ${docTitle} (${docType})`)
              console.log(`   ID: ${doc._id}`)
              if (doc.slug) console.log(`   Slug: /${doc.slug}`)
              console.log(`   Section: "${block.title}"`)
              console.log(`   Chart: "${item.title}"`)
              console.log(`   Position: Block ${blockIndex}, Item ${itemIndex}`)
              console.log(`   leadingText type: ${Array.isArray(item.leadingText) ? 'Array ❌' : typeof item.leadingText}`)
              
              if (Array.isArray(item.leadingText)) {
                foundIssues = true
                console.log(`   leadingText content:`, JSON.stringify(item.leadingText, null, 2))
              }
            }
          })
        }
      })
    }
    
    if (!foundIssues) {
      console.log('\n✅ No Monthly Production Charts with Array leadingText found inside pageSection content')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
findChartInPageSection()