import { VercelRequest, VercelResponse } from '@vercel/node'

// Consolidated Smithery API handler to reduce serverless function count
// Combines search and use-tool endpoints

const SMITHERY_API_BASE = 'https://api.smithery.ai/v1'

// Search handler
async function handleSearch(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query } = req.body
  const apiKey = process.env.SMITHERY_API_KEY

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Smithery API key not configured'
    })
  }

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing required field: query'
    })
  }

  try {
    const response = await fetch(`${SMITHERY_API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({ 
        error: 'Smithery search failed',
        details: error 
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error in Smithery search:', error)
    return res.status(500).json({ 
      error: 'Failed to perform search',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Use tool handler
async function handleUseTool(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { server, tool, args } = req.body
  const apiKey = process.env.SMITHERY_API_KEY

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Smithery API key not configured'
    })
  }

  if (!server || !tool) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['server', 'tool']
    })
  }

  try {
    // First, discover the server's tools
    const discoveryResponse = await fetch(`${SMITHERY_API_BASE}/discover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ server })
    })

    if (!discoveryResponse.ok) {
      const error = await discoveryResponse.text()
      return res.status(discoveryResponse.status).json({ 
        error: 'Failed to discover server tools',
        details: error 
      })
    }

    const discovery = await discoveryResponse.json()
    
    // Find the requested tool
    const toolInfo = discovery.tools?.find((t: any) => t.name === tool)
    
    if (!toolInfo) {
      return res.status(404).json({ 
        error: 'Tool not found',
        server,
        tool,
        availableTools: discovery.tools?.map((t: any) => t.name) || []
      })
    }

    // Execute the tool
    const executeResponse = await fetch(new URL(`/execute/${server}/${tool}`, SMITHERY_API_BASE).toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arguments: args || {} })
    })

    if (!executeResponse.ok) {
      const error = await executeResponse.text()
      return res.status(executeResponse.status).json({ 
        error: 'Tool execution failed',
        details: error 
      })
    }

    const result = await executeResponse.json()
    return res.status(200).json(result)
  } catch (error) {
    console.error('Error using Smithery tool:', error)
    return res.status(500).json({ 
      error: 'Failed to use tool',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Main handler that routes to appropriate function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Route based on action parameter
  const { action } = req.query

  switch (action) {
    case 'search':
      return handleSearch(req, res)
    case 'use-tool':
      return handleUseTool(req, res)
    default:
      return res.status(400).json({ 
        error: 'Invalid action',
        validActions: ['search', 'use-tool']
      })
  }
}