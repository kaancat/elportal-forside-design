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

async function completeCleanup() {
  try {
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    console.log(chalk.blue('🧹 Performing complete cleanup of priceExampleTable...\n'))
    
    // Get the page
    const page = await client.fetch(`*[_id == $pageId][0]`, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    
    // Find and completely clean the priceExampleTable
    let updated = false
    const updatedContentBlocks = page.contentBlocks.map((block, index) => {
      if (block._type === 'priceExampleTable') {
        console.log(chalk.yellow(`Completely cleaning priceExampleTable at index ${index}`))
        
        // Create completely new object with ONLY valid fields
        const cleanBlock = {
          _key: block._key,
          _type: 'priceExampleTable',
          title: block.title,
          leadingText: block.leadingText,
          example1_title: block.example1_title,
          example1_kwh_price: block.example1_kwh_price,
          example1_subscription: block.example1_subscription,
          example2_title: block.example2_title,
          example2_kwh_price: block.example2_kwh_price,
          example2_subscription: block.example2_subscription,
          note: block.note
        }
        
        // Remove any undefined fields
        Object.keys(cleanBlock).forEach(key => {
          if (cleanBlock[key] === undefined) {
            delete cleanBlock[key]
          }
        })
        
        console.log(chalk.blue('Clean block structure:'))
        console.log(JSON.stringify(cleanBlock, null, 2))
        
        updated = true
        return cleanBlock
      }
      return block
    })
    
    if (!updated) {
      console.log(chalk.yellow('⚠️  No priceExampleTable found to clean'))
      return
    }
    
    // Update the page
    console.log(chalk.blue('\n📤 Updating page with completely clean structure...\n'))
    
    try {
      const result = await client
        .patch(pageId)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log(chalk.green('✅ Successfully performed complete cleanup!'))
      console.log(chalk.gray(`   Revision: ${result._rev}`))
      
      console.log(chalk.blue('\nThe page should now load without any validation errors!'))
      
    } catch (error) {
      console.log(chalk.red('❌ Error updating page:', error.message))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

completeCleanup()