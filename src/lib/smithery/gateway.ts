import { SmitheryRegistry } from '@smithery/registry'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

// Get API key from environment
const getApiKey = () => {
  const apiKey = process.env.VITE_SMITHERY_API_KEY || ''
  if (!apiKey) {
    throw new Error('VITE_SMITHERY_API_KEY not found in environment variables')
  }
  return apiKey
}

// Initialize Smithery Registry for discovering servers
const createRegistry = () => new SmitheryRegistry({
  bearerAuth: getApiKey()
})

// Simple auth provider for connecting to MCP servers
class SmitheryAuthProvider {
  constructor(private apiKey: string) {}

  async getAuthHeaders(): Promise<{ [key: string]: string }> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
    }
  }

  // OAuth methods required by SDK but not used for API key auth
  clientInformation() {
    return undefined
  }

  saveClientInformation() {
    return Promise.resolve()
  }

  tokens() {
    return undefined
  }

  saveTokens() {
    return Promise.resolve()
  }

  redirectToAuthorization() {
    return Promise.reject(new Error('OAuth not supported'))
  }

  saveCodeVerifier() {
    return Promise.resolve()
  }

  codeVerifier() {
    return Promise.reject(new Error('OAuth not supported'))
  }
}

// Search for MCP servers
export async function searchServers(query: string, limit = 10) {
  try {
    const registry = createRegistry()
    const result = await registry.servers.list({ q: query })
    const servers = []
    
    for await (const page of result) {
      if (page.result?.servers) {
        servers.push(...page.result.servers)
        if (servers.length >= limit) break
      }
    }
    
    return servers.slice(0, limit)
  } catch (error) {
    console.error('Error searching MCP servers:', error)
    throw error
  }
}

// Get detailed information about a specific server
export async function getServerInfo(qualifiedName: string) {
  try {
    const registry = createRegistry()
    const result = await registry.servers.get({ qualifiedName })
    return result.result
  } catch (error) {
    console.error(`Error getting server info for ${qualifiedName}:`, error)
    throw error
  }
}

// Connect to an MCP server and use its tools
export async function useMCPServer(
  serverName: string,
  toolName: string,
  args: any = {},
  options: { profile?: string } = {}
) {
  const apiKey = getApiKey()
  
  // Build server URL - support both regular and profile-based URLs
  let serverUrl = `https://server.smithery.ai/${serverName}/mcp`
  if (options.profile) {
    // For profile-based servers, append profile parameter
    serverUrl += `?api_key=${apiKey}&profile=${options.profile}`
  }
  
  console.log('Connecting to:', serverUrl)
  
  try {
    // Create client and connect
    // For profile-based URLs, auth is in the URL so we don't need auth headers
    const authProvider = options.profile ? undefined : new SmitheryAuthProvider(apiKey)
    const transport = new StreamableHTTPClientTransport(serverUrl, { authProvider })
    const client = new Client({ 
      name: 'elportal-dev',
      version: '1.0.0'
    })
    
    await client.connect(transport)
    
    // List available tools (for debugging)
    const tools = await client.listTools()
    const tool = tools.tools.find(t => t.name === toolName)
    
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found on server '${serverName}'`)
    }
    
    // Call the tool
    const result = await client.callTool(toolName, args)
    
    // Clean up
    await client.close()
    
    return result
  } catch (error) {
    console.error(`Error using MCP server ${serverName}:`, error)
    throw error
  }
}

// List all tools available on a server
export async function listServerTools(serverName: string, options: { profile?: string } = {}) {
  const apiKey = getApiKey()
  
  // Build server URL - support both regular and profile-based URLs
  let serverUrl = `https://server.smithery.ai/${serverName}/mcp`
  if (options.profile) {
    serverUrl += `?api_key=${apiKey}&profile=${options.profile}`
  }
  
  try {
    // For profile-based URLs, auth is in the URL so we don't need auth headers
    const authProvider = options.profile ? undefined : new SmitheryAuthProvider(apiKey)
    const transport = new StreamableHTTPClientTransport(serverUrl, { authProvider })
    const client = new Client({ 
      name: 'elportal-dev',
      version: '1.0.0'
    })
    
    await client.connect(transport)
    const tools = await client.listTools()
    await client.close()
    
    return tools.tools
  } catch (error) {
    console.error(`Error listing tools for ${serverName}:`, error)
    throw error
  }
}