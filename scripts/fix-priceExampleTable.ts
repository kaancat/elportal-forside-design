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

async function fixPriceExampleTable() {
  try {
    console.log(chalk.blue('🔧 Fixing priceExampleTable schema issues...\n'))
    
    // Find the problematic page
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    const query = `*[_id == $pageId][0]{
      _id,
      title,
      contentBlocks
    }`
    
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    
    // Find the priceExampleTable block
    let priceExampleTableIndex = -1
    let priceExampleTableBlock = null
    
    for (let i = 0; i < page.contentBlocks.length; i++) {
      if (page.contentBlocks[i]._type === 'priceExampleTable') {
        priceExampleTableIndex = i
        priceExampleTableBlock = page.contentBlocks[i]
        break
      }
    }
    
    if (!priceExampleTableBlock) {
      console.log(chalk.red('❌ No priceExampleTable found'))
      return
    }
    
    console.log(chalk.yellow(`Found priceExampleTable at index ${priceExampleTableIndex}`))
    console.log(chalk.gray('Current structure:'))
    console.log(JSON.stringify(priceExampleTableBlock, null, 2))
    
    // Transform the data to match the schema
    const currentData = priceExampleTableBlock
    const examples = currentData.examples || []
    
    if (examples.length < 2) {
      console.log(chalk.red('❌ Need at least 2 examples to convert'))
      return
    }
    
    // Convert to schema format
    const transformedBlock = {
      ...currentData,
      // Map fields to schema expectations
      title: currentData.title || currentData.subtitle || 'Priseksempler',
      leadingText: currentData.description || currentData.leadingText || [],
      
      // Convert first two examples to schema format
      example1_title: examples[0].label || 'Eksempel 1',
      example1_kwh_price: 2.50, // Use a reasonable default kWh price
      example1_subscription: examples[0].monthlyPrice || 0,
      
      example2_title: examples[1].label || 'Eksempel 2', 
      example2_kwh_price: 2.50, // Use a reasonable default kWh price
      example2_subscription: examples[1].monthlyPrice || 0,
      
      note: `Priserne er eksempler baseret på et gennemsnitligt kWh-pris på 2,50 kr. ${examples.length > 2 ? `(Oprindeligt ${examples.length} eksempler - kun de første 2 vises)` : ''}`.trim()
    }
    
    // Remove unknown fields
    delete transformedBlock.examples
    delete transformedBlock.highlightCheapest
    delete transformedBlock.showMonthlyPrice
    delete transformedBlock.subtitle
    delete transformedBlock.description
    
    console.log(chalk.blue('\nTransformed structure:'))
    console.log(JSON.stringify(transformedBlock, null, 2))
    
    // Update the page
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[priceExampleTableIndex] = transformedBlock
    
    console.log(chalk.blue('\n📤 Updating page...\n'))
    
    try {
      const result = await client
        .patch(pageId)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log(chalk.green('✅ Successfully updated priceExampleTable!'))
      console.log(chalk.gray(`   Revision: ${result._rev}`))
      
      console.log(chalk.blue('\nChanges made:'))
      console.log(chalk.green(`✓ subtitle → title: "${transformedBlock.title}"`))
      console.log(chalk.green(`✓ description → leadingText: ${transformedBlock.leadingText.length} blocks`))
      console.log(chalk.green(`✓ examples[0] → example1: "${transformedBlock.example1_title}"`))
      console.log(chalk.green(`✓ examples[1] → example2: "${transformedBlock.example2_title}"`))
      console.log(chalk.green(`✓ Added required price fields with defaults`))
      console.log(chalk.green(`✓ Removed unknown fields: examples, highlightCheapest, showMonthlyPrice`))
      
      if (examples.length > 2) {
        console.log(chalk.yellow(`\n⚠️  Note: Converted ${examples.length} examples to 2 (schema limitation)`))
        console.log(chalk.yellow('   The remaining examples were:'))
        examples.slice(2).forEach((example, idx) => {
          console.log(chalk.gray(`     ${idx + 3}. ${example.label}: ${example.monthlyPrice} kr/måned`))
        })
      }
      
    } catch (error) {
      console.log(chalk.red('❌ Error updating page:', error.message))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

fixPriceExampleTable()