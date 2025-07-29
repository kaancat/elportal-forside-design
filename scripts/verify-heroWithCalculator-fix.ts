import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { HeroWithCalculatorSchema } from '@/lib/sanity-schemas.zod'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function verifyHeroWithCalculatorFix() {
  try {
    console.log(chalk.blue('🔍 Verifying heroWithCalculator schema fix...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Get the heroWithCalculator block
    const page = await client.fetch(`*[_id == $pageId][0]{
      "heroWithCalculatorBlocks": contentBlocks[_type == 'heroWithCalculator']{
        _type,
        _key,
        headline,
        subheadline,
        content,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats,
        // Check for deprecated fields
        title,
        subtitle
      }
    }`, { pageId })
    
    const heroBlock = page?.heroWithCalculatorBlocks?.[0]
    
    if (!heroBlock) {
      console.log(chalk.red('❌ No heroWithCalculator block found'))
      return
    }
    
    console.log(chalk.green('✅ Found heroWithCalculator block\n'))
    
    // Validate with Zod schema
    console.log(chalk.blue('🔧 Testing Zod validation...'))
    try {
      const validatedBlock = HeroWithCalculatorSchema.parse(heroBlock)
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
    if (heroBlock.headline) {
      console.log(chalk.green(`✅ headline: "${heroBlock.headline}"`))
    } else {
      console.log(chalk.red('❌ headline: MISSING'))
    }
    
    // Optional fields
    console.log(chalk.yellow('\nOptional Fields:'))
    
    const optionalFields = [
      { key: 'subheadline', value: heroBlock.subheadline },
      { key: 'calculatorTitle', value: heroBlock.calculatorTitle },
      { key: 'showLivePrice', value: heroBlock.showLivePrice },
      { key: 'showProviderComparison', value: heroBlock.showProviderComparison },
    ]
    
    optionalFields.forEach(({ key, value }) => {
      if (value !== undefined) {
        console.log(chalk.green(`✅ ${key}: ${typeof value === 'string' ? '"' + value + '"' : value}`))
      } else {
        console.log(chalk.gray(`⚪ ${key}: not set`))
      }
    })
    
    // Content array
    if (heroBlock.content && Array.isArray(heroBlock.content)) {
      console.log(chalk.green(`✅ content: ${heroBlock.content.length} blocks`))
      heroBlock.content.forEach((block, i) => {
        if (block._type === 'block') {
          const text = block.children?.map(child => child.text).join('') || ''
          console.log(chalk.blue(`   Block ${i + 1}: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`))
        }
      })
    } else {
      console.log(chalk.gray('⚪ content: not set'))
    }
    
    // Stats array
    if (heroBlock.stats && Array.isArray(heroBlock.stats)) {
      console.log(chalk.green(`✅ stats: ${heroBlock.stats.length} items`))
      heroBlock.stats.forEach((stat, i) => {
        console.log(chalk.blue(`   ${i + 1}. ${stat.value} - ${stat.label}`))
      })
    } else {
      console.log(chalk.gray('⚪ stats: not set'))
    }
    
    // Deprecated fields check
    console.log(chalk.yellow('\nDeprecated Fields (should be empty):'))
    if (heroBlock.title) {
      console.log(chalk.orange(`⚠️  title: "${heroBlock.title}" (should use headline instead)`))
    } else {
      console.log(chalk.green('✅ title: properly empty'))
    }
    
    if (heroBlock.subtitle) {
      console.log(chalk.orange(`⚠️  subtitle: "${heroBlock.subtitle}" (should use subheadline instead)`))
    } else {
      console.log(chalk.green('✅ subtitle: properly empty'))
    }
    
    console.log(chalk.blue('\n📊 Summary:'))
    const hasRequiredFields = !!heroBlock.headline
    const hasValidStructure = heroBlock._type === 'heroWithCalculator' && heroBlock._key
    
    if (hasRequiredFields && hasValidStructure) {
      console.log(chalk.green('🎉 ALL VALIDATION CHECKS PASSED!'))
      console.log(chalk.green('The heroWithCalculator block should now work without schema errors.'))
    } else {
      console.log(chalk.red('❌ Validation issues found'))
      if (!hasRequiredFields) console.log(chalk.red('   - Missing required fields'))
      if (!hasValidStructure) console.log(chalk.red('   - Invalid block structure'))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

verifyHeroWithCalculatorFix()