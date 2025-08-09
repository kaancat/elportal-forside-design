import { VercelRequest, VercelResponse } from '@vercel/node'
import { SmitheryRegistry } from '@smithery/registry'

// Server-side only - no VITE_ prefix
const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate API key exists (server-side only)
  if (!SMITHERY_API_KEY) {
    console.error('SMITHERY_API_KEY not configured in environment')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const { query, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    // Initialize registry with server-side API key
    const registry = new SmitheryRegistry({
      bearerAuth: SMITHERY_API_KEY
    })

    // Search for servers
    const result = await registry.servers.list({ q: query })
    const servers = []
    
    for await (const page of result) {
      if (page.result?.servers) {
        servers.push(...page.result.servers)
        if (servers.length >= limit) break
      }
    }
    
    // Return results (no sensitive data)
    return res.status(200).json({
      servers: servers.slice(0, limit),
      count: servers.length
    })
  } catch (error) {
    console.error('Smithery search error:', error)
    return res.status(500).json({ 
      error: 'Failed to search MCP servers',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}