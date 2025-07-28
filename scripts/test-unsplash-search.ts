#!/usr/bin/env node
import { useMCPServer } from '../src/lib/smithery/gateway.js'
import * as dotenv from 'dotenv'

dotenv.config()

async function testUnsplashSearch() {
  console.log('🔍 Testing Unsplash search for energy saving images...')
  
  try {
    // Search for energy-saving related images
    const result = await useMCPServer('@unsplash/mcp', 'search', {
      query: 'energy saving LED bulbs smart home',
      per_page: 3,
      orientation: 'landscape'
    })
    
    console.log('Search result type:', typeof result)
    console.log('Search result keys:', Object.keys(result || {}))
    console.log('Full result:', JSON.stringify(result, null, 2))
    
    if (result && result.content && result.content[0]) {
      const content = result.content[0]
      console.log('\nFirst content item:')
      console.log('Type:', content.type)
      
      if (content.type === 'text' && content.text) {
        try {
          const parsed = JSON.parse(content.text)
          console.log('\nParsed results:')
          console.log('Total results:', parsed.total)
          console.log('Number of photos:', parsed.results?.length || 0)
          
          if (parsed.results && parsed.results.length > 0) {
            const firstImage = parsed.results[0]
            console.log('\nFirst image details:')
            console.log('ID:', firstImage.id)
            console.log('Description:', firstImage.alt_description || firstImage.description)
            console.log('Width x Height:', firstImage.width, 'x', firstImage.height)
            console.log('Regular URL:', firstImage.urls?.regular)
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError)
        }
      }
    }
    
  } catch (error) {
    console.error('Error searching for images:', error)
  }
}

testUnsplashSearch()