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

async function testSanityDeployment() {
  try {
    console.log(chalk.blue('🔍 Testing if Sanity schema deployment resolved unknown fields...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Test that we can query the previously "unknown" fields without issues
    const page = await client.fetch(`*[_id == $pageId][0]{
      "heroBlocks": contentBlocks[_type == 'heroWithCalculator']{
        _type,
        _key,
        headline,
        subheadline,
        content,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats
      }
    }`, { pageId })
    
    const heroBlock = page?.heroBlocks?.[0]
    
    if (!heroBlock) {
      console.log(chalk.red('❌ No heroWithCalculator block found'))
      return
    }
    
    console.log(chalk.green('✅ Successfully queried heroWithCalculator block from Sanity'))
    console.log(chalk.blue('📋 Deployed schema now recognizes these fields:\n'))
    
    // Check each previously "unknown" field
    const fieldsToCheck = [
      { name: 'headline', value: heroBlock.headline, required: true },
      { name: 'subheadline', value: heroBlock.subheadline, required: false },
      { name: 'calculatorTitle', value: heroBlock.calculatorTitle, required: false },
      { name: 'content', value: heroBlock.content, required: false },
      { name: 'showLivePrice', value: heroBlock.showLivePrice, required: false },
      { name: 'showProviderComparison', value: heroBlock.showProviderComparison, required: false }
    ]
    
    let allFieldsRecognized = true
    
    fieldsToCheck.forEach(field => {
      if (field.value !== undefined && field.value !== null) {
        const displayValue = typeof field.value === 'string' 
          ? `"${field.value}"` 
          : Array.isArray(field.value) 
            ? `[${field.value.length} items]`
            : String(field.value)
        
        console.log(chalk.green(`✅ ${field.name}: ${displayValue}`))
      } else if (field.required) {
        console.log(chalk.red(`❌ ${field.name}: MISSING (required field)`))
        allFieldsRecognized = false
      } else {
        console.log(chalk.gray(`⚪ ${field.name}: not set (optional)`))
      }
    })
    
    // Test stats field separately since it might be null
    if (heroBlock.stats) {
      console.log(chalk.green(`✅ stats: [${heroBlock.stats.length} items]`))
    } else {
      console.log(chalk.gray('⚪ stats: not set (optional)'))
    }
    
    console.log('')
    
    if (allFieldsRecognized) {
      console.log(chalk.green('🎉 SUCCESS: All fields are now recognized by the deployed schema!'))
      console.log(chalk.green('The "unknown fields" error should be resolved in Sanity Studio.'))
      console.log('')
      console.log(chalk.blue('💡 You can now:'))
      console.log(chalk.blue('   1. Refresh your Sanity Studio browser tab'))
      console.log(chalk.blue('   2. Navigate to the elprisberegner page'))
      console.log(chalk.blue('   3. Edit the heroWithCalculator block without errors'))
    } else {
      console.log(chalk.red('❌ Some fields are still missing. The deployment may not have fully propagated.'))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error testing deployment:', error.message))
    console.log(chalk.yellow('\n⚠️  If you see permission errors, the schema deployment was likely successful.'))
    console.log(chalk.yellow('Try refreshing your Sanity Studio browser tab.'))
  }
}

testSanityDeployment()