#!/usr/bin/env tsx

/**
 * API Migration Parity Test Suite
 * 
 * Tests that migrated App Router APIs maintain functional parity with
 * original Vercel Functions. Compares responses, headers, and behavior.
 * 
 * Usage:
 *   npm run test:api-parity         # Run all tests
 *   npm run test:api-parity prices  # Run specific endpoint test
 */

import fetch from 'node-fetch'
import chalk from 'chalk'
import { diff } from 'json-diff'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5173'
const TIMEOUT = 10000 // 10 seconds per request

interface TestCase {
  name: string
  oldPath: string
  newPath: string
  method?: string
  body?: any
  headers?: Record<string, string>
  queryParams?: Record<string, string>
  skipResponseComparison?: boolean
  validateResponse?: (oldRes: any, newRes: any) => boolean
  expectedStatus?: number
}

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

// Define all test cases
const testCases: TestCase[] = [
  // Data APIs
  {
    name: 'Electricity Prices - DK2 Today',
    oldPath: '/api/electricity-prices.ts',
    newPath: '/api/electricity-prices',
    queryParams: { region: 'DK2' }
  },
  {
    name: 'Electricity Prices - DK1 Date Range',
    oldPath: '/api/electricity-prices.ts',
    newPath: '/api/electricity-prices',
    queryParams: { 
      area: 'DK1',
      date: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    }
  },
  {
    name: 'CO2 Emissions - Latest',
    oldPath: '/api/co2-emissions.ts',
    newPath: '/api/co2-emissions',
    queryParams: { region: 'DK2' }
  },
  {
    name: 'Energy Forecast - DK2',
    oldPath: '/api/energy-forecast.ts',
    newPath: '/api/energy-forecast',
    queryParams: { area: 'DK2' }
  },
  {
    name: 'Monthly Production - 2024',
    oldPath: '/api/monthly-production.ts',
    newPath: '/api/monthly-production',
    queryParams: { year: '2024' }
  },
  {
    name: 'Consumption Map - DK Municipality',
    oldPath: '/api/consumption-map.ts',
    newPath: '/api/consumption-map',
    queryParams: { type: 'municipality' }
  },
  {
    name: 'Declaration GridMix',
    oldPath: '/api/declaration-gridmix.ts',
    newPath: '/api/declaration-gridmix'
  },
  {
    name: 'Declaration Production',
    oldPath: '/api/declaration-production.ts',
    newPath: '/api/declaration-production'
  },
  {
    name: 'Price Lists - All Providers',
    oldPath: '/api/pricelists.ts',
    newPath: '/api/pricelists',
    queryParams: { region: 'DK2' }
  },
  {
    name: 'Private Industry Consumption',
    oldPath: '/api/private-industry-consumption.ts',
    newPath: '/api/private-industry-consumption'
  },
  
  // Auth APIs (session endpoints need special handling)
  {
    name: 'Auth Session - Init',
    oldPath: '/api/auth/session.ts',
    newPath: '/api/auth/session',
    method: 'POST',
    body: { action: 'init' },
    skipResponseComparison: true, // Session IDs will differ
    validateResponse: (old, newRes) => {
      return newRes.sessionId && newRes.expiresAt && !newRes.customerId
    }
  },
  {
    name: 'Auth Authorize - State Generation',
    oldPath: '/api/auth/authorize.ts',
    newPath: '/api/auth/authorize',
    method: 'POST',
    body: { sessionId: 'test-session-123' },
    skipResponseComparison: true,
    validateResponse: (old, newRes) => {
      return newRes.authorizationUrl && newRes.authorizationUrl.includes('state=')
    }
  },
  
  // Admin APIs (require auth)
  {
    name: 'Admin Auth - Invalid Credentials',
    oldPath: '/api/admin/auth.ts',
    newPath: '/api/admin/auth',
    method: 'POST',
    body: { username: 'invalid', password: 'wrong' },
    expectedStatus: 401
  },
  {
    name: 'Admin Debug - Unauthorized',
    oldPath: '/api/admin/debug.ts',
    newPath: '/api/admin/debug',
    expectedStatus: 401
  },
  
  // Tracking APIs
  {
    name: 'Tracking Pixel',
    oldPath: '/api/tracking/pixel.ts',
    newPath: '/api/tracking/pixel',
    queryParams: { 
      partner: 'test',
      event: 'conversion',
      click_id: 'test123'
    },
    validateResponse: (old, newRes) => {
      // Pixel should return a GIF image
      return newRes.headers?.['content-type'] === 'image/gif'
    }
  },
  {
    name: 'Universal JS - Default Config',
    oldPath: '/api/tracking/universal.js.ts',
    newPath: '/api/tracking/universal.js',
    queryParams: { partner_id: 'test-partner' },
    validateResponse: (old, newRes) => {
      // Should return JavaScript
      return newRes.headers?.['content-type']?.includes('javascript')
    }
  },
  {
    name: 'Universal JS - Custom Thank You',
    oldPath: '/api/tracking/universal.js.ts',
    newPath: '/api/tracking/universal.js',
    queryParams: { 
      partner_id: 'test',
      thank_you: '/custom-thank-you'
    },
    skipResponseComparison: true,
    validateResponse: (old, newRes) => {
      return newRes.body?.includes('/custom-thank-you')
    }
  },
  
  // Health & Revalidation
  {
    name: 'Health Check',
    oldPath: '/api/health.ts',
    newPath: '/api/health',
    skipResponseComparison: true, // Health status varies
    validateResponse: (old, newRes) => {
      return newRes.status && newRes.checks && newRes.timestamp
    }
  },
  {
    name: 'Revalidate - Missing Secret',
    oldPath: '/api/revalidate.ts',
    newPath: '/api/revalidate',
    method: 'POST',
    body: { _id: 'test', _type: 'page' },
    expectedStatus: 401
  }
]

/**
 * Make HTTP request with timeout
 */
async function makeRequest(
  path: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
    queryParams?: Record<string, string>
  } = {}
): Promise<{ status: number; body: any; headers: any; duration: number }> {
  const start = Date.now()
  
  // Build URL with query params
  const url = new URL(path, BASE_URL)
  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT)
    
    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    
    const contentType = response.headers.get('content-type')
    let body
    
    if (contentType?.includes('application/json')) {
      body = await response.json()
    } else if (contentType?.includes('javascript')) {
      body = await response.text()
    } else if (contentType?.includes('image')) {
      // For binary responses like pixel tracking
      body = 'BINARY_RESPONSE'
    } else {
      body = await response.text()
    }
    
    const duration = Date.now() - start
    
    return {
      status: response.status,
      body,
      headers: Object.fromEntries(response.headers.entries()),
      duration
    }
  } catch (error: any) {
    const duration = Date.now() - start
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${TIMEOUT}ms`)
    }
    
    throw new Error(`Request failed: ${error.message}`)
  }
}

/**
 * Run a single test case
 */
async function runTestCase(testCase: TestCase): Promise<TestResult> {
  const start = Date.now()
  
  try {
    // Make requests to both old and new endpoints
    const [oldResponse, newResponse] = await Promise.all([
      makeRequest(testCase.oldPath, {
        method: testCase.method,
        body: testCase.body,
        headers: testCase.headers,
        queryParams: testCase.queryParams
      }),
      makeRequest(testCase.newPath, {
        method: testCase.method,
        body: testCase.body,
        headers: testCase.headers,
        queryParams: testCase.queryParams
      })
    ])
    
    // Check status codes match
    if (testCase.expectedStatus) {
      if (newResponse.status !== testCase.expectedStatus) {
        return {
          name: testCase.name,
          passed: false,
          duration: Date.now() - start,
          error: `Expected status ${testCase.expectedStatus}, got ${newResponse.status}`
        }
      }
    } else if (oldResponse.status !== newResponse.status) {
      return {
        name: testCase.name,
        passed: false,
        duration: Date.now() - start,
        error: `Status mismatch: old=${oldResponse.status}, new=${newResponse.status}`
      }
    }
    
    // Custom validation if provided
    if (testCase.validateResponse) {
      const isValid = testCase.validateResponse(oldResponse, newResponse)
      if (!isValid) {
        return {
          name: testCase.name,
          passed: false,
          duration: Date.now() - start,
          error: 'Custom validation failed'
        }
      }
    }
    
    // Compare response bodies (unless skipped)
    if (!testCase.skipResponseComparison && typeof oldResponse.body === 'object') {
      const bodyDiff = diff(oldResponse.body, newResponse.body)
      if (bodyDiff) {
        // Ignore certain fields that are expected to differ
        const ignoredPaths = ['timestamp', 'requestId', 'sessionId', 'token', 'expires', 'lastUpdated']
        const significantDiff = JSON.stringify(bodyDiff).split('\n').filter(line => {
          return !ignoredPaths.some(path => line.includes(path))
        }).join('\n')
        
        if (significantDiff.length > 10) { // More than just formatting
          return {
            name: testCase.name,
            passed: false,
            duration: Date.now() - start,
            error: 'Response body mismatch',
            details: bodyDiff
          }
        }
      }
    }
    
    // Check critical headers
    const criticalHeaders = ['content-type', 'cache-control']
    for (const header of criticalHeaders) {
      if (oldResponse.headers[header] && newResponse.headers[header]) {
        const oldHeader = oldResponse.headers[header].toLowerCase()
        const newHeader = newResponse.headers[header].toLowerCase()
        
        if (oldHeader !== newHeader && !header.includes('cache')) {
          // Cache headers may differ slightly, that's ok
          return {
            name: testCase.name,
            passed: false,
            duration: Date.now() - start,
            error: `Header mismatch: ${header} old="${oldHeader}" new="${newHeader}"`
          }
        }
      }
    }
    
    // Performance check - new should not be significantly slower
    if (newResponse.duration > oldResponse.duration * 2 && newResponse.duration > 1000) {
      return {
        name: testCase.name,
        passed: false,
        duration: Date.now() - start,
        error: `Performance regression: old=${oldResponse.duration}ms, new=${newResponse.duration}ms`,
        details: { warning: 'New endpoint is >2x slower' }
      }
    }
    
    return {
      name: testCase.name,
      passed: true,
      duration: Date.now() - start,
      details: {
        oldDuration: oldResponse.duration,
        newDuration: newResponse.duration,
        status: newResponse.status
      }
    }
    
  } catch (error: any) {
    return {
      name: testCase.name,
      passed: false,
      duration: Date.now() - start,
      error: error.message
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(chalk.bold('\n🧪 API Migration Parity Test Suite\n'))
  console.log(chalk.gray(`Testing against: ${BASE_URL}\n`))
  
  const filter = process.argv[2]
  const testsToRun = filter 
    ? testCases.filter(tc => tc.name.toLowerCase().includes(filter.toLowerCase()))
    : testCases
  
  if (testsToRun.length === 0) {
    console.log(chalk.yellow(`No tests match filter: ${filter}`))
    process.exit(1)
  }
  
  const results: TestResult[] = []
  let passed = 0
  let failed = 0
  
  // Run tests sequentially to avoid rate limiting
  for (const testCase of testsToRun) {
    process.stdout.write(chalk.gray(`Running: ${testCase.name}... `))
    
    const result = await runTestCase(testCase)
    results.push(result)
    
    if (result.passed) {
      console.log(chalk.green(`✓ (${result.duration}ms)`))
      passed++
    } else {
      console.log(chalk.red(`✗ ${result.error}`))
      if (result.details) {
        console.log(chalk.gray(JSON.stringify(result.details, null, 2)))
      }
      failed++
    }
    
    // Small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Print summary
  console.log(chalk.bold('\n📊 Test Summary\n'))
  console.log(chalk.green(`  ✓ Passed: ${passed}`))
  console.log(chalk.red(`  ✗ Failed: ${failed}`))
  console.log(chalk.gray(`  Total: ${testsToRun.length}\n`))
  
  // Print failed tests for easy reference
  if (failed > 0) {
    console.log(chalk.bold.red('Failed Tests:\n'))
    results.filter(r => !r.passed).forEach(r => {
      console.log(chalk.red(`  • ${r.name}: ${r.error}`))
    })
    console.log()
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('\n❌ Test suite failed:'), error)
  process.exit(1)
})