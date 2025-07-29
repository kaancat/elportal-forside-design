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

async function analyzePageSectionContent() {
  try {
    console.log(chalk.blue('🔍 Analyzing pageSection content issues...\n'))
    
    // Fetch the problematic page
    const pageId = 'f7ecf92783e749828f7281a6e5829d52' // The elprisberegner page
    
    const query = `*[_id == $pageId][0]{
      _id,
      title,
      contentBlocks[_type == "pageSection"]{
        _key,
        _type,
        title,
        content
      }
    }`
    
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.log(chalk.red('❌ Page not found'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}\n`))
    
    // Check each pageSection
    const pageSections = page.contentBlocks || []
    
    console.log(chalk.blue(`Found ${pageSections.length} pageSection blocks:\n`))
    
    pageSections.forEach((section, index) => {
      console.log(chalk.yellow(`${index + 1}. PageSection: "${section.title || 'Untitled'}"`))
      console.log(chalk.gray(`   Key: ${section._key}`))
      
      if (section.content && Array.isArray(section.content)) {
        console.log(chalk.blue(`   Content array has ${section.content.length} items:`))
        
        section.content.forEach((item, itemIndex) => {
          const itemType = item._type
          console.log(chalk.cyan(`     ${itemIndex + 1}. Type: "${itemType}"`))
          
          // Check if this is an allowed type
          const allowedTypes = ['block', 'image', 'livePriceGraph', 'renewableEnergyForecast', 
                               'monthlyProductionChart', 'priceCalculator', 'realPriceComparisonTable', 
                               'videoSection']
          
          if (!allowedTypes.includes(itemType)) {
            console.log(chalk.red(`        ❌ INVALID TYPE! "${itemType}" is not allowed in pageSection content`))
            console.log(chalk.red(`        Allowed types: ${allowedTypes.join(', ')}`))
            
            // Show more details about the invalid item
            console.log(chalk.gray(`        Full item:`))
            console.log(JSON.stringify(item, null, 4).split('\n').map(line => `        ${line}`).join('\n'))
          } else {
            console.log(chalk.green(`        ✅ Valid type`))
            
            // If it's a block type, show some text content
            if (itemType === 'block' && item.children && item.children[0]) {
              const text = item.children[0].text || ''
              const preview = text.length > 50 ? text.substring(0, 50) + '...' : text
              console.log(chalk.gray(`        Text: "${preview}"`))
            }
          }
        })
      } else {
        console.log(chalk.gray('   No content array'))
      }
      
      console.log('')
    })
    
    // Now check a working page for comparison
    console.log(chalk.blue('\n📊 Checking a working page for comparison...\n'))
    
    const workingQuery = `*[_type == "page" && slug.current != "elprisberegner"][0]{
      _id,
      title,
      "slug": slug.current,
      contentBlocks[_type == "pageSection"]{
        _key,
        _type,
        title,
        content[]{
          _type,
          _key,
          _type == "block" => {
            "text": children[0].text
          }
        }
      }
    }`
    
    const workingPage = await client.fetch(workingQuery)
    
    if (workingPage && workingPage.contentBlocks) {
      console.log(chalk.green(`\nExample from working page: ${workingPage.title} (/${workingPage.slug})`))
      
      const workingPageSections = workingPage.contentBlocks.filter(b => b._type === 'pageSection')
      
      if (workingPageSections.length > 0) {
        const firstSection = workingPageSections[0]
        console.log(chalk.blue(`\nFirst pageSection content structure:`))
        console.log(chalk.gray(`Title: ${firstSection.title}`))
        
        if (firstSection.content) {
          firstSection.content.forEach((item, index) => {
            console.log(chalk.cyan(`  ${index + 1}. Type: ${item._type}`))
            if (item.text) {
              console.log(chalk.gray(`     Text: "${item.text.substring(0, 50)}..."`))
            }
          })
        }
      }
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

analyzePageSectionContent()