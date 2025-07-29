import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function debugPageSectionFix() {
  try {
    console.log(chalk.blue('🔍 Debugging pageSection structure...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // First, get the exact content blocks
    const query = `*[_id == $pageId][0]{
      contentBlocks[_type == "pageSection"]{
        _key,
        _type,
        title,
        content
      }
    }`
    
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.blue('PageSections with their content:\n'))
    
    page.contentBlocks.forEach((section, index) => {
      console.log(chalk.yellow(`${index + 1}. PageSection: "${section.title}"`))
      console.log(chalk.gray(`   Key: ${section._key}`))
      
      if (section.content && Array.isArray(section.content)) {
        console.log(chalk.blue(`   Content array (${section.content.length} items):`))
        
        section.content.forEach((item, idx) => {
          console.log(chalk.cyan(`     ${idx}. Type: ${item._type}`))
          console.log(chalk.gray(`        Key: ${item._key}`))
          
          // Show first few properties
          const props = Object.keys(item).filter(k => !k.startsWith('_'))
          if (props.length > 0) {
            console.log(chalk.gray(`        Properties: ${props.slice(0, 5).join(', ')}${props.length > 5 ? '...' : ''}`))
          }
        })
      }
      console.log('')
    })
    
    // Now let's manually fix this
    console.log(chalk.blue('\n🔧 Attempting manual fix...\n'))
    
    // Get the full page
    const fullPage = await client.fetch(`*[_id == $pageId][0]`, { pageId })
    
    if (!fullPage || !fullPage.contentBlocks) {
      console.log(chalk.red('Cannot fetch full page'))
      return
    }
    
    // Find indices of problematic pageSections
    const problematicIndices = []
    fullPage.contentBlocks.forEach((block, index) => {
      if (block._type === 'pageSection' && block.content && Array.isArray(block.content)) {
        const hasInvalid = block.content.some(item => 
          ['valueProposition', 'priceExampleTable'].includes(item._type)
        )
        if (hasInvalid) {
          problematicIndices.push(index)
        }
      }
    })
    
    console.log(chalk.yellow(`Found ${problematicIndices.length} problematic pageSections at indices: ${problematicIndices.join(', ')}`))
    
    // Create a new content blocks array
    const newContentBlocks = []
    const extractedComponents = []
    
    fullPage.contentBlocks.forEach((block, index) => {
      if (block._type === 'pageSection' && problematicIndices.includes(index)) {
        console.log(chalk.cyan(`\nProcessing pageSection at index ${index}: "${block.title}"`))
        
        // Extract text content and invalid components
        const newContent = []
        
        block.content.forEach((item) => {
          if (['valueProposition', 'priceExampleTable'].includes(item._type)) {
            console.log(chalk.yellow(`  - Extracting ${item._type}`))
            
            // Extract text from valueProposition
            if (item._type === 'valueProposition') {
              if (item.heading) {
                newContent.push({
                  _type: 'block',
                  _key: `h2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  style: 'h2',
                  children: [{
                    _type: 'span',
                    _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: item.heading,
                    marks: []
                  }],
                  markDefs: []
                })
              }
              if (item.subheading) {
                newContent.push({
                  _type: 'block',
                  _key: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  style: 'normal',
                  children: [{
                    _type: 'span',
                    _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: item.subheading,
                    marks: []
                  }],
                  markDefs: []
                })
              }
              if (item.content && Array.isArray(item.content)) {
                newContent.push(...item.content)
              }
            }
            
            // Extract text from priceExampleTable
            if (item._type === 'priceExampleTable') {
              if (item.title) {
                newContent.push({
                  _type: 'block',
                  _key: `h2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  style: 'h2',
                  children: [{
                    _type: 'span',
                    _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: item.title,
                    marks: []
                  }],
                  markDefs: []
                })
              }
              if (item.subtitle) {
                newContent.push({
                  _type: 'block',
                  _key: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  style: 'normal',
                  children: [{
                    _type: 'span',
                    _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: item.subtitle,
                    marks: []
                  }],
                  markDefs: []
                })
              }
              if (item.description && Array.isArray(item.description)) {
                newContent.push(...item.description)
              }
            }
            
            // Keep the component for later insertion
            extractedComponents.push({
              component: item,
              insertAfterIndex: newContentBlocks.length // Will be the current section's position
            })
          } else {
            // Keep valid content as-is
            newContent.push(item)
          }
        })
        
        // Add the updated section
        newContentBlocks.push({
          ...block,
          content: newContent
        })
      } else {
        // Keep non-problematic blocks as-is
        newContentBlocks.push(block)
      }
    })
    
    // Now insert extracted components after their respective sections
    extractedComponents.reverse().forEach(({ component, insertAfterIndex }) => {
      newContentBlocks.splice(insertAfterIndex + 1, 0, component)
      console.log(chalk.green(`\nInserted ${component._type} at position ${insertAfterIndex + 1}`))
    })
    
    // Update the page
    console.log(chalk.blue('\n📤 Updating page with fixed structure...\n'))
    
    try {
      const result = await client
        .patch(pageId)
        .set({ contentBlocks: newContentBlocks })
        .commit()
      
      console.log(chalk.green('✅ Successfully updated page!'))
      console.log(chalk.gray(`   Revision: ${result._rev}`))
    } catch (error) {
      console.log(chalk.red('❌ Error updating page:', error.message))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

debugPageSectionFix()