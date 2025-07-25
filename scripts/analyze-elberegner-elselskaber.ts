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

async function analyzeElberegnerElselskaber() {
  const url = 'https://elberegner.dk/elselskaber/'
  const timestamp = Date.now()
  const screenshotPath = path.join(process.cwd(), `elberegner-elselskaber-analysis-${timestamp}.png`)
  const analysisPath = path.join(process.cwd(), `elberegner-elselskaber-analysis-${timestamp}.json`)
  
  console.log(chalk.blue('Starting analysis of elberegner.dk/elselskaber/...'))
  console.log(chalk.gray(`URL: ${url}`))
  console.log(chalk.gray(`Profile: ${BROWSERBASE_PROFILE}`))
  
  try {
    // Step 1: Create a browser session
    console.log(chalk.yellow('\n1. Creating browser session...'))
    await useMCPServer(
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
    
    // Step 3: Extract comprehensive SEO and structural data
    console.log(chalk.yellow('\n3. Extracting page data...'))
    const seoData = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_stagehand_extract',
      { 
        instruction: `Extract comprehensive information about this electricity provider comparison page. Return a JSON object with:
        
        1. SEO Elements:
           - page_title: The page title
           - meta_description: Meta description content
           - meta_keywords: Meta keywords if present
           - h1_headings: Array of all H1 headings
           - h2_headings: Array of all H2 headings
           - h3_headings: Array of all H3 headings
        
        2. Content Structure:
           - main_sections: Array of main content sections with their titles and order
           - provider_display_format: How are providers shown (list, cards, table, etc)?
           - provider_count: Number of providers listed
           - provider_info_shown: What information is displayed for each provider
        
        3. Page Elements:
           - total_word_count: Approximate word count of visible text
           - image_count: Total number of images
           - images_with_alt: Number of images with alt text
           - internal_links: Number of internal links
           - external_links: Number of external links
           - interactive_elements: List of interactive features (calculators, filters, etc)
        
        4. Content Analysis:
           - primary_cta: Main call-to-action on the page
           - unique_features: Any unique features or selling points
           - content_depth: Brief assessment of content comprehensiveness
           - user_journey: How does the page guide users
        
        Please analyze thoroughly and return structured data.`
      },
      { profile: BROWSERBASE_PROFILE }
    )
    
    console.log(chalk.green('✓ Data extraction complete'))
    
    // Parse the extracted data
    let analysisResult = {
      url,
      timestamp: new Date(timestamp).toISOString(),
      extractedData: null,
      error: null
    }
    
    try {
      if (seoData.content && seoData.content[0] && seoData.content[0].text) {
        // Try to parse as JSON first
        try {
          analysisResult.extractedData = JSON.parse(seoData.content[0].text)
        } catch {
          // If not JSON, store as text
          analysisResult.extractedData = seoData.content[0].text
        }
      }
    } catch (parseError) {
      analysisResult.error = `Failed to parse data: ${parseError}`
    }
    
    // Step 4: Take a full-page screenshot
    console.log(chalk.yellow('\n4. Taking screenshot...'))
    const screenshotResult = await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_screenshot',
      { name: 'elberegner-elselskaber-full' },
      { profile: BROWSERBASE_PROFILE }
    )
    
    // Save screenshot if received
    if (screenshotResult.content?.[0]?.type === 'image' && screenshotResult.content[0].data) {
      const imageData = screenshotResult.content[0].data
      const buffer = Buffer.from(imageData, 'base64')
      await fs.writeFile(screenshotPath, buffer)
      
      console.log(chalk.green(`✓ Screenshot saved to: ${screenshotPath}`))
      
      const stats = await fs.stat(screenshotPath)
      console.log(chalk.gray(`  File size: ${(stats.size / 1024).toFixed(2)} KB`))
      
      analysisResult.screenshotPath = screenshotPath
    } else {
      console.error(chalk.red('✗ No screenshot data received'))
    }
    
    // Step 5: Save analysis results
    console.log(chalk.yellow('\n5. Saving analysis results...'))
    await fs.writeFile(analysisPath, JSON.stringify(analysisResult, null, 2))
    console.log(chalk.green(`✓ Analysis saved to: ${analysisPath}`))
    
    // Display key findings
    console.log(chalk.blue('\n📊 Key Findings:'))
    if (analysisResult.extractedData) {
      console.log(JSON.stringify(analysisResult.extractedData, null, 2))
    }
    
    // Step 6: Close the browser session
    console.log(chalk.yellow('\n6. Closing browser session...'))
    await useMCPServer(
      BROWSERBASE_SERVER,
      'browserbase_session_close',
      {},
      { profile: BROWSERBASE_PROFILE }
    )
    console.log(chalk.green('✓ Browser session closed'))
    
    console.log(chalk.blue('\n✨ Analysis completed successfully!'))
    console.log(chalk.gray(`\nResults saved to:`))
    console.log(chalk.gray(`- Screenshot: ${screenshotPath}`))
    console.log(chalk.gray(`- Analysis: ${analysisPath}`))
    
  } catch (error) {
    console.error(chalk.red('\n✗ Error during analysis:'))
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

// Run the analysis
analyzeElberegnerElselskaber().catch(console.error)