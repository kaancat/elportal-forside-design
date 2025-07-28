#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import { useMCPServer } from '../src/lib/smithery/gateway'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
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

interface UnsplashImage {
  id: string
  alt_description?: string
  description?: string
  width: number
  height: number
  urls: {
    regular: string
    full: string
    small: string
  }
  user: {
    name: string
  }
}

async function findBestEnergyImage(): Promise<UnsplashImage> {
  const searchQueries = [
    'smart home energy efficient LED light bulbs modern house',
    'energy saving tips home efficiency solar panels',
    'modern home energy efficiency sustainable living',
    'LED bulbs energy saving electricity bills home',
    'energy efficient home appliances smart technology'
  ]
  
  console.log(chalk.blue('🔍 Searching for the perfect energy saving image...'))
  
  for (let i = 0; i < searchQueries.length; i++) {
    const query = searchQueries[i]
    console.log(chalk.gray(`\n${i + 1}/${searchQueries.length}: "${query}"`))
    
    try {
      const result = await useMCPServer('@unsplash/mcp', 'search', {
        query: query,
        per_page: 8,
        orientation: 'landscape'
      })
      
      if (!result?.content?.[0]?.text) {
        console.log(chalk.yellow('  ⚠️ No content in response'))
        continue
      }
      
      let parsedData: any
      try {
        parsedData = JSON.parse(result.content[0].text)
      } catch (parseError) {
        console.log(chalk.yellow('  ⚠️ Failed to parse response'))
        continue
      }
      
      const images = parsedData.results || []
      
      if (images.length === 0) {
        console.log(chalk.yellow('  ⚠️ No images found'))
        continue
      }
      
      console.log(chalk.green(`  ✅ Found ${images.length} images`))
      
      // Filter for high-quality, landscape images that fit our content
      const suitableImages = images.filter((img: UnsplashImage) => {
        return (
          img.width >= 1200 && // Minimum width for quality
          img.height >= 600 && // Minimum height
          img.width / img.height >= 1.5 && // Landscape aspect ratio
          img.urls?.regular // Has the URL we need
        )
      })
      
      if (suitableImages.length > 0) {
        const selectedImage = suitableImages[0]
        console.log(chalk.green(`  🎯 Selected perfect image: ${selectedImage.id}`))
        console.log(chalk.gray(`     Description: ${selectedImage.alt_description || selectedImage.description || 'No description'}`))
        console.log(chalk.gray(`     Dimensions: ${selectedImage.width}x${selectedImage.height}`))
        console.log(chalk.gray(`     Photographer: ${selectedImage.user.name}`))
        return selectedImage
      }
      
      console.log(chalk.yellow(`  ⚠️ Found images but none meet quality criteria`))
      
    } catch (error) {
      console.log(chalk.red(`  ❌ Search failed: ${error}`))
    }
  }
  
  throw new Error('Could not find any suitable energy saving images')
}

async function downloadAndUploadToSanity(image: UnsplashImage): Promise<string> {
  console.log(chalk.blue('\n📥 Downloading and uploading image...'))
  
  try {
    // Download from Unsplash
    console.log(chalk.gray('  Downloading from Unsplash...'))
    const response = await fetch(image.urls.regular)
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }
    
    const buffer = await response.buffer()
    const filename = `energibesparende-tips-hero-${image.id}.jpg`
    
    console.log(chalk.gray('  Uploading to Sanity...'))
    
    // Upload to Sanity with metadata
    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType: 'image/jpeg',
      description: image.alt_description || image.description || 'Energy saving tips hero image',
      creditLine: `Photo by ${image.user.name} on Unsplash`,
      source: {
        name: 'unsplash',
        url: `https://unsplash.com/photos/${image.id}`,
        id: image.id
      }
    })
    
    console.log(chalk.green(`  ✅ Successfully uploaded as asset: ${asset._id}`))
    return asset._id
    
  } catch (error) {
    console.error(chalk.red('  ❌ Upload failed:'), error)
    throw error
  }
}

async function addImageToHero(assetId: string): Promise<void> {
  console.log(chalk.blue('\n🖼️ Adding image to hero section...'))
  
  try {
    // First, verify the page exists and get current structure
    console.log(chalk.gray('  Fetching current page data...'))
    const page = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
      title,
      slug,
      contentBlocks
    }`)
    
    if (!page) {
      throw new Error('Page not found!')
    }
    
    console.log(chalk.gray(`  Page found: "${page.title}"`))
    
    const contentBlocks = [...(page.contentBlocks || [])]
    
    if (contentBlocks.length === 0) {
      throw new Error('No content blocks found on page')
    }
    
    if (contentBlocks[0]._type !== 'hero') {
      throw new Error(`First content block is not a hero (found: ${contentBlocks[0]._type})`)
    }
    
    console.log(chalk.gray('  Current hero headline:'), contentBlocks[0].headline)
    
    // Update the hero block with the image
    contentBlocks[0] = {
      ...contentBlocks[0],
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: assetId
        }
      }
    }
    
    console.log(chalk.gray('  Updating page in Sanity...'))
    
    await client
      .patch(PAGE_ID)
      .set({ contentBlocks })
      .commit()
    
    console.log(chalk.green('  ✅ Hero section updated successfully!'))
    
    // Verify the update worked
    console.log(chalk.gray('  Verifying update...'))
    const updatedPage = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
      "heroImage": contentBlocks[0].image.asset._ref
    }`)
    
    if (updatedPage?.heroImage === assetId) {
      console.log(chalk.green('  ✅ Verification successful!'))
    } else {
      throw new Error('Verification failed - image not found in updated page')
    }
    
  } catch (error) {
    console.error(chalk.red('  ❌ Failed to update hero:'), error)
    throw error
  }
}

async function main() {
  console.log(chalk.bold.blue('🚀 ElPortal Hero Image Addition Process'))
  console.log(chalk.gray('Target: energibesparende-tips page hero section'))
  console.log(chalk.gray(`Page ID: ${PAGE_ID}`))
  console.log('')
  
  try {
    // Step 1: Search and select the best image
    const selectedImage = await findBestEnergyImage()
    
    // Step 2: Download and upload to Sanity
    const assetId = await downloadAndUploadToSanity(selectedImage)
    
    // Step 3: Add image to hero section
    await addImageToHero(assetId)
    
    // Success!
    console.log('')
    console.log(chalk.bold.green('🎉 SUCCESS! The hero image has been added.'))
    console.log('')
    console.log(chalk.bold('Next steps:'))
    console.log(`• View in Sanity Studio: ${chalk.cyan('https://dinelportal.sanity.studio/structure/page;' + PAGE_ID)}`)
    console.log(`• Preview the page on the live site`)
    console.log(`• Verify the image displays correctly on mobile and desktop`)
    console.log('')
    console.log(chalk.bold('Image details:'))
    console.log(`• ID: ${selectedImage.id}`)
    console.log(`• Description: ${selectedImage.alt_description || selectedImage.description || 'No description'}`)
    console.log(`• Photographer: ${selectedImage.user.name}`)
    console.log(`• Sanity Asset ID: ${assetId}`)
    
  } catch (error) {
    console.log('')
    console.error(chalk.bold.red('❌ PROCESS FAILED'))
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
    console.log('')
    console.log(chalk.yellow('Troubleshooting:'))
    console.log('• Check your internet connection')
    console.log('• Verify VITE_SMITHERY_API_KEY is set in .env')
    console.log('• Verify SANITY_API_TOKEN is set in .env')
    console.log('• Check if the page ID exists in Sanity')
    
    process.exit(1)
  }
}

// Run the process
main()