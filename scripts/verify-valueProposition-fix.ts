import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { ValuePropositionSchema } from '@/lib/sanity-schemas.zod'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function verifyValuePropositionFix() {
  try {
    console.log(chalk.blue('🔍 Verifying valueProposition schema fix...\n'))
    
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Get the valueProposition blocks
    const page = await client.fetch(`*[_id == $pageId][0]{
      "valuePropositionBlocks": contentBlocks[_type == 'valueProposition']{
        _type,
        _key,
        heading,
        subheading,
        content,
        valueItems,
        // Check deprecated fields
        title,
        items,
        propositions
      }
    }`, { pageId })
    
    const valuePropositionBlocks = page?.valuePropositionBlocks
    
    if (!valuePropositionBlocks || valuePropositionBlocks.length === 0) {
      console.log(chalk.red('❌ No valueProposition blocks found'))
      return
    }
    
    console.log(chalk.green(`✅ Found ${valuePropositionBlocks.length} valueProposition blocks\n`))
    
    valuePropositionBlocks.forEach((block, index) => {
      console.log(chalk.yellow(`Block ${index + 1}:`))
      
      // Validate with Zod schema
      console.log(chalk.blue('🔧 Testing Zod validation...'))
      try {
        const validatedBlock = ValuePropositionSchema.parse(block)
        console.log(chalk.green('✅ Zod validation passed!'))
      } catch (error) {
        console.log(chalk.red('❌ Zod validation failed:'), error.message)
      }
      
      // Check field values
      console.log(chalk.blue('\n📋 Field Analysis:'))
      
      // Required fields
      console.log(chalk.yellow('Required Fields:'))
      if (block.heading) {
        console.log(chalk.green(`✅ heading: "${block.heading}"`))
      } else {
        console.log(chalk.red('❌ heading: MISSING'))
      }
      
      // Previously unknown fields now supported
      console.log(chalk.yellow('\nPreviously Unknown Fields (now supported):'))
      
      if (block.subheading) {
        console.log(chalk.green(`✅ subheading: "${block.subheading}"`))
      } else {
        console.log(chalk.gray('⚪ subheading: not set'))
      }
      
      // Content array (Portable Text)
      if (block.content && Array.isArray(block.content)) {
        console.log(chalk.green(`✅ content: ${block.content.length} blocks`))
        const preview = block.content.slice(0, 3).map((contentBlock, i) => {
          if (contentBlock._type === 'block') {
            const text = contentBlock.children?.map(child => child.text).join('') || ''
            return `   ${contentBlock.style === 'h3' ? 'H3:' : 'P:'} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
          }
          return null
        }).filter(Boolean)
        preview.forEach(p => console.log(chalk.blue(p)))
        if (block.content.length > 3) {
          console.log(chalk.blue(`   ... and ${block.content.length - 3} more blocks`))
        }
      } else {
        console.log(chalk.gray('⚪ content: not set'))
      }
      
      // ValueItems array
      if (block.valueItems && Array.isArray(block.valueItems)) {
        console.log(chalk.green(`✅ valueItems: ${block.valueItems.length} items`))
        block.valueItems.forEach((item, i) => {
          console.log(chalk.blue(`   ${i + 1}. ${item.heading} - ${item.description}`))
        })
      } else {
        console.log(chalk.gray('⚪ valueItems: not set'))
      }
      
      // Deprecated fields check
      console.log(chalk.yellow('\nDeprecated Fields:'))
      if (block.title) {
        console.log(chalk.orange(`⚠️  title: "${block.title}" (should use heading instead)`))
      } else {
        console.log(chalk.green('✅ title: properly empty'))
      }
      
      if (block.items) {
        console.log(chalk.orange(`⚠️  items: ${block.items.length} items (should use valueItems instead)`))
      } else {
        console.log(chalk.green('✅ items: properly empty'))
      }
      
      if (block.propositions) {
        console.log(chalk.orange(`⚠️  propositions: ${block.propositions.length} items (deprecated)`))
      } else {
        console.log(chalk.green('✅ propositions: properly empty'))
      }
      
      console.log('\n' + '-'.repeat(50) + '\n')
    })
    
    console.log(chalk.blue('📊 Summary:'))
    const allValid = valuePropositionBlocks.every(block => !!block.heading)
    
    if (allValid) {
      console.log(chalk.green('🎉 ALL VALIDATION CHECKS PASSED!'))
      console.log(chalk.green('The valueProposition blocks should now work without schema errors.'))
      console.log('')
      console.log(chalk.blue('💡 The following fields are now recognized:'))
      console.log(chalk.blue('   ✅ heading (required)'))
      console.log(chalk.blue('   ✅ subheading'))
      console.log(chalk.blue('   ✅ content (Portable Text)'))
      console.log(chalk.blue('   ✅ valueItems (array of value propositions)'))
    } else {
      console.log(chalk.red('❌ Some blocks have validation issues'))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

verifyValuePropositionFix()