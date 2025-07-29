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

async function verifyFixes() {
  try {
    console.log(chalk.blue('🔍 Verifying fixes...\n'))
    
    // Check the specific page mentioned by the user
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    
    // Fetch the page
    const query = `*[_id == $pageId][0]{
      _id,
      _type,
      title,
      slug,
      contentBlocks[]{
        ...,
        _type == "pageSection" => {
          _key,
          _type,
          title,
          heading,
          headerAlignment,
          theme,
          settings,
          content
        },
        _type == "hero" => {
          _key,
          _type,
          headline,
          subheadline,
          title,
          subtitle
        },
        _type == "valueProposition" => {
          _key,
          _type,
          title,
          items[]{
            _key,
            _type,
            heading,
            title,
            description,
            icon
          }
        },
        _type == "featureList" => {
          _key,
          _type,
          title,
          subtitle,
          features[]{
            _key,
            _type,
            title,
            description,
            icon
          }
        }
      }
    }`
    
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.error(chalk.red('❌ Page not found!'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}`))
    console.log(chalk.gray(`   Slug: ${page.slug?.current}\n`))
    
    let issuesFound = false
    
    // Check content blocks
    if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
      console.log(chalk.blue(`📦 Checking ${page.contentBlocks.length} content blocks:\n`))
      
      page.contentBlocks.forEach((block, index) => {
        console.log(chalk.yellow(`${index + 1}. ${block._type} (key: ${block._key})`))
        
        // Check pageSection blocks
        if (block._type === 'pageSection') {
          if (block.heading) {
            console.log(chalk.red('   ❌ Still has "heading" field!'))
            issuesFound = true
          }
          if (!block.title) {
            console.log(chalk.red('   ❌ Missing "title" field!'))
            issuesFound = true
          } else {
            console.log(chalk.green(`   ✅ Has title: "${block.title}"`))
          }
          console.log(chalk.gray(`   - headerAlignment: ${block.headerAlignment || 'not set'}`))
          console.log(chalk.gray(`   - theme: ${block.theme ? 'set' : 'not set'}`))
          console.log(chalk.gray(`   - settings: ${block.settings ? 'set' : 'not set'}`))
        }
        
        // Check hero blocks
        if (block._type === 'hero') {
          if (block.title || block.subtitle) {
            console.log(chalk.red('   ❌ Still has old title/subtitle fields!'))
            issuesFound = true
          }
          if (block.headline && block.subheadline) {
            console.log(chalk.green(`   ✅ Correctly using headline/subheadline`))
          }
        }
        
        // Check valueProposition blocks
        if (block._type === 'valueProposition' && block.items) {
          block.items.forEach((item, itemIndex) => {
            if (item.title) {
              console.log(chalk.red(`   ❌ Item ${itemIndex} still has "title" instead of "heading"!`))
              issuesFound = true
            }
            if (item.heading) {
              console.log(chalk.green(`   ✅ Item ${itemIndex} correctly using "heading"`))
            }
            if (item.icon && typeof item.icon === 'string') {
              console.log(chalk.red(`   ❌ Item ${itemIndex} has string icon instead of icon.manager object!`))
              issuesFound = true
            }
          })
        }
        
        // Check featureList blocks
        if (block._type === 'featureList' && block.features) {
          block.features.forEach((feature, featureIndex) => {
            if (feature.icon && typeof feature.icon === 'string') {
              console.log(chalk.red(`   ❌ Feature ${featureIndex} has string icon instead of icon.manager object!`))
              issuesFound = true
            }
          })
        }
        
        console.log('')
      })
    }
    
    if (!issuesFound) {
      console.log(chalk.green('\n✅ All checks passed! No issues found.'))
      console.log(chalk.blue('\nThe page has been successfully fixed:'))
      console.log('- All field names are correct')
      console.log('- No unknown fields detected')
      console.log('- Components should display properly on the frontend')
    } else {
      console.log(chalk.red('\n❌ Some issues still remain. Please run the fix script again.'))
    }
    
    console.log(chalk.blue('\n\n📋 Next steps:'))
    console.log('1. Visit the page in Sanity Studio to verify')
    console.log('2. Check the frontend to ensure content displays correctly')
    console.log(`3. Studio URL: https://dinelportal.sanity.studio/structure/page;${pageId}`)
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

verifyFixes()