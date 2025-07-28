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

// Map of section indices to their proper headings based on content
const sectionHeadings = {
  1: 'Din komplette guide til at vælge el-leverandør',
  2: 'Forstå markedet for el-leverandører i Danmark', 
  4: 'Beregn din potentielle besparelse', // This one is already fixed
  5: 'Forstå forskellige prismodeller',
  7: 'Grøn energi og bæredygtighed',
  9: 'Særlige overvejelser for forskellige forbrugertyper',
  10: 'Processen: Fra research til skift',
  11: 'Almindelige faldgruber og hvordan du undgår dem',
  12: 'Vindstød - Et eksempel på moderne el-leverandør'
}

// Fix all pageSection headings
async function fixAllPageSectionHeadings() {
  console.log('🔧 Fixing all pageSection headings')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    // Fetch document
    const document = await client.getDocument(documentId)
    console.log(`\n📄 Document: ${document.title}`)
    console.log(`📊 Total blocks: ${document.contentBlocks?.length || 0}`)
    
    let fixCount = 0
    
    // Fix headings in content blocks
    const fixedContentBlocks = document.contentBlocks.map((block: any, index: number) => {
      // Only fix pageSection blocks that are untitled
      if (block._type === 'pageSection' && (!block.heading || block.heading === 'Untitled Page Section')) {
        const newHeading = sectionHeadings[index]
        
        if (newHeading) {
          fixCount++
          console.log(`\n✏️  Fixing section ${index}: "${newHeading}"`)
          
          return {
            ...block,
            heading: newHeading
          }
        } else {
          // Try to extract heading from content if not in our map
          const firstBlock = block.content?.[0]
          if (firstBlock?.style === 'h3' && firstBlock?.children?.[0]?.text) {
            const extractedHeading = firstBlock.children[0].text
            fixCount++
            console.log(`\n✏️  Extracting heading for section ${index}: "${extractedHeading}"`)
            
            return {
              ...block,
              heading: extractedHeading
            }
          }
        }
      }
      
      // Fix valueProposition if untitled
      if (block._type === 'valueProposition' && (!block.heading || block.heading === 'Untitled')) {
        fixCount++
        const heading = 'Hvorfor bruge ElPortal til sammenligning?'
        console.log(`\n✏️  Fixing valueProposition heading: "${heading}"`)
        
        return {
          ...block,
          heading: heading
        }
      }
      
      return block
    })
    
    if (fixCount > 0) {
      console.log(`\n📝 Applying ${fixCount} heading fixes...`)
      
      await client
        .patch(documentId)
        .set({ contentBlocks: fixedContentBlocks })
        .commit()
      
      console.log('✅ All headings fixed successfully!')
    } else {
      console.log('\n✅ No untitled sections found')
    }
    
    // Verify current state
    console.log('\n📊 Final block analysis:')
    fixedContentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'pageSection' || block._type === 'valueProposition') {
        const heading = block.heading || block.title || 'Still untitled'
        console.log(`[${index}] ${block._type}: ${heading}`)
      }
    })
    
    console.log(`\n🔗 View document: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    
  } catch (error) {
    console.error('❌ Error fixing headings:', error)
    process.exit(1)
  }
}

// Execute
fixAllPageSectionHeadings()