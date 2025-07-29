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

async function finalVerification() {
  try {
    console.log(chalk.blue('🔍 Final verification of priceExampleTable fix...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Get the raw document without explicitly requesting the unknown fields
    const page = await client.fetch(`*[_id == $pageId][0]`, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    
    // Find the priceExampleTable block
    const priceTableBlocks = page.contentBlocks.filter(b => b._type === 'priceExampleTable')
    
    if (priceTableBlocks.length === 0) {
      console.log(chalk.red('❌ No priceExampleTable blocks found'))
      return
    }
    
    console.log(chalk.blue(`Found ${priceTableBlocks.length} priceExampleTable block(s):\n`))
    
    priceTableBlocks.forEach((block, index) => {
      console.log(chalk.yellow(`${index + 1}. PriceExampleTable (${block._key})`))
      
      // Check all fields that are actually present in the block
      const allFields = Object.keys(block)
      console.log(chalk.blue(`   Fields present: ${allFields.length}`))
      
      // Define what should be present
      const expectedFields = ['_key', '_type', 'title', 'leadingText', 'example1_title', 'example1_kwh_price', 'example1_subscription', 'example2_title', 'example2_kwh_price', 'example2_subscription', 'note']
      const unknownFields = ['examples', 'description', 'subtitle', 'highlightCheapest', 'showMonthlyPrice']
      
      // Check required fields
      let allRequiredPresent = true
      expectedFields.forEach(field => {
        if (field === 'leadingText' || field === 'note') {
          // Optional fields
          if (block[field] !== undefined) {
            console.log(chalk.green(`   ✅ ${field}: ${typeof block[field] === 'string' ? '"' + block[field] + '"' : 'present'}`))
          }
        } else {
          // Required fields
          if (block[field] === undefined || block[field] === null) {
            allRequiredPresent = false
            console.log(chalk.red(`   ❌ Missing: ${field}`))
          } else {
            console.log(chalk.green(`   ✅ ${field}: ${typeof block[field] === 'string' ? '"' + block[field] + '"' : block[field]}`))
          }
        }
      })
      
      // Check for unknown fields that shouldn't exist
      const foundUnknownFields = unknownFields.filter(field => 
        block.hasOwnProperty(field) && block[field] !== undefined && block[field] !== null
      )
      
      if (foundUnknownFields.length > 0) {
        console.log(chalk.red(`   ❌ Unknown fields found: ${foundUnknownFields.join(', ')}`))
        foundUnknownFields.forEach(field => {
          console.log(chalk.red(`      - ${field}: ${JSON.stringify(block[field])}`))
        })
      } else {
        console.log(chalk.green('   ✅ No unknown fields found'))
      }
      
      // Show unexpected fields that aren't in either list
      const unexpectedFields = allFields.filter(field => 
        !expectedFields.includes(field) && !unknownFields.includes(field)
      )
      
      if (unexpectedFields.length > 0) {
        console.log(chalk.orange(`   ⚠️  Unexpected fields: ${unexpectedFields.join(', ')}`))
      }
      
      console.log('')
      
      if (allRequiredPresent && foundUnknownFields.length === 0) {
        console.log(chalk.green('   🎉 ALL VALIDATION CHECKS PASSED!'))
        console.log(chalk.green('   The page should load without errors in Sanity Studio!'))
      } else {
        console.log(chalk.red('   ❌ Validation issues still exist'))
      }
    })
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

finalVerification()