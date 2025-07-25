#!/usr/bin/env tsx
import { useMCPServer } from '../src/lib/smithery/gateway'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
dotenv.config()

// BrowserBase configuration
const BROWSERBASE_PROFILE = 'curved-bonobo-oHOM72'
const BROWSERBASE_SERVER = '@browserbasehq/mcp-browserbase'

async function takeScreenshot() {
  const url = 'https://elportal.dk/elpriser'
  const screenshotPath = path.join(process.cwd(), `elportal-screenshot-${Date.now()}.png`)
  
  console.log(chalk.blue('Starting BrowserBase screenshot test...'))
  console.log(chalk.gray(`URL: ${url}`))
  console.log(chalk.gray(`Profile: ${BROWSERBASE_PROFILE}`))
  
  try {
    // Step 1: Create a browser session
    console.log(chalk.yellow('\n1. Creating browser session...'))
    const sessionResult = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_session_create',
      {},
      { profile: BROWSERBASE_PROFILE }
    )
    console.log(chalk.green('✓ Browser session created'))
    
    // Step 2: Navigate to the URL
    console.log(chalk.yellow('\n2. Navigating to URL...'))
    await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_stagehand_navigate',
      { url },
      { profile: BROWSERBASE_PROFILE }
    )
    console.log(chalk.green('✓ Navigation complete'))
    
    // Step 3: Take a screenshot
    console.log(chalk.yellow('\n3. Taking screenshot...'))
    const screenshotResult = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_screenshot',
      { name: 'elportal-elpriser' },
      { profile: BROWSERBASE_PROFILE }
    )
    
    // Check if we got image data
    if (screenshotResult.content?.[0]?.type === 'image' && screenshotResult.content[0].data) {
      const imageData = screenshotResult.content[0].data
      
      // Decode base64 image and save
      const buffer = Buffer.from(imageData, 'base64')
      await fs.writeFile(screenshotPath, buffer)
      
      console.log(chalk.green(`✓ Screenshot saved to: ${screenshotPath}`))
      
      // Get file size for verification
      const stats = await fs.stat(screenshotPath)
      console.log(chalk.gray(`  File size: ${(stats.size / 1024).toFixed(2)} KB`))
    } else {
      console.error(chalk.red('✗ No image data received from BrowserBase'))
      console.log('Screenshot result:', JSON.stringify(screenshotResult, null, 2))
    }
    
    // Step 4: Close the browser session
    console.log(chalk.yellow('\n4. Closing browser session...'))
    await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_session_close',
      {},
      { profile: BROWSERBASE_PROFILE }
    )
    console.log(chalk.green('✓ Browser session closed'))
    
    console.log(chalk.blue('\n✨ BrowserBase test completed successfully!'))
    
  } catch (error) {
    console.error(chalk.red('\n✗ Error during BrowserBase test:'))
    console.error(error)
    
    // Try to close session even if there was an error
    try {
      console.log(chalk.yellow('\nAttempting to close browser session...'))
      await useMCPServer(
        BROWSERBASE_SERVER,
        'browserbase_session_close',
        {},
        { profile: BROWSERBASE_PROFILE }
      )
      console.log(chalk.green('✓ Browser session closed'))
    } catch (closeError) {
      console.error(chalk.red('Failed to close browser session:'), closeError)
    }
    
    process.exit(1)
  }
}

// Run the test
takeScreenshot().catch(console.error)