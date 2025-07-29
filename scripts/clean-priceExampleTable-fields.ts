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

async function cleanPriceExampleTableFields() {
  try {
    console.log(chalk.blue('🧹 Cleaning unknown fields from priceExampleTable...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Get the full page
    const page = await client.fetch(`*[_id == $pageId][0]`, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    
    // Find and clean the priceExampleTable
    let updated = false
    const updatedContentBlocks = page.contentBlocks.map((block, index) => {
      if (block._type === 'priceExampleTable') {
        console.log(chalk.yellow(`Cleaning priceExampleTable at index ${index}`))
        
        // Keep only the schema-defined fields
        const cleanedBlock = {
          _key: block._key,
          _type: block._type,
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
        
        // Remove any undefined/null optional fields
        Object.keys(cleanedBlock).forEach(key => {
          if (cleanedBlock[key] === undefined || cleanedBlock[key] === null) {
            delete cleanedBlock[key]
          }
        })
        
        console.log(chalk.blue('Cleaned block structure:'))
        console.log(JSON.stringify(cleanedBlock, null, 2))
        
        updated = true
        return cleanedBlock
      }
      return block
    })
    
    if (!updated) {
      console.log(chalk.yellow('⚠️  No priceExampleTable found to clean'))
      return
    }
    
    // Update the page
    console.log(chalk.blue('\n📤 Updating page with cleaned structure...\n'))
    
    try {
      const result = await client
        .patch(pageId)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log(chalk.green('✅ Successfully cleaned priceExampleTable!'))
      console.log(chalk.gray(`   Revision: ${result._rev}`))
      
      console.log(chalk.blue('\nRemoved unknown fields:'))
      console.log(chalk.red('   - examples (array)'))
      console.log(chalk.red('   - description (should be leadingText)'))
      console.log(chalk.red('   - subtitle (should be title)'))
      console.log(chalk.red('   - highlightCheapest (not in schema)'))
      console.log(chalk.red('   - showMonthlyPrice (not in schema)'))
      
      console.log(chalk.green('\nKept schema-compliant fields:'))
      console.log(chalk.green('   ✅ title'))
      console.log(chalk.green('   ✅ leadingText'))
      console.log(chalk.green('   ✅ example1_title'))
      console.log(chalk.green('   ✅ example1_kwh_price'))
      console.log(chalk.green('   ✅ example1_subscription'))
      console.log(chalk.green('   ✅ example2_title'))
      console.log(chalk.green('   ✅ example2_kwh_price'))
      console.log(chalk.green('   ✅ example2_subscription'))
      console.log(chalk.green('   ✅ note'))
      
    } catch (error) {
      console.log(chalk.red('❌ Error updating page:', error.message))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

cleanPriceExampleTableFields()