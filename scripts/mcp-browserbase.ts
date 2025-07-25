#!/usr/bin/env tsx
import { useMCPServer, listServerTools } from '../src/lib/smithery/gateway'
import { program } from 'commander'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
dotenv.config()

// BrowserBase profile from your Smithery account
const BROWSERBASE_PROFILE = 'curved-bonobo-oHOM72'
const BROWSERBASE_SERVER = '@browserbasehq/mcp-browserbase'

async function screenshot(url: string, outputPath?: string) {
  console.log(chalk.blue(`Taking screenshot...`))
  
  try {
    const result = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_screenshot',
      { name: outputPath || `screenshot-${Date.now()}` },
      { profile: BROWSERBASE_PROFILE }
    )
    
    if (result.content?.[0]?.type === 'image' && result.content[0].data) {
      const imageData = result.content[0].data
      const filename = outputPath || `screenshot-${Date.now()}.png`
      
      // Decode base64 image
      const buffer = Buffer.from(imageData, 'base64')
      await fs.writeFile(filename, buffer)
      
      console.log(chalk.green(`✓ Screenshot saved to: ${filename}`))
      return filename
    } else {
      console.error(chalk.red('No image data received'))
    }
  } catch (error) {
    console.error(chalk.red('Screenshot failed:'), error)
  }
}

async function extractContent(url: string) {
  console.log(chalk.blue(`Extracting content from ${url}...`))
  
  try {
    const result = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_navigate',
      { url },
      { profile: BROWSERBASE_PROFILE }
    )
    
    console.log(chalk.green('✓ Content extracted'))
    return result
  } catch (error) {
    console.error(chalk.red('Content extraction failed:'), error)
  }
}

async function analyzeSEO(url: string) {
  console.log(chalk.blue(`Performing SEO analysis of ${url}...`))
  
  try {
    // Create a browser session first
    const sessionResult = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_session_create',
      {},
      { profile: BROWSERBASE_PROFILE }
    )
    
    console.log(chalk.gray('Browser session created'))
    
    // Navigate to the page
    await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_stagehand_navigate',
      { url },
      { profile: BROWSERBASE_PROFILE }
    )
    
    // Extract SEO-relevant data
    const seoData = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_stagehand_extract',
      { 
        instruction: `Extract the following SEO information from the page:
        - Page title
        - Meta description content
        - Meta keywords content
        - All H1 headings
        - All H2 headings
        - Total number of images and how many have alt text
        - Total number of internal and external links
        Please return this data in a structured format.`
      },
      { profile: BROWSERBASE_PROFILE }
    )
    
    console.log(chalk.green('\n✓ SEO Analysis Complete:\n'))
    
    // Display the extracted data
    if (seoData.content && seoData.content[0]) {
      console.log(seoData.content[0].text || 'No data extracted')
    }
    
    // Take a screenshot for visual reference
    const screenshotPath = `seo-analysis-${Date.now()}.png`
    await screenshot(url, screenshotPath)
    
    // Close the browser session
    await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_session_close',
      {},
      { profile: BROWSERBASE_PROFILE }
    )
    
    console.log(chalk.gray('Browser session closed'))
  } catch (error) {
    console.error(chalk.red('SEO analysis failed:'), error)
  }
}

async function listTools() {
  console.log(chalk.blue('Fetching BrowserBase tools...'))
  
  try {
    const tools = await listServerTools(BROWSERBASE_SERVER, { profile: BROWSERBASE_PROFILE })
    
    console.log(chalk.green(`\n✓ Found ${tools.length} tools:\n`))
    
    tools.forEach(tool => {
      console.log(chalk.cyan(`${tool.name}`))
      console.log(`  ${tool.description}`)
      if (tool.inputSchema?.properties) {
        console.log(chalk.gray('  Parameters:'))
        Object.entries(tool.inputSchema.properties).forEach(([key, schema]: [string, any]) => {
          const required = tool.inputSchema.required?.includes(key) ? '(required)' : '(optional)'
          console.log(chalk.gray(`    - ${key} ${required}: ${schema.description || schema.type}`))
        })
      }
      console.log()
    })
  } catch (error) {
    console.error(chalk.red('Failed to list tools:'), error)
  }
}

// CLI setup
program
  .name('mcp-browserbase')
  .description('BrowserBase MCP tools for browser automation')
  .version('1.0.0')

program
  .command('screenshot <url>')
  .description('Take a screenshot of a webpage')
  .option('-o, --output <path>', 'output file path')
  .action(async (url, options) => {
    await screenshot(url, options.output)
  })

program
  .command('analyze <url>')
  .description('Perform SEO analysis on a webpage')
  .action(async (url) => {
    await analyzeSEO(url)
  })

program
  .command('extract <url>')
  .description('Extract content from a webpage')
  .action(async (url) => {
    const result = await extractContent(url)
    console.log(JSON.stringify(result, null, 2))
  })

program
  .command('tools')
  .description('List available BrowserBase tools')
  .action(async () => {
    await listTools()
  })

// Parse command line arguments
program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}