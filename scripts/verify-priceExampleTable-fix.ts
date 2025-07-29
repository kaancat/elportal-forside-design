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

async function verifyPriceExampleTableFix() {
  try {
    console.log(chalk.blue('🔍 Verifying priceExampleTable fix...\n'))
    
    // Get the updated page
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    const query = `*[_id == $pageId][0]{
      _id,
      title,
      contentBlocks[_type == "priceExampleTable"]{
        _key,
        _type,
        title,
        leadingText,
        example1_title,
        example1_kwh_price,
        example1_subscription,
        example2_title,
        example2_kwh_price,
        example2_subscription,
        note,
        // Check for any remaining unknown fields
        examples,
        description,
        subtitle,
        highlightCheapest,
        showMonthlyPrice
      }
    }`
    
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    
    const priceTableBlocks = page.contentBlocks.filter(b => b._type === 'priceExampleTable')
    
    if (priceTableBlocks.length === 0) {
      console.log(chalk.red('❌ No priceExampleTable blocks found'))
      return
    }
    
    console.log(chalk.blue(`Found ${priceTableBlocks.length} priceExampleTable block(s):\n`))
    
    priceTableBlocks.forEach((block, index) => {
      console.log(chalk.yellow(`${index + 1}. PriceExampleTable (${block._key})`))
      
      // Check required fields
      const requiredFields = [
        'title',
        'example1_title',
        'example1_kwh_price', 
        'example1_subscription',
        'example2_title',
        'example2_kwh_price',
        'example2_subscription'
      ]
      
      let allFieldsPresent = true
      let validationErrors = []
      
      requiredFields.forEach(field => {
        if (block[field] === undefined || block[field] === null) {
          allFieldsPresent = false
          validationErrors.push(`Missing required field: ${field}`)
          console.log(chalk.red(`   ❌ Missing: ${field}`))
        } else {
          console.log(chalk.green(`   ✅ ${field}: ${JSON.stringify(block[field])}`))
        }
      })
      
      // Check numeric field validations
      const numericFields = ['example1_kwh_price', 'example1_subscription', 'example2_kwh_price', 'example2_subscription']
      numericFields.forEach(field => {
        if (block[field] !== undefined && block[field] < 0) {
          validationErrors.push(`${field} must be >= 0`)
          console.log(chalk.red(`   ❌ Invalid: ${field} is ${block[field]} (must be >= 0)`))
        }
      })
      
      // Check for unknown fields
      const unknownFields = ['examples', 'description', 'subtitle', 'highlightCheapest', 'showMonthlyPrice']
      const foundUnknownFields = unknownFields.filter(field => block[field] !== undefined)
      
      if (foundUnknownFields.length > 0) {
        console.log(chalk.red(`   ❌ Unknown fields still present: ${foundUnknownFields.join(', ')}`))
        validationErrors.push(`Unknown fields: ${foundUnknownFields.join(', ')}`)
      } else {
        console.log(chalk.green('   ✅ No unknown fields'))
      }
      
      // Show optional fields
      if (block.leadingText) {
        console.log(chalk.blue(`   📝 leadingText: ${block.leadingText.length} blocks`))
      }
      if (block.note) {
        console.log(chalk.blue(`   📝 note: "${block.note}"`))
      }
      
      console.log('')
      
      if (allFieldsPresent && validationErrors.length === 0) {
        console.log(chalk.green('   🎉 ALL VALIDATION CHECKS PASSED!'))
      } else {
        console.log(chalk.red(`   ❌ ${validationErrors.length} validation issues found:`))
        validationErrors.forEach(error => {
          console.log(chalk.red(`      - ${error}`))
        })
      }
    })
    
    console.log(chalk.blue('\n📋 Summary:'))
    console.log(`- PriceExampleTable blocks: ${priceTableBlocks.length}`)
    console.log(`- Schema compliance: ${priceTableBlocks.every(b => 
      b.title && b.example1_title && b.example1_kwh_price !== undefined && 
      b.example1_subscription !== undefined && b.example2_title && 
      b.example2_kwh_price !== undefined && b.example2_subscription !== undefined
    ) ? '✅ PASSED' : '❌ FAILED'}`)
    
    console.log('\nThe page should now load without validation errors in Sanity Studio!')
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

verifyPriceExampleTableFix()