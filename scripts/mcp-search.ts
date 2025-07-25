#!/usr/bin/env node
import { searchServers, getServerInfo } from '../src/lib/smithery/gateway.js'
import { program } from 'commander'
import chalk from 'chalk'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

program
  .name('mcp-search')
  .description('Search for MCP servers in the Smithery registry')
  .argument('<query>', 'search query')
  .option('-l, --limit <number>', 'limit results', '10')
  .option('-d, --details', 'show detailed information', false)
  .action(async (query, options) => {
    try {
      console.log(chalk.blue(`🔍 Searching for: ${query}\n`))
      
      const servers = await searchServers(query, parseInt(options.limit))
      
      if (servers.length === 0) {
        console.log(chalk.yellow('No servers found'))
        return
      }
      
      console.log(chalk.green(`Found ${servers.length} servers:\n`))
      
      for (const [index, server] of servers.entries()) {
        console.log(chalk.bold(`${index + 1}. ${server.displayName || server.qualifiedName}`))
        console.log(chalk.gray(`   ID: ${server.qualifiedName}`))
        console.log(`   ${server.description || 'No description'}`)
        
        if (server.useCount) {
          console.log(chalk.cyan(`   Uses: ${server.useCount.toLocaleString()}`))
        }
        
        if (options.details && server.qualifiedName) {
          try {
            const details = await getServerInfo(server.qualifiedName)
            if (details?.tools && details.tools.length > 0) {
              console.log(chalk.yellow(`   Tools: ${details.tools.map(t => t.name).join(', ')}`))
            }
          } catch (error) {
            // Ignore errors for individual server details
          }
        }
        
        console.log()
      }
      
      console.log(chalk.gray('\nTip: Use mcp-use <server-id> <tool> to use a server'))
      
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()