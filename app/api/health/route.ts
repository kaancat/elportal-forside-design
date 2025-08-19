/**
 * Next.js App Router API Route for system health checks
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - KV availability checks
 * - Token cache status
 * - Active locks monitoring
 * - Cache statistics
 * - Environment variable validation
 * - Degraded state detection
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Configure runtime
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Always fresh health status

/**
 * GET /api/health
 * 
 * System health check endpoint
 * Returns comprehensive health metrics and status of various subsystems
 * 
 * Response includes:
 * - KV cache availability and latency
 * - Eloverblik token cache status
 * - Active distributed locks
 * - Cache entry statistics
 * - Environment variable configuration
 * - Overall system health status
 */
export async function GET(request: NextRequest) {
  const metrics: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {}
  }
  
  // Check KV availability
  try {
    const start = Date.now()
    await kv.ping()
    const latency = Date.now() - start
    metrics.checks.kv = { 
      status: 'up', 
      latency: `${latency}ms`,
      message: 'Vercel KV is operational'
    }
  } catch (e: any) {
    metrics.checks.kv = { 
      status: 'down', 
      error: e.message,
      message: 'Vercel KV is not available'
    }
    metrics.status = 'degraded'
  }
  
  // Check token cache
  try {
    const tokenCached = await kv.exists('eloverblik_token')
    metrics.checks.tokenCache = { 
      cached: tokenCached === 1,
      message: tokenCached === 1 ? 'Eloverblik token is cached' : 'No cached token found'
    }
  } catch {
    metrics.checks.tokenCache = { 
      cached: false,
      message: 'Unable to check token cache'
    }
  }
  
  // Check active locks
  try {
    const locks = await kv.keys('lock:*')
    metrics.checks.activeLocks = {
      count: locks.length,
      message: `${locks.length} active lock(s)`,
      locks: locks.slice(0, 10) // Show first 10 locks for debugging
    }
  } catch {
    metrics.checks.activeLocks = {
      count: 'unknown',
      message: 'Unable to check locks'
    }
  }
  
  // Check cached data statistics
  try {
    const consumptionKeys = await kv.keys('consumption:*')
    const priceKeys = await kv.keys('prices:*')
    const forecastKeys = await kv.keys('forecast:*')
    const productionKeys = await kv.keys('production:*')
    const co2Keys = await kv.keys('co2:*')
    const consumptionMapKeys = await kv.keys('consumption-map:*')
    
    metrics.checks.cacheStats = {
      consumption: consumptionKeys.length,
      prices: priceKeys.length,
      forecast: forecastKeys.length,
      production: productionKeys.length,
      co2: co2Keys.length,
      consumptionMap: consumptionMapKeys.length,
      total: consumptionKeys.length + priceKeys.length + forecastKeys.length + 
             productionKeys.length + co2Keys.length + consumptionMapKeys.length,
      message: `Cache entries - Consumption: ${consumptionKeys.length}, Prices: ${priceKeys.length}, Forecast: ${forecastKeys.length}, Production: ${productionKeys.length}, CO2: ${co2Keys.length}, Map: ${consumptionMapKeys.length}`
    }
  } catch {
    metrics.checks.cacheStats = {
      message: 'Unable to retrieve cache statistics'
    }
  }
  
  // Check memory usage (if available in Node.js environment)
  if (process.memoryUsage) {
    const memUsage = process.memoryUsage()
    metrics.checks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      message: 'Memory usage statistics'
    }
  }
  
  // Check environment variables (Vercel prefixes with kv_)
  metrics.checks.environment = {
    eloverblikToken: !!process.env.ELOVERBLIK_API_TOKEN,
    kvUrl: !!(process.env.KV_REST_API_URL || process.env.kv_KV_REST_API_URL),
    kvToken: !!(process.env.KV_REST_API_TOKEN || process.env.kv_KV_REST_API_TOKEN),
    sanityProjectId: !!process.env.SANITY_PROJECT_ID,
    sanityDataset: !!process.env.SANITY_DATASET,
    sanityToken: !!process.env.SANITY_API_TOKEN,
    nodeEnv: process.env.NODE_ENV || 'development',
    message: 'Environment variables check'
  }
  
  // API route migration status
  metrics.checks.migration = {
    phase: 'Phase 4 - API Routes Migration',
    completed: 7, // Updated count of migrated routes
    pending: 21, // Remaining routes to migrate
    progress: '25%',
    routes: {
      migrated: [
        'electricity-prices',
        'co2-emissions',
        'consumption-map',
        'revalidate',
        'energy-forecast',
        'monthly-production',
        'health'
      ],
      inProgress: [],
      pending: [
        'declaration-gridmix',
        'declaration-production',
        'pricelists',
        'private-industry-consumption',
        'tracking/*',
        'auth/*',
        'admin/*',
        'sanity/*',
        'eloverblik'
      ]
    },
    message: 'Next.js migration progress'
  }
  
  // Determine overall health
  if (!metrics.checks.environment.kvUrl || !metrics.checks.environment.kvToken) {
    metrics.status = 'unhealthy'
    metrics.message = 'KV environment variables not configured'
  } else if (metrics.checks.kv?.status === 'down') {
    metrics.status = 'degraded'
    metrics.message = 'System operational with fallback to in-memory cache'
  } else {
    metrics.message = 'All systems operational'
  }
  
  // Add uptime
  if (process.uptime) {
    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    metrics.uptime = `${days}d ${hours}h ${minutes}m`
  }
  
  // Set appropriate status code
  const statusCode = metrics.status === 'healthy' ? 200 : 
                     metrics.status === 'degraded' ? 503 : 500
  
  // Return with appropriate headers
  return NextResponse.json(metrics, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}