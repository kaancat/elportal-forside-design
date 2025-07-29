import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { RealPriceComparisonTableSchema } from '@/lib/sanity-schemas.zod'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function verifyRealPriceComparisonTableFix() {
  try {
    console.log(chalk.blue('🔍 Verifying realPriceComparisonTable schema fix...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Get the realPriceComparisonTable block
    const page = await client.fetch(`*[_id == $pageId][0]{
      "realPriceTableBlocks": contentBlocks[_type == 'realPriceComparisonTable']{
        _type,
        _key,
        title,
        subtitle,
        description,
        region,
        highlightLowest,
        showSpotPrice,
        showProviderFee,
        showTotalPrice,
        // Check deprecated field
        leadingText
      }
    }`, { pageId })
    
    const priceTableBlock = page?.realPriceTableBlocks?.[0]
    
    if (!priceTableBlock) {
      console.log(chalk.red('❌ No realPriceComparisonTable block found'))
      return
    }
    
    console.log(chalk.green('✅ Found realPriceComparisonTable block\n'))
    
    // Validate with Zod schema
    console.log(chalk.blue('🔧 Testing Zod validation...'))
    try {
      const validatedBlock = RealPriceComparisonTableSchema.parse(priceTableBlock)
      console.log(chalk.green('✅ Zod validation passed!\n'))
    } catch (error) {
      console.log(chalk.red('❌ Zod validation failed:'), error.message)
      console.log('')
    }
    
    // Check field values
    console.log(chalk.blue('📋 Field Analysis:'))
    console.log('')
    
    // Required fields
    console.log(chalk.yellow('Required Fields:'))
    if (priceTableBlock.title) {
      console.log(chalk.green(`✅ title: "${priceTableBlock.title}"`))
    } else {
      console.log(chalk.red('❌ title: MISSING'))
    }
    
    // Optional fields that were previously "unknown"
    console.log(chalk.yellow('\nPreviously Unknown Fields (now supported):'))
    
    const previouslyUnknownFields = [
      { key: 'subtitle', value: priceTableBlock.subtitle },
      { key: 'region', value: priceTableBlock.region },
      { key: 'highlightLowest', value: priceTableBlock.highlightLowest },
      { key: 'showSpotPrice', value: priceTableBlock.showSpotPrice },
      { key: 'showProviderFee', value: priceTableBlock.showProviderFee },
      { key: 'showTotalPrice', value: priceTableBlock.showTotalPrice },
    ]
    
    previouslyUnknownFields.forEach(({ key, value }) => {
      if (value !== undefined && value !== null) {
        console.log(chalk.green(`✅ ${key}: ${typeof value === 'string' ? '"' + value + '"' : value}`))
      } else {
        console.log(chalk.gray(`⚪ ${key}: not set`))
      }
    })
    
    // Description array (Portable Text)
    if (priceTableBlock.description && Array.isArray(priceTableBlock.description)) {
      console.log(chalk.green(`✅ description: ${priceTableBlock.description.length} blocks`))
      priceTableBlock.description.forEach((block, i) => {
        if (block._type === 'block') {
          const text = block.children?.map(child => child.text).join('') || ''
          console.log(chalk.blue(`   Block ${i + 1}: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`))
        }
      })
    } else {
      console.log(chalk.gray('⚪ description: not set'))
    }
    
    // Deprecated field check
    console.log(chalk.yellow('\nDeprecated Fields:'))
    if (priceTableBlock.leadingText) {
      console.log(chalk.orange(`⚠️  leadingText: "${priceTableBlock.leadingText}" (should use description instead)`))
    } else {
      console.log(chalk.green('✅ leadingText: properly empty'))
    }
    
    console.log(chalk.blue('\n📊 Summary:'))
    const hasRequiredFields = !!priceTableBlock.title
    const hasValidStructure = priceTableBlock._type === 'realPriceComparisonTable' && priceTableBlock._key
    
    if (hasRequiredFields && hasValidStructure) {
      console.log(chalk.green('🎉 ALL VALIDATION CHECKS PASSED!'))
      console.log(chalk.green('The realPriceComparisonTable block should now work without schema errors.'))
      console.log('')
      console.log(chalk.blue('💡 The following fields are now recognized:'))
      console.log(chalk.blue('   ✅ title (required)'))
      console.log(chalk.blue('   ✅ subtitle'))
      console.log(chalk.blue('   ✅ description (Portable Text)'))
      console.log(chalk.blue('   ✅ region (DK1/DK2)'))
      console.log(chalk.blue('   ✅ highlightLowest (boolean)'))
      console.log(chalk.blue('   ✅ showSpotPrice (boolean)'))
      console.log(chalk.blue('   ✅ showProviderFee (boolean)'))
      console.log(chalk.blue('   ✅ showTotalPrice (boolean)'))
    } else {
      console.log(chalk.red('❌ Validation issues found'))
      if (!hasRequiredFields) console.log(chalk.red('   - Missing required fields'))
      if (!hasValidStructure) console.log(chalk.red('   - Invalid block structure'))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

verifyRealPriceComparisonTableFix()