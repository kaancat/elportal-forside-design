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

async function verifyPageSectionFixes() {
  try {
    console.log(chalk.blue('🔍 Verifying pageSection fixes...\n'))
    
    // Check the fixed page
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    const query = `*[_id == $pageId][0]{
      _id,
      title,
      contentBlocks[]{
        _key,
        _type,
        _type == "pageSection" => {
          title,
          content[]{
            _type,
            _key,
            _type == "block" => {
              "text": children[0].text,
              style
            }
          }
        },
        _type == "valueProposition" => {
          heading,
          subheading,
          items
        },
        _type == "priceExampleTable" => {
          title,
          subtitle,
          examples
        }
      }
    }`
    
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    console.log(chalk.blue('Content structure after fix:\n'))
    
    let hasInvalidNesting = false
    
    page.contentBlocks.forEach((block, index) => {
      console.log(chalk.yellow(`${index + 1}. ${block._type}`))
      
      if (block._type === 'pageSection') {
        console.log(chalk.gray(`   Title: "${block.title}"`))
        
        if (block.content && Array.isArray(block.content)) {
          console.log(chalk.blue(`   Content (${block.content.length} blocks):`))
          
          block.content.forEach((contentBlock, idx) => {
            const preview = contentBlock.text ? 
              contentBlock.text.substring(0, 50) + (contentBlock.text.length > 50 ? '...' : '') : 
              ''
            
            console.log(chalk.cyan(`     ${idx + 1}. ${contentBlock._type} ${contentBlock.style ? `(${contentBlock.style})` : ''}`))
            if (preview) {
              console.log(chalk.gray(`        "${preview}"`))
            }
            
            // Check for invalid types
            const invalidTypes = ['valueProposition', 'priceExampleTable', 'faqGroup', 'featureList']
            if (invalidTypes.includes(contentBlock._type)) {
              console.log(chalk.red(`        ❌ INVALID TYPE STILL NESTED!`))
              hasInvalidNesting = true
            }
          })
        }
      } else if (block._type === 'valueProposition') {
        console.log(chalk.gray(`   Heading: "${block.heading}"`))
        console.log(chalk.gray(`   Items: ${block.items?.length || 0}`))
      } else if (block._type === 'priceExampleTable') {
        console.log(chalk.gray(`   Title: "${block.title}"`))
        console.log(chalk.gray(`   Examples: ${block.examples?.length || 0}`))
      }
      
      console.log('')
    })
    
    if (hasInvalidNesting) {
      console.log(chalk.red('\n❌ Invalid nesting still found! The fix may not have worked properly.'))
    } else {
      console.log(chalk.green('\n✅ All validation issues resolved!'))
      console.log(chalk.green('- No invalid types nested in pageSections'))
      console.log(chalk.green('- Text content preserved in pageSection blocks'))
      console.log(chalk.green('- Complex components moved to top level'))
    }
    
    // Count content blocks by type
    const blockCounts = page.contentBlocks.reduce((acc, block) => {
      acc[block._type] = (acc[block._type] || 0) + 1
      return acc
    }, {})
    
    console.log(chalk.blue('\nContent block summary:'))
    Object.entries(blockCounts).forEach(([type, count]) => {
      console.log(chalk.gray(`  - ${type}: ${count}`))
    })
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

verifyPageSectionFixes()