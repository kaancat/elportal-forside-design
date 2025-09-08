#!/usr/bin/env tsx

/**
 * Phase 6 Webhook Health Monitoring Script
 * Monitors webhook delivery performance and alerts on issues
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const WEBHOOK_URL = process.env.SITE_URL ? 
  `${process.env.SITE_URL}/api/revalidate` : 
  'https://dinelportal.dk/api/revalidate'

interface WebhookHealthStatus {
  timestamp: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  configuration: {
    secret_configured: boolean
    runtime: string
    supported_types: string[]
  }
  issues: string[]
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME_WARNING: 1000, // 1 second
  RESPONSE_TIME_CRITICAL: 3000, // 3 seconds
  SUCCESS_RATE_WARNING: 0.95, // 95%
  SUCCESS_RATE_CRITICAL: 0.90 // 90%
}

async function checkWebhookHealth(): Promise<WebhookHealthStatus> {
  const startTime = Date.now()
  const issues: string[] = []
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  try {
    // Test health check endpoint
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'DinElportal-Webhook-Monitor/1.0'
      }
    })

    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      issues.push(`Health check failed with status ${response.status}`)
      status = 'unhealthy'
    }

    // Check response time performance
    if (responseTime > PERFORMANCE_THRESHOLDS.RESPONSE_TIME_CRITICAL) {
      issues.push(`Critical response time: ${responseTime}ms (threshold: ${PERFORMANCE_THRESHOLDS.RESPONSE_TIME_CRITICAL}ms)`)
      status = 'unhealthy'
    } else if (responseTime > PERFORMANCE_THRESHOLDS.RESPONSE_TIME_WARNING) {
      issues.push(`Slow response time: ${responseTime}ms (threshold: ${PERFORMANCE_THRESHOLDS.RESPONSE_TIME_WARNING}ms)`)
      if (status === 'healthy') status = 'degraded'
    }

    let configuration = {
      secret_configured: false,
      runtime: 'unknown',
      supported_types: [] as string[]
    }

    if (response.ok) {
      try {
        const data = await response.json()
        configuration = {
          secret_configured: data.configuration?.secret_configured || false,
          runtime: data.configuration?.runtime || 'unknown',
          supported_types: data.configuration?.supported_document_types || []
        }

        // Validate configuration
        if (!configuration.secret_configured) {
          issues.push('Webhook secret not configured')
          status = 'unhealthy'
        }

        if (configuration.runtime !== 'nodejs') {
          issues.push(`Incorrect runtime: ${configuration.runtime} (expected: nodejs)`)
          if (status === 'healthy') status = 'degraded'
        }

        const expectedTypes = ['homePage', 'page', 'provider', 'siteSettings']
        const missingTypes = expectedTypes.filter(type => 
          !configuration.supported_types.includes(type)
        )
        
        if (missingTypes.length > 0) {
          issues.push(`Missing document type support: ${missingTypes.join(', ')}`)
          if (status === 'healthy') status = 'degraded'
        }

      } catch (parseError) {
        issues.push('Failed to parse health check response')
        status = 'degraded'
      }
    }

    return {
      timestamp: new Date().toISOString(),
      status,
      responseTime,
      configuration,
      issues
    }

  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      configuration: {
        secret_configured: false,
        runtime: 'unknown',
        supported_types: []
      },
      issues: [`Network error: ${error}`]
    }
  }
}

// Generate health report
async function generateHealthReport(): Promise<void> {
  console.log('🏥 WEBHOOK HEALTH MONITORING REPORT')
  console.log('===================================')
  console.log(`Target URL: ${WEBHOOK_URL}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log('')

  const health = await checkWebhookHealth()

  // Status indicator
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌'
  }

  console.log(`${statusEmoji[health.status]} Overall Status: ${health.status.toUpperCase()}`)
  console.log(`⚡ Response Time: ${health.responseTime}ms`)
  console.log('')

  // Configuration details
  console.log('🔧 CONFIGURATION STATUS:')
  console.log(`   Secret Configured: ${health.configuration.secret_configured ? '✅' : '❌'}`)
  console.log(`   Runtime: ${health.configuration.runtime}`)
  console.log(`   Supported Types: ${health.configuration.supported_types.join(', ') || 'None'}`)
  console.log('')

  // Issues and recommendations
  if (health.issues.length > 0) {
    console.log('⚠️  ISSUES DETECTED:')
    health.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`)
    })
    console.log('')
  }

  // Performance recommendations
  console.log('📊 PERFORMANCE ANALYSIS:')
  if (health.responseTime < 500) {
    console.log('   ✅ Excellent response time')
  } else if (health.responseTime < 1000) {
    console.log('   ⚡ Good response time')
  } else if (health.responseTime < 3000) {
    console.log('   ⚠️  Slow response time - consider optimization')
  } else {
    console.log('   ❌ Critical response time - investigation required')
  }

  // Recommendations
  console.log('')
  console.log('🎯 RECOMMENDATIONS:')
  
  if (health.status === 'unhealthy') {
    console.log('   🚨 CRITICAL: Webhook system requires immediate attention')
    console.log('   📞 Contact development team')
    console.log('   🔄 Consider emergency rollback if production is affected')
  } else if (health.status === 'degraded') {
    console.log('   ⚠️  Performance degradation detected')
    console.log('   📋 Review issues above and optimize')
    console.log('   📊 Monitor closely for further degradation')
  } else {
    console.log('   ✅ System is operating normally')
    console.log('   📈 Continue monitoring for performance trends')
  }

  // Next steps for Phase 6
  console.log('')
  console.log('🎯 PHASE 6 NEXT STEPS:')
  console.log('1. Configure webhook in Sanity Studio (see docs/PHASE6_WEBHOOK_CONFIGURATION.md)')
  console.log('2. Test with real content changes')
  console.log('3. Verify cache invalidation on frontend')
  console.log('4. Monitor webhook delivery logs in production')
  console.log('')
  console.log('📋 For webhook configuration: https://sanity.io/manage → API → Webhooks')
}

// CLI interface
if (import.meta.main) {
  generateHealthReport().catch(console.error)
}

export { checkWebhookHealth, generateHealthReport }