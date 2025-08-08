import { VercelRequest, VercelResponse } from '@vercel/node'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

// Server-side only - no VITE_ prefix
const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY

// Simple auth provider for MCP connections
class SmitheryAuthProvider {
  constructor(private apiKey: string) {}

  async getAuthHeaders(): Promise<{ [key: string]: string }> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
    }
  }

  // OAuth methods required by SDK but not used for API key auth
  clientInformation() {
    return {
      redirect_uris: ['http://localhost:3000/callback'],
      client_name: 'elportal-server',
      scope: 'read'
    }
  }

  saveClientInformation() { return Promise.resolve() }
  
  tokens() {
    return {
      access_token: this.apiKey,
      token_type: 'Bearer',
      scope: 'read'
    }
  }
  
  saveTokens() { return Promise.resolve() }
  redirectToAuthorization() { return Promise.reject(new Error('OAuth not supported')) }
  saveCodeVerifier() { return Promise.resolve() }
  codeVerifier() { return Promise.reject(new Error('OAuth not supported')) }
}

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
    const { serverName, toolName, args = {}, profile } = req.body

    if (!serverName || !toolName) {
      return res.status(400).json({ 
        error: 'serverName and toolName are required' 
      })
    }

    // Build server URL
    let serverUrl = `https://server.smithery.ai/${serverName}/mcp`
    if (profile) {
      serverUrl += `?api_key=${SMITHERY_API_KEY}&profile=${profile}`
    }
    
    // Create client and connect
    const authProvider = profile ? undefined : new SmitheryAuthProvider(SMITHERY_API_KEY)
    const transport = new StreamableHTTPClientTransport(serverUrl, { authProvider })
    const client = new Client({ 
      name: 'elportal-server',
      version: '1.0.0'
    })
    
    await client.connect(transport)
    
    // List available tools to verify
    const tools = await client.listTools()
    const tool = tools.tools.find(t => t.name === toolName)
    
    if (!tool) {
      await client.close()
      return res.status(404).json({ 
        error: `Tool '${toolName}' not found on server '${serverName}'`,
        availableTools: tools.tools.map(t => t.name)
      })
    }
    
    // Call the tool
    const result = await client.callTool(toolName, args)
    
    // Clean up
    await client.close()
    
    // Return result (no sensitive data)
    return res.status(200).json({
      success: true,
      result: result,
      tool: toolName,
      server: serverName
    })
  } catch (error) {
    console.error('Smithery tool error:', error)
    return res.status(500).json({ 
      error: 'Failed to use MCP tool',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}