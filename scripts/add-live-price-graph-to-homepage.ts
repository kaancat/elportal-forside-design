#!/usr/bin/env tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function addLivePriceGraphToHomepage() {
  try {
    console.log('🔍 Fetching current homepage data...')
    
    // Get current homepage
    const homepage = await client.fetch(`
      *[_type == "homePage"][0] {
        _id,
        _rev,
        title,
        contentBlocks[] {
          _type,
          _key,
          title
        }
      }
    `)

    if (!homepage) {
      console.error('❌ Homepage not found!')
      return
    }

    console.log(`📄 Found homepage: "${homepage.title}"`)
    console.log(`📦 Current content blocks: ${homepage.contentBlocks?.length || 0}`)
    
    // Check if livePriceGraph already exists
    const hasLivePriceGraph = homepage.contentBlocks?.some((block: any) => block._type === 'livePriceGraph')
    
    if (hasLivePriceGraph) {
      console.log('✅ LivePriceGraph already exists on homepage!')
      return
    }

    // Find a good location to insert the livePriceGraph
    // Look for pageSection with "Live Elpriser" or "Spotpriser" in title
    const livePricesSectionIndex = homepage.contentBlocks?.findIndex((block: any) => 
      block._type === 'pageSection' && 
      block.title && 
      (block.title.toLowerCase().includes('live elpriser') || 
       block.title.toLowerCase().includes('spotpriser'))
    )

    console.log(`🎯 Found live prices section at index: ${livePricesSectionIndex}`)

    // Create the livePriceGraph block
    const livePriceGraphBlock = {
      _type: 'livePriceGraph',
      _key: `livePriceGraph-${Date.now()}`,
      title: 'Live Elpriser Time for Time',
      description: 'Se de aktuelle elpriser i real-time og planlæg dit elforbrug optimalt.',
      region: 'DK1', // Default to DK1, user can switch
      showToggle: true,
      showCurrentPrice: true,
      showAverage: true,
      chartHeight: 400,
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      colorScheme: 'default'
    }

    // Insert the livePriceGraph block after the live prices section or at the beginning
    const insertIndex = livePricesSectionIndex !== -1 ? livePricesSectionIndex + 1 : 1
    
    const updatedContentBlocks = [...(homepage.contentBlocks || [])]
    updatedContentBlocks.splice(insertIndex, 0, livePriceGraphBlock)

    console.log(`📍 Inserting livePriceGraph at position ${insertIndex}`)
    
    // Update the homepage
    const result = await client
      .patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Successfully added livePriceGraph to homepage!')
    console.log(`📊 New content blocks count: ${updatedContentBlocks.length}`)
    console.log(`🔗 Homepage URL: https://www.dinelportal.dk/`)
    
    // Log the added block details
    console.log('\n📋 Added livePriceGraph block:')
    console.log(`   - Title: ${livePriceGraphBlock.title}`)
    console.log(`   - Region: ${livePriceGraphBlock.region}`)
    console.log(`   - Auto-refresh: ${livePriceGraphBlock.autoRefresh}`)
    console.log(`   - Show toggle: ${livePriceGraphBlock.showToggle}`)

  } catch (error) {
    console.error('❌ Error adding livePriceGraph to homepage:', error)
  }
}

async function main() {
  console.log('🚀 Adding LivePriceGraph to Homepage')
  console.log('=====================================')
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN environment variable is required')
    process.exit(1)
  }

  await addLivePriceGraphToHomepage()
}

// Run the script
main()