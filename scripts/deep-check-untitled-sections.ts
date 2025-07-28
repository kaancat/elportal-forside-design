import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Deep check for any untitled sections
async function deepCheckUntitledSections() {
  console.log('🔍 Deep checking for untitled sections')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    const document = await client.getDocument(documentId)
    
    console.log(`\n📄 Document: ${document.title}`)
    console.log(`📊 Total blocks: ${document.contentBlocks?.length || 0}\n`)
    
    let untitledCount = 0
    const untitledSections = []
    
    // Check each block
    document.contentBlocks?.forEach((block: any, index: number) => {
      let isUntitled = false
      let blockInfo = {
        index,
        type: block._type,
        heading: '',
        issue: ''
      }
      
      // Check different block types for titles/headings
      switch (block._type) {
        case 'pageSection':
          if (!block.heading || block.heading.trim() === '' || block.heading === 'Untitled Page Section') {
            isUntitled = true
            blockInfo.heading = block.heading || '(empty)'
            blockInfo.issue = 'Missing or untitled heading'
          } else {
            blockInfo.heading = block.heading
          }
          break
          
        case 'hero':
          if (!block.headline) {
            isUntitled = true
            blockInfo.heading = block.headline || '(empty)'
            blockInfo.issue = 'Missing headline'
          } else {
            blockInfo.heading = block.headline
          }
          break
          
        case 'featureList':
          if (!block.title) {
            isUntitled = true
            blockInfo.heading = block.title || '(empty)'
            blockInfo.issue = 'Missing title'
          } else {
            blockInfo.heading = block.title
          }
          break
          
        case 'valueProposition':
          if (!block.heading || block.heading === 'Untitled') {
            isUntitled = true
            blockInfo.heading = block.heading || '(empty)'
            blockInfo.issue = 'Missing or untitled heading'
          } else {
            blockInfo.heading = block.heading
          }
          break
          
        case 'providerList':
          if (!block.title && !block.heading) {
            isUntitled = true
            blockInfo.heading = block.title || block.heading || '(empty)'
            blockInfo.issue = 'Missing title/heading'
          } else {
            blockInfo.heading = block.title || block.heading || 'Has title'
          }
          break
          
        case 'faqGroup':
          if (!block.heading) {
            isUntitled = true
            blockInfo.heading = block.heading || '(empty)'
            blockInfo.issue = 'Missing heading'
          } else {
            blockInfo.heading = block.heading
          }
          break
          
        case 'callToActionSection':
          if (!block.title) {
            isUntitled = true
            blockInfo.heading = block.title || '(empty)'
            blockInfo.issue = 'Missing title'
          } else {
            blockInfo.heading = block.title
          }
          break
      }
      
      if (isUntitled) {
        untitledCount++
        untitledSections.push(blockInfo)
      }
      
      // Log all sections for visibility
      console.log(`[${index}] ${block._type}: ${blockInfo.heading}`)
    })
    
    // Report findings
    if (untitledCount > 0) {
      console.log(`\n⚠️  Found ${untitledCount} untitled sections:`)
      untitledSections.forEach(section => {
        console.log(`\n  Index ${section.index}: ${section.type}`)
        console.log(`  Current heading: ${section.heading}`)
        console.log(`  Issue: ${section.issue}`)
      })
    } else {
      console.log('\n✅ All sections have proper titles/headings!')
    }
    
    // Check for content that might contain headings
    if (untitledCount > 0) {
      console.log('\n🔍 Checking content blocks for potential headings...')
      untitledSections.forEach(section => {
        const block = document.contentBlocks[section.index]
        if (block.content && Array.isArray(block.content)) {
          const firstContent = block.content[0]
          if (firstContent?.style === 'h3' && firstContent?.children?.[0]?.text) {
            console.log(`\n  Potential heading found in content for section ${section.index}:`)
            console.log(`  "${firstContent.children[0].text}"`)
          }
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking sections:', error)
    process.exit(1)
  }
}

// Execute
deepCheckUntitledSections()