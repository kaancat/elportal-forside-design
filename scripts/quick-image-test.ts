#!/usr/bin/env node

// Quick test to see if we can access Unsplash via MCP
import { useMCPServer } from '../src/lib/smithery/gateway.js'
import * as dotenv from 'dotenv'

dotenv.config()

async function quickTest() {
  try {
    console.log('🧪 Quick test of Unsplash MCP server...')
    
    const result = await useMCPServer('@unsplash/mcp', 'search', {
      query: 'energy saving',
      per_page: 1
    })
    
    console.log('✅ MCP server is working!')
    console.log('Response type:', typeof result)
    console.log('Response structure:', JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('❌ MCP server test failed:', error)
  }
}

quickTest()