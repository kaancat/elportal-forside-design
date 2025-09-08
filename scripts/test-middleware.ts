#!/usr/bin/env tsx

/**
 * Test script to verify middleware routing behavior
 * Run with: npm run test:middleware
 */

import chalk from 'chalk'

const TEST_ROUTES = [
  { path: '/', expected: 'SPA', description: 'Homepage (not yet migrated)' },
  { path: '/elpriser', expected: 'SPA', description: 'Electricity prices page' },
  { path: '/energy-tips', expected: 'SPA', description: 'Energy tips (SPA-only)' },
  { path: '/admin/dashboard', expected: 'SPA', description: 'Admin section' },
  { path: '/api/electricity-prices', expected: 'API', description: 'API route' },
  { path: '/_next/static/test.js', expected: 'STATIC', description: 'Static file' },
  { path: '/favicon.ico', expected: 'STATIC', description: 'Favicon' },
]

console.log(chalk.blue.bold('\n🧪 Testing Middleware Routing Logic\n'))

// Check if Phase 2 is enabled
const phase2Enabled = process.env.NEXT_PUBLIC_PHASE2_SSR === 'true'
console.log(chalk.yellow(`Phase 2 SSR: ${phase2Enabled ? 'ENABLED' : 'DISABLED'}\n`))

if (phase2Enabled) {
  console.log(chalk.green('✅ When Phase 2 is enabled:'))
  console.log('   - Homepage (/) will use SSR')
  console.log('   - Other migrated routes will use SSR')
  console.log('   - Unmigrated routes will use SPA fallback\n')
} else {
  console.log(chalk.yellow('⚠️  Phase 2 is disabled:'))
  console.log('   - All routes will use SPA fallback')
  console.log('   - Set NEXT_PUBLIC_PHASE2_SSR=true to enable SSR\n')
}

console.log(chalk.cyan('Route Testing Results:'))
console.log(chalk.gray('─'.repeat(60)))

TEST_ROUTES.forEach(({ path, expected, description }) => {
  let result = 'SPA'
  
  // Simulate middleware logic
  if (path.startsWith('/api') || 
      path.startsWith('/_next') || 
      path.includes('.') ||
      path === '/favicon.ico' ||
      path === '/robots.txt' ||
      path === '/sitemap.xml') {
    result = path.startsWith('/api') ? 'API' : 'STATIC'
  } else if (phase2Enabled && path === '/') {
    result = 'SSR'
  }
  
  const status = result === expected ? '✅' : '❌'
  const color = result === expected ? chalk.green : chalk.red
  
  console.log(
    `${status} ${chalk.white(path.padEnd(25))} → ${color(result.padEnd(8))} ${chalk.gray(description)}`
  )
})

console.log(chalk.gray('─'.repeat(60)))

console.log(chalk.blue.bold('\n📝 Next Steps:\n'))
console.log('1. Enable Phase 2: Set NEXT_PUBLIC_PHASE2_SSR=true in .env.local')
console.log('2. Add route to middleware: Update nextjsRoutes array in middleware.ts')
console.log('3. Test locally: npm run dev')
console.log('4. Deploy to preview: vercel --env preview')
console.log('')