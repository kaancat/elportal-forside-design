import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Document IDs
const DOCUMENT_1_ID = 'qgCxJyBbKpvhb2oGYpYKuf' // Random ID (has validation error)
const DOCUMENT_2_ID = 'page.energibesparende-tips' // Custom ID (more content, but breaks navigation)

interface ContentBlock {
  _type: string
  _key: string
  [key: string]: any
}

interface PageDocument {
  _id: string
  _type: string
  title: string
  slug: { current: string }
  contentBlocks: ContentBlock[]
  [key: string]: any
}

async function analyzeDocuments() {
  console.log('🔍 ANALYZING DUPLICATE ENERGIBESPARENDE TIPS PAGES\n')
  console.log('=' .repeat(80))
  
  try {
    // Fetch both documents
    console.log('📄 Fetching documents...\n')
    
    const [doc1, doc2] = await Promise.all([
      client.getDocument<PageDocument>(DOCUMENT_1_ID),
      client.getDocument<PageDocument>(DOCUMENT_2_ID)
    ])
    
    if (!doc1 && !doc2) {
      console.log('❌ Both documents not found!')
      return
    }
    
    // Document 1 Analysis
    if (doc1) {
      console.log('📋 DOCUMENT 1 (Random ID)')
      console.log('=' .repeat(40))
      console.log(`ID: ${doc1._id}`)
      console.log(`Title: ${doc1.title}`)
      console.log(`Slug: ${doc1.slug?.current}`)
      console.log(`Content Blocks: ${doc1.contentBlocks?.length || 0}`)
      console.log(`Created: ${doc1._createdAt}`)
      console.log(`Updated: ${doc1._updatedAt}`)
      console.log('\nContent Block Types:')
      
      const doc1BlockTypes = new Map<string, number>()
      doc1.contentBlocks?.forEach(block => {
        doc1BlockTypes.set(block._type, (doc1BlockTypes.get(block._type) || 0) + 1)
      })
      
      Array.from(doc1BlockTypes.entries()).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
      
      // Check for priceCalculatorWidget
      const priceCalcBlock = doc1.contentBlocks?.find(b => b._type === 'priceCalculatorWidget')
      if (priceCalcBlock) {
        const index = doc1.contentBlocks.indexOf(priceCalcBlock)
        console.log(`\n⚠️  priceCalculatorWidget found at index ${index}`)
        console.log('  This might be causing the validation error')
      }
      
      // Count words in content
      const doc1WordCount = countWords(doc1)
      console.log(`\nEstimated Word Count: ~${doc1WordCount} words`)
    } else {
      console.log('❌ Document 1 not found!')
    }
    
    console.log('\n')
    
    // Document 2 Analysis
    if (doc2) {
      console.log('📋 DOCUMENT 2 (Custom ID with dot)')
      console.log('=' .repeat(40))
      console.log(`ID: ${doc2._id} ⚠️  (Custom ID breaks navigation!)`)
      console.log(`Title: ${doc2.title}`)
      console.log(`Slug: ${doc2.slug?.current}`)
      console.log(`Content Blocks: ${doc2.contentBlocks?.length || 0}`)
      console.log(`Created: ${doc2._createdAt}`)
      console.log(`Updated: ${doc2._updatedAt}`)
      console.log('\nContent Block Types:')
      
      const doc2BlockTypes = new Map<string, number>()
      doc2.contentBlocks?.forEach(block => {
        doc2BlockTypes.set(block._type, (doc2BlockTypes.get(block._type) || 0) + 1)
      })
      
      Array.from(doc2BlockTypes.entries()).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
      
      // Count words in content
      const doc2WordCount = countWords(doc2)
      console.log(`\nEstimated Word Count: ~${doc2WordCount} words`)
    } else {
      console.log('❌ Document 2 not found!')
    }
    
    // Comparison
    if (doc1 && doc2) {
      console.log('\n📊 COMPARISON')
      console.log('=' .repeat(40))
      
      // Find unique blocks in each document
      const doc1Types = new Set(doc1.contentBlocks?.map(b => b._type) || [])
      const doc2Types = new Set(doc2.contentBlocks?.map(b => b._type) || [])
      
      const uniqueToDoc1 = Array.from(doc1Types).filter(t => !doc2Types.has(t))
      const uniqueToDoc2 = Array.from(doc2Types).filter(t => !doc1Types.has(t))
      
      if (uniqueToDoc1.length > 0) {
        console.log('\nUnique to Document 1:')
        uniqueToDoc1.forEach(type => console.log(`  - ${type}`))
      }
      
      if (uniqueToDoc2.length > 0) {
        console.log('\nUnique to Document 2:')
        uniqueToDoc2.forEach(type => console.log(`  - ${type}`))
      }
      
      // SEO comparison
      console.log('\nSEO Metadata:')
      console.log('Document 1:')
      console.log(`  - Meta Title: ${doc1.seoMetaTitle || 'Not set'}`)
      console.log(`  - Meta Description: ${doc1.seoMetaDescription ? 'Set' : 'Not set'}`)
      console.log('Document 2:')
      console.log(`  - Meta Title: ${doc2.seoMetaTitle || 'Not set'}`)
      console.log(`  - Meta Description: ${doc2.seoMetaDescription ? 'Set' : 'Not set'}`)
    }
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS')
    console.log('=' .repeat(40))
    console.log('1. Document 2 has more content and is your preferred version')
    console.log('2. BUT: Custom ID "page.energibesparende-tips" breaks navigation!')
    console.log('3. Solution: Create NEW page with Sanity-generated ID')
    console.log('4. Merge all content from Document 2 + unique content from Document 1')
    console.log('5. Fix priceCalculatorWidget placement if needed')
    console.log('6. Delete both old documents after successful merge')
    
    console.log('\n📝 Next Step: Run merge-energibesparende-tips-pages.ts')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

function countWords(doc: PageDocument): number {
  let wordCount = 0
  
  // Count words in title
  if (doc.title) {
    wordCount += doc.title.split(/\s+/).length
  }
  
  // Count words in content blocks
  doc.contentBlocks?.forEach(block => {
    // For pageSection blocks, count words in content
    if (block.content && Array.isArray(block.content)) {
      block.content.forEach((contentBlock: any) => {
        if (contentBlock.children && Array.isArray(contentBlock.children)) {
          contentBlock.children.forEach((child: any) => {
            if (child.text) {
              wordCount += child.text.split(/\s+/).length
            }
          })
        }
      })
    }
    
    // Count words in other text fields
    Object.values(block).forEach(value => {
      if (typeof value === 'string' && value.length > 10) {
        wordCount += value.split(/\s+/).length
      }
    })
  })
  
  return wordCount
}

// Run analysis
analyzeDocuments().catch(console.error)