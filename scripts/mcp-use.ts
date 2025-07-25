#!/usr/bin/env node
import { useMCPServer, listServerTools, getServerInfo } from '../src/lib/smithery/gateway.js'
import { program } from 'commander'
import chalk from 'chalk'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

program
  .name('mcp-use')
  .description('Use an MCP server tool from the Smithery registry')
  .argument('<server>', 'server qualified name (e.g., @smithery-ai/fetch)')
  .argument('[tool]', 'tool name to use')
  .option('-a, --args <json>', 'tool arguments as JSON', '{}')
  .option('-l, --list', 'list available tools', false)
  .option('-i, --info', 'show server info', false)
  .option('-p, --profile <profile>', 'Smithery profile ID for authenticated servers')
  .action(async (server, tool, options) => {
    try {
      // Show server info
      if (options.info) {
        console.log(chalk.blue(`ℹ️  Server info for ${server}\n`))
        const info = await getServerInfo(server)
        
        if (info) {
          console.log(chalk.bold(info.displayName || server))
          console.log(info.description || 'No description')
          console.log(chalk.gray(`\nRemote: ${info.remote ? 'Yes' : 'No'}`))
          console.log(chalk.gray(`Security: ${info.security?.scanPassed ? '✓ Passed' : '✗ Failed'}`))
          
          if (info.tools && info.tools.length > 0) {
            console.log(chalk.yellow(`\nAvailable tools: ${info.tools.length}`))
          }
        }
        return
      }
      
      // List tools
      if (options.list || !tool) {
        console.log(chalk.blue(`🔧 Tools available on ${server}\n`))
        const tools = await listServerTools(server, { profile: options.profile })
        
        if (tools.length === 0) {
          console.log(chalk.yellow('No tools found'))
          return
        }
        
        for (const t of tools) {
          console.log(chalk.bold(t.name))
          if (t.description) {
            console.log(`  ${t.description}`)
          }
          if (t.inputSchema?.properties) {
            const props = Object.keys(t.inputSchema.properties).join(', ')
            console.log(chalk.gray(`  Parameters: ${props}`))
          }
          console.log()
        }
        
        if (!tool) {
          console.log(chalk.gray('Tip: Run with tool name to use a specific tool'))
        }
        return
      }
      
      // Use the tool
      console.log(chalk.blue(`🚀 Using ${server}/${tool}\n`))
      
      let args = {}
      try {
        args = JSON.parse(options.args)
      } catch (error) {
        console.error(chalk.red('Invalid JSON in --args'))
        process.exit(1)
      }
      
      console.log(chalk.gray('Arguments:'), args)
      console.log()
      
      const result = await useMCPServer(server, tool, args, { profile: options.profile })
      
      console.log(chalk.green('✅ Result:\n'))
      
      // Format the result based on its structure
      if (result && typeof result === 'object') {
        if (result.content && Array.isArray(result.content)) {
          // MCP standard response format
          for (const item of result.content) {
            if (item.type === 'text') {
              console.log(item.text)
            } else if (item.type === 'image') {
              console.log(chalk.cyan(`[Image: ${item.data || item.url}]`))
            } else {
              console.log(JSON.stringify(item, null, 2))
            }
          }
        } else {
          // Other response formats
          console.log(JSON.stringify(result, null, 2))
        }
      } else {
        console.log(result)
      }
      
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// Examples in help
program.addHelpText('after', `
Examples:
  # List tools on a server
  $ mcp-use @smithery-ai/fetch --list
  
  # Get server info
  $ mcp-use @smithery-ai/fetch --info
  
  # Use a tool
  $ mcp-use @smithery-ai/fetch fetch_url --args '{"url":"https://example.com"}'
  
  # Search Unsplash for images
  $ mcp-use @unsplash/mcp search --args '{"query":"wind turbines"}'
`)

program.parse()