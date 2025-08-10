import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    
    metrics.checks.cacheStats = {
      consumption: consumptionKeys.length,
      prices: priceKeys.length,
      total: consumptionKeys.length + priceKeys.length,
      message: `${consumptionKeys.length} consumption and ${priceKeys.length} price entries cached`
    }
  } catch {
    metrics.checks.cacheStats = {
      message: 'Unable to retrieve cache statistics'
    }
  }
  
  // Check environment variables (Vercel prefixes with kv_)
  metrics.checks.environment = {
    eloverblikToken: !!process.env.ELOVERBLIK_API_TOKEN,
    kvUrl: !!(process.env.KV_REST_API_URL || process.env.kv_KV_REST_API_URL),
    kvToken: !!(process.env.KV_REST_API_TOKEN || process.env.kv_KV_REST_API_TOKEN),
    message: 'Required environment variables check'
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
  
  // Set appropriate status code
  const statusCode = metrics.status === 'healthy' ? 200 : 
                     metrics.status === 'degraded' ? 503 : 500
  
  res.status(statusCode).json(metrics)
}