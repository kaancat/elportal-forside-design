#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import chalk from 'chalk'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G'

async function verifyCurrentState() {
  console.log(chalk.bold.blue('🔍 Checking current state of energibesparende-tips hero'))
  console.log(chalk.gray(`Page ID: ${PAGE_ID}`))
  console.log('')
  
  try {
    const page = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
      title,
      slug,
      "heroBlock": contentBlocks[0]{
        _type,
        _key,
        headline,
        subheadline,
        image{
          asset->{
            _id,
            url,
            originalFilename,
            metadata{
              dimensions
            }
          }
        },
        alignment,
        variant,
        cta
      }
    }`)
    
    if (!page) {
      console.error(chalk.red('❌ Page not found!'))
      return
    }
    
    console.log(chalk.green('✅ Page found:'))
    console.log(`  Title: ${page.title}`)
    console.log(`  Slug: ${page.slug?.current || 'No slug'}`)
    console.log('')
    
    if (!page.heroBlock) {
      console.error(chalk.red('❌ No hero block found!'))
      return
    }
    
    console.log(chalk.green('✅ Hero block found:'))
    console.log(`  Type: ${page.heroBlock._type}`)
    console.log(`  Headline: "${page.heroBlock.headline}"`)
    console.log(`  Subheadline: "${page.heroBlock.subheadline}"`)
    console.log(`  Alignment: ${page.heroBlock.alignment || 'Not set'}`)
    console.log(`  Variant: ${page.heroBlock.variant || 'Not set'}`)
    console.log('')
    
    if (page.heroBlock.image?.asset) {
      console.log(chalk.yellow('⚠️ Hero already has an image:'))
      console.log(`  Asset ID: ${page.heroBlock.image.asset._id}`)
      console.log(`  URL: ${page.heroBlock.image.asset.url}`)
      console.log(`  Filename: ${page.heroBlock.image.asset.originalFilename}`)
      if (page.heroBlock.image.asset.metadata?.dimensions) {
        const { width, height } = page.heroBlock.image.asset.metadata.dimensions
        console.log(`  Dimensions: ${width}x${height}`)
      }
      console.log('')
      console.log(chalk.yellow('The hero already has an image. The script will replace it.'))
    } else {
      console.log(chalk.blue('ℹ️ No image currently set in hero block'))
      console.log('The script will add a new image.')
    }
    
    console.log('')
    console.log(chalk.bold('Ready to proceed with image addition!'))
    
  } catch (error) {
    console.error(chalk.red('❌ Error checking page state:'), error)
  }
}

verifyCurrentState()