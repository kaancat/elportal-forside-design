#!/usr/bin/env tsx
/**
 * Partner Tracking Validation Script
 * 
 * Usage:
 *   npm run validate:partner -- --url=https://example.com --partner=test
 *   npm run validate:partner -- --url=https://vindstod.dk --partner=vindstod --secret=YOUR_SECRET
 * 
 * This script validates that a partner has correctly implemented the DinElportal tracking
 * either via universal script or webhook integration.
 */

import { chromium, Browser, Page } from 'playwright';
import chalk from 'chalk';
import { program } from 'commander';

// Test result type
interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: any;
}

// Parse command line arguments
program
  .option('-u, --url <url>', 'Partner website URL to test')
  .option('-p, --partner <id>', 'Partner ID (e.g., vindstod, andelenergi)')
  .option('-s, --secret <secret>', 'Webhook secret for testing conversions')
  .option('-m, --method <method>', 'Integration method: universal|webhook|both', 'both')
  .option('-v, --verbose', 'Show detailed output')
  .option('--headless', 'Run browser in headless mode', true)
  .parse();

const options = program.opts();

// Validation configuration
const config = {
  partnerUrl: options.url || 'http://localhost:3000',
  partnerId: options.partner || 'test',
  webhookSecret: options.secret || 'test-secret',
  method: options.method as 'universal' | 'webhook' | 'both',
  verbose: options.verbose || false,
  headless: options.headless !== false,
  dinelportalUrl: process.env.DINELPORTAL_URL || 'https://dinelportal.dk',
  testClickId: `dep_test_${Date.now().toString(36)}_validation`
};

// Console logging helpers
const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  debug: (msg: string) => config.verbose && console.log(chalk.gray('→'), msg),
  section: (msg: string) => console.log(chalk.bold.underline(`\n${msg}`)),
  result: (result: TestResult) => {
    const icon = result.status === 'pass' ? '✓' : 
                 result.status === 'fail' ? '✗' : 
                 result.status === 'warning' ? '⚠' : '○';
    const color = result.status === 'pass' ? chalk.green :
                  result.status === 'fail' ? chalk.red :
                  result.status === 'warning' ? chalk.yellow : chalk.gray;
    
    console.log(color(`  ${icon} ${result.test}: ${result.message}`));
    if (config.verbose && result.details) {
      console.log(chalk.gray('    Details:'), result.details);
    }
  }
};

// Test results collector
const results: TestResult[] = [];

/**
 * Test 1: Check if universal script is loaded
 */
async function testUniversalScriptPresence(page: Page): Promise<TestResult> {
  try {
    // Check for script tag
    const scriptTag = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.find(s => s.src && s.src.includes('dinelportal') && s.src.includes('universal.js'));
    });

    if (scriptTag) {
      return {
        test: 'Universal Script Tag',
        status: 'pass',
        message: 'Script tag found on page',
        details: { src: scriptTag }
      };
    }

    // Check if API is available (might be loaded differently)
    const apiAvailable = await page.evaluate(() => {
      return typeof (window as any).DinElportal !== 'undefined';
    });

    if (apiAvailable) {
      return {
        test: 'Universal Script Tag',
        status: 'warning',
        message: 'API available but script tag not found (custom implementation?)',
      };
    }

    return {
      test: 'Universal Script Tag',
      status: 'fail',
      message: 'Universal script not found on page',
    };
  } catch (error) {
    return {
      test: 'Universal Script Tag',
      status: 'fail',
      message: 'Error checking for script',
      details: error
    };
  }
}

/**
 * Test 2: Check if DinElportal API is functional
 */
async function testUniversalApi(page: Page): Promise<TestResult> {
  try {
    const apiTest = await page.evaluate(() => {
      if (typeof (window as any).DinElportal === 'undefined') {
        return { available: false };
      }

      const api = (window as any).DinElportal;
      return {
        available: true,
        version: api.version || 'unknown',
        methods: Object.keys(api),
        hasTrackingData: !!api.getTrackingData(),
      };
    });

    if (!apiTest.available) {
      return {
        test: 'DinElportal API',
        status: 'fail',
        message: 'API not available (window.DinElportal undefined)',
      };
    }

    if (apiTest.methods.length < 5) {
      return {
        test: 'DinElportal API',
        status: 'warning',
        message: `API partially available (only ${apiTest.methods.length} methods)`,
        details: apiTest
      };
    }

    return {
      test: 'DinElportal API',
      status: 'pass',
      message: `API v${apiTest.version} fully functional`,
      details: apiTest
    };
  } catch (error) {
    return {
      test: 'DinElportal API',
      status: 'fail',
      message: 'Error testing API',
      details: error
    };
  }
}

/**
 * Test 3: Check if click_id is captured
 */
async function testClickIdCapture(page: Page): Promise<TestResult> {
  try {
    // Navigate with click_id
    const testUrl = `${config.partnerUrl}?click_id=${config.testClickId}&utm_source=dinelportal`;
    log.debug(`Navigating to: ${testUrl}`);
    
    await page.goto(testUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Give script time to initialize

    // Check if click_id was captured
    const trackingData = await page.evaluate(() => {
      if (typeof (window as any).DinElportal !== 'undefined') {
        return (window as any).DinElportal.getTrackingData();
      }
      
      // Check sessionStorage/localStorage as fallback
      const stored = sessionStorage.getItem('dinelportal_click_id') || 
                    localStorage.getItem('dinelportal_click_id');
      return stored ? { click_id: stored } : null;
    });

    if (trackingData && trackingData.click_id === config.testClickId) {
      return {
        test: 'Click ID Capture',
        status: 'pass',
        message: 'Click ID successfully captured from URL',
        details: trackingData
      };
    }

    if (trackingData && trackingData.click_id) {
      return {
        test: 'Click ID Capture',
        status: 'warning',
        message: `Different click_id found: ${trackingData.click_id}`,
        details: trackingData
      };
    }

    return {
      test: 'Click ID Capture',
      status: 'fail',
      message: 'Click ID not captured from URL',
    };
  } catch (error) {
    return {
      test: 'Click ID Capture',
      status: 'fail',
      message: 'Error testing click capture',
      details: error
    };
  }
}

/**
 * Test 4: Check conversion tracking capability
 */
async function testConversionTracking(page: Page): Promise<TestResult> {
  try {
    // Set up network monitoring
    const requests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('track') || request.url().includes('conversion')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    // Try to trigger a manual conversion
    const conversionResult = await page.evaluate(async () => {
      if (typeof (window as any).DinElportal === 'undefined') {
        return { apiAvailable: false };
      }

      try {
        const result = await (window as any).DinElportal.trackConversion({
          conversion_type: 'test_validation',
          conversion_value: 100,
          test_mode: true
        });
        return { apiAvailable: true, success: result };
      } catch (error) {
        return { apiAvailable: true, success: false, error: String(error) };
      }
    });

    // Check if any tracking requests were made
    const trackingRequests = requests.filter(r => 
      r.url.includes('dinelportal') && 
      (r.url.includes('track') || r.url.includes('conversion'))
    );

    if (conversionResult.apiAvailable && conversionResult.success) {
      return {
        test: 'Conversion Tracking',
        status: 'pass',
        message: 'Conversion tracking functional',
        details: { requests: trackingRequests.length, result: conversionResult }
      };
    }

    if (trackingRequests.length > 0) {
      return {
        test: 'Conversion Tracking',
        status: 'warning',
        message: `Tracking attempted but may have failed`,
        details: { requests: trackingRequests, result: conversionResult }
      };
    }

    return {
      test: 'Conversion Tracking',
      status: 'fail',
      message: 'Conversion tracking not working',
      details: conversionResult
    };
  } catch (error) {
    return {
      test: 'Conversion Tracking',
      status: 'fail',
      message: 'Error testing conversions',
      details: error
    };
  }
}

/**
 * Test 5: Check webhook implementation
 */
async function testWebhookEndpoint(): Promise<TestResult> {
  if (config.method === 'universal') {
    return {
      test: 'Webhook Endpoint',
      status: 'skip',
      message: 'Skipped (testing universal method only)'
    };
  }

  try {
    const response = await fetch(`${config.dinelportalUrl}/api/track-conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': config.webhookSecret
      },
      body: JSON.stringify({
        click_id: config.testClickId,
        conversion_time: new Date().toISOString(),
        customer_id: 'validation_test',
        product_selected: 'test_product',
        test_mode: true
      })
    });

    if (response.ok) {
      return {
        test: 'Webhook Endpoint',
        status: 'pass',
        message: 'Webhook endpoint responsive',
        details: { status: response.status }
      };
    }

    if (response.status === 401) {
      return {
        test: 'Webhook Endpoint',
        status: 'fail',
        message: 'Webhook authentication failed (check secret)',
        details: { status: response.status }
      };
    }

    return {
      test: 'Webhook Endpoint',
      status: 'warning',
      message: `Webhook returned ${response.status}`,
      details: { status: response.status, text: await response.text() }
    };
  } catch (error) {
    return {
      test: 'Webhook Endpoint',
      status: 'fail',
      message: 'Failed to test webhook',
      details: error
    };
  }
}

/**
 * Run all validation tests
 */
async function runValidation() {
  let browser: Browser | null = null;
  
  try {
    log.section('DinElportal Partner Tracking Validator');
    log.info(`Testing: ${config.partnerUrl}`);
    log.info(`Partner ID: ${config.partnerId}`);
    log.info(`Method: ${config.method}`);
    log.info(`Click ID: ${config.testClickId}`);
    
    // Launch browser
    log.section('Launching Browser');
    browser = await chromium.launch({ 
      headless: config.headless,
      args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Enable console logging if verbose
    if (config.verbose) {
      page.on('console', msg => log.debug(`Browser: ${msg.text()}`));
    }
    
    // Navigate to partner site
    log.section('Testing Partner Website');
    await page.goto(config.partnerUrl, { waitUntil: 'networkidle' });
    
    // Run tests based on method
    if (config.method === 'universal' || config.method === 'both') {
      log.section('Universal Script Tests');
      results.push(await testUniversalScriptPresence(page));
      results.push(await testUniversalApi(page));
      results.push(await testClickIdCapture(page));
      results.push(await testConversionTracking(page));
    }
    
    if (config.method === 'webhook' || config.method === 'both') {
      log.section('Webhook Tests');
      results.push(await testWebhookEndpoint());
    }
    
    // Display results
    log.section('Test Results');
    results.forEach(result => log.result(result));
    
    // Summary
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const skipped = results.filter(r => r.status === 'skip').length;
    
    log.section('Summary');
    console.log(chalk.green(`  Passed: ${passed}`));
    failed > 0 && console.log(chalk.red(`  Failed: ${failed}`));
    warnings > 0 && console.log(chalk.yellow(`  Warnings: ${warnings}`));
    skipped > 0 && console.log(chalk.gray(`  Skipped: ${skipped}`));
    
    // Overall status
    if (failed === 0 && warnings === 0) {
      log.success('\n✨ All tests passed! Partner integration is working correctly.');
      process.exit(0);
    } else if (failed === 0) {
      log.warning('\n⚠ Integration working with warnings. Review the warnings above.');
      process.exit(0);
    } else {
      log.error('\n❌ Integration has issues. Please fix the failed tests above.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`Validation failed: ${error}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run validation
runValidation().catch(error => {
  log.error(`Fatal error: ${error}`);
  process.exit(1);
});