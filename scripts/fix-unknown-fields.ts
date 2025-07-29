import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'
import * as readline from 'readline'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Icon mapping for common icon names to icon.manager format
const iconMapping = {
  'calculator': 'streamline-regular:calculator-1',
  'wind': 'streamline-regular:wind-turbine-wind-power',
  'chart': 'streamline-regular:graph-chart-increase',
  'money': 'streamline-regular:money-cash-bag-dollar',
  'check': 'streamline-regular:check-circle-1',
  'lightning': 'streamline-regular:flash-lightning',
  'home': 'streamline-regular:house-1',
  'clock': 'streamline-regular:clock-circle-1'
}

function createIconManagerObject(iconName: string) {
  const mappedIcon = iconMapping[iconName] || `streamline-regular:${iconName}`
  
  return {
    _type: 'icon.manager',
    icon: mappedIcon,
    metadata: {
      iconName: mappedIcon.split(':')[1],
      collectionId: 'streamline-regular',
      collectionName: 'Streamline Regular',
      size: { width: 20, height: 20 }
    }
  }
}

async function fixUnknownFields() {
  try {
    console.log(chalk.blue('🔧 Starting to fix unknown fields...\n'))
    
    // Fetch the page
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    const query = `*[_id == $pageId][0]`
    const page = await client.fetch(query, { pageId })
    
    if (!page) {
      console.error(chalk.red('❌ Page not found!'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title}`))
    console.log(chalk.gray(`   Slug: ${page.slug?.current}\n`))
    
    // Keep track of patches to apply
    const patches = []
    
    // Process content blocks
    if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
      const updatedBlocks = [...page.contentBlocks]
      let hasChanges = false
      
      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i]
        console.log(chalk.yellow(`\nProcessing block ${i + 1}: ${block._type}`))
        
        // Fix pageSection blocks
        if (block._type === 'pageSection') {
          // Remove duplicate heading field (keep title)
          if (block.heading && block.title) {
            console.log(chalk.blue('  - Removing duplicate "heading" field'))
            delete block.heading
            hasChanges = true
          }
          
          // Add missing theme and settings fields with defaults
          if (!block.theme) {
            console.log(chalk.blue('  - Adding default theme reference'))
            // Note: You may need to update this with an actual theme reference ID
            block.theme = null // Or reference to a default theme
            hasChanges = true
          }
          
          if (!block.settings) {
            console.log(chalk.blue('  - Adding default settings'))
            block.settings = {
              _type: 'sectionSettings',
              padding: 'normal',
              maxWidth: 'container'
            }
            hasChanges = true
          }
        }
        
        // Fix hero blocks
        if (block._type === 'hero') {
          // Map title to headline
          if (block.title && !block.headline) {
            console.log(chalk.blue('  - Mapping "title" to "headline"'))
            block.headline = block.title
            delete block.title
            hasChanges = true
          }
          
          // Map subtitle to subheadline
          if (block.subtitle && !block.subheadline) {
            console.log(chalk.blue('  - Mapping "subtitle" to "subheadline"'))
            block.subheadline = block.subtitle
            delete block.subtitle
            hasChanges = true
          }
        }
        
        // Fix valueProposition blocks
        if (block._type === 'valueProposition' && block.items) {
          for (let j = 0; j < block.items.length; j++) {
            const item = block.items[j]
            
            // Map title to heading for value items
            if (item.title && !item.heading) {
              console.log(chalk.blue(`  - Item ${j}: Mapping "title" to "heading"`))
              item.heading = item.title
              delete item.title
              hasChanges = true
            }
            
            // Convert string icons to icon.manager objects
            if (item.icon && typeof item.icon === 'string') {
              console.log(chalk.blue(`  - Item ${j}: Converting icon string to icon.manager object`))
              item.icon = createIconManagerObject(item.icon)
              hasChanges = true
            }
          }
        }
        
        // Fix featureList blocks
        if (block._type === 'featureList' && block.features) {
          for (let j = 0; j < block.features.length; j++) {
            const feature = block.features[j]
            
            // Convert string icons to icon.manager objects
            if (feature.icon && typeof feature.icon === 'string') {
              console.log(chalk.blue(`  - Feature ${j}: Converting icon string to icon.manager object`))
              feature.icon = createIconManagerObject(feature.icon)
              hasChanges = true
            }
          }
        }
        
        // Fix rich text fields that are strings
        if (block.content && typeof block.content === 'string') {
          console.log(chalk.blue('  - Converting string content to Portable Text'))
          block.content = [{
            _type: 'block',
            _key: `block-${Date.now()}`,
            children: [{
              _type: 'span',
              _key: `span-${Date.now()}`,
              text: block.content,
              marks: []
            }],
            markDefs: [],
            style: 'normal'
          }]
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        console.log(chalk.blue('\n\n🚀 Applying fixes to Sanity...\n'))
        
        // Create a patch transaction
        const transaction = client
          .patch(page._id)
          .set({ contentBlocks: updatedBlocks })
        
        // Execute the patch
        const result = await transaction.commit()
        
        console.log(chalk.green('✅ Successfully updated the page!'))
        console.log(chalk.gray(`   Updated document ID: ${result._id}`))
        console.log(chalk.gray(`   Revision: ${result._rev}`))
        
      } else {
        console.log(chalk.yellow('\n⚠️  No changes needed - all fields appear to be correct'))
      }
      
    } else {
      console.log(chalk.red('❌ No content blocks found in the page!'))
    }
    
    console.log(chalk.blue('\n\n📋 Next steps:'))
    console.log('1. Check the page in Sanity Studio to verify fields are recognized')
    console.log('2. Test the frontend to ensure content displays correctly')
    console.log('3. Update GROQ queries if needed to fetch new fields')
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

// Add confirmation prompt
async function main() {
  console.log(chalk.yellow('⚠️  This script will modify content in Sanity production dataset'))
  console.log(chalk.yellow('Make sure you have a backup before proceeding!\n'))
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('Do you want to continue? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      rl.close()
      fixUnknownFields()
    } else {
      console.log(chalk.blue('Script cancelled.'))
      rl.close()
    }
  })
}

main()