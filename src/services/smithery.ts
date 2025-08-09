/**
 * Smithery MCP Client Service
 * 
 * This service provides secure access to Smithery MCP servers
 * by routing all requests through server-side API endpoints.
 * No API keys are exposed to the client.
 */

/**
 * Search for MCP servers
 */
export async function searchMCPServers(query: string, limit = 10) {
  try {
    const response = await fetch('/api/smithery?action=search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to search servers')
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching MCP servers:', error)
    throw error
  }
}

/**
 * Use a tool from an MCP server
 */
export async function useMCPTool(
  serverName: string,
  toolName: string,
  args: any = {},
  options: { profile?: string } = {}
) {
  try {
    const response = await fetch('/api/smithery?action=use-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serverName,
        toolName,
        args,
        profile: options.profile
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to use tool')
    }

    return await response.json()
  } catch (error) {
    console.error(`Error using MCP tool ${toolName}:`, error)
    throw error
  }
}

/**
 * Example usage for finding images from Unsplash
 */
export async function searchUnsplashImages(query: string, limit = 5) {
  return useMCPTool(
    '@unsplash/mcp',
    'search',
    { query, limit }
  )
}

/**
 * Example usage for fetching web content
 */
export async function fetchWebContent(url: string) {
  return useMCPTool(
    '@smithery-ai/fetch',
    'fetch',
    { url }
  )
}