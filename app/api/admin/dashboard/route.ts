/**
 * Admin Dashboard API Route - Next.js App Router
 * Provides tracking metrics and analytics for admin users
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { requireAuth } from '@/server/session-helpers'
import { corsPrivate, cacheHeaders } from '@/server/api-helpers'
import { requiresCSRFProtection, validateCSRF } from '@/server/csrf-helpers'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 15
export const dynamic = 'force-dynamic'

/**
 * Get dashboard metrics from KV storage
 */
async function getDashboardMetrics() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get all click keys (limit to recent for performance)
    const clickKeys = await kv.keys('click:dep_*')
    const recentClicks: Array<{
      clickId: string
      partner: string
      timestamp: string
      source: string
    }> = []
    
    // Process clicks in batches to avoid timeout
    const recentClickKeys = clickKeys.slice(-100)
    for (const key of recentClickKeys) {
      try {
        const clickData = await kv.get<any>(key)
        if (clickData) {
          recentClicks.push({
            clickId: clickData.click_id,
            partner: clickData.partner_id,
            timestamp: clickData.timestamp,
            source: clickData.source || 'unknown'
          })
        }
      } catch (error) {
        console.error('[Dashboard] Error processing click:', key, error)
      }
    }
    
    // Get conversion keys
    const conversionKeys = await kv.keys('conversion:*')
    const recentConversions: Array<{
      clickId: string
      partner: string
      value: number
      timestamp: string
    }> = []
    
    const recentConversionKeys = conversionKeys.slice(-50)
    for (const key of recentConversionKeys) {
      try {
        const conversionData = await kv.get<any>(key)
        if (conversionData) {
          recentConversions.push({
            clickId: conversionData.click_id,
            partner: conversionData.partner_id,
            value: conversionData.contract_value || 0,
            timestamp: conversionData.conversion_timestamp || conversionData.timestamp
          })
        }
      } catch (error) {
        console.error('[Dashboard] Error processing conversion:', key, error)
      }
    }
    
    // Calculate partner statistics
    const partnerStats = new Map<string, {
      id: string
      name: string
      clicks: number
      conversions: number
      revenue: number
    }>()
    
    // Aggregate clicks by partner
    recentClicks.forEach(click => {
      if (!partnerStats.has(click.partner)) {
        partnerStats.set(click.partner, {
          id: click.partner,
          name: click.partner,
          clicks: 0,
          conversions: 0,
          revenue: 0
        })
      }
      const stats = partnerStats.get(click.partner)!
      stats.clicks++
    })
    
    // Aggregate conversions by partner
    recentConversions.forEach(conversion => {
      if (!partnerStats.has(conversion.partner)) {
        partnerStats.set(conversion.partner, {
          id: conversion.partner,
          name: conversion.partner,
          clicks: 0,
          conversions: 0,
          revenue: 0
        })
      }
      const stats = partnerStats.get(conversion.partner)!
      stats.conversions++
      stats.revenue += conversion.value
    })
    
    // Format partner data with calculated metrics
    const partners = Array.from(partnerStats.values()).map(partner => ({
      ...partner,
      clicksLast30d: partner.clicks,
      conversionsLast30d: partner.conversions,
      conversionRate: partner.clicks > 0 ? (partner.conversions / partner.clicks) * 100 : 0,
      revenueLast30d: partner.revenue
    }))
    
    // Filter today's data
    const todayClicks = recentClicks.filter(c => 
      new Date(c.timestamp).toDateString() === new Date().toDateString()
    )
    
    const todayConversions = recentConversions.filter(c => 
      new Date(c.timestamp).toDateString() === new Date().toDateString()
    )
    
    // Calculate today's revenue
    const todayRevenue = todayConversions.reduce((sum, c) => sum + c.value, 0)
    
    // Get active partners list
    const activePartners = Array.from(new Set(recentClicks.map(c => c.partner)))
    
    return {
      realtime: {
        clicksToday: todayClicks.length,
        conversionsToday: todayConversions.length,
        revenueToday: todayRevenue,
        activePartners
      },
      partners: partners.sort((a, b) => b.revenue - a.revenue), // Sort by revenue
      recent: {
        clicks: recentClicks
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50),
        conversions: recentConversions
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20)
      },
      summary: {
        totalClicks: recentClicks.length,
        totalConversions: recentConversions.length,
        totalRevenue: recentConversions.reduce((sum, c) => sum + c.value, 0),
        averageConversionRate: recentClicks.length > 0 
          ? (recentConversions.length / recentClicks.length) * 100 
          : 0
      }
    }
  } catch (error) {
    console.error('[Dashboard] Metrics calculation error:', error)
    
    // Return empty metrics on error
    return {
      realtime: { 
        clicksToday: 0, 
        conversionsToday: 0, 
        revenueToday: 0, 
        activePartners: [] 
      },
      partners: [],
      recent: { 
        clicks: [], 
        conversions: [] 
      },
      summary: {
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        averageConversionRate: 0
      }
    }
  }
}

/**
 * GET /api/admin/dashboard - Get dashboard metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAuth(request, ['admin'])
    
    // Get dashboard metrics
    const metrics = await getDashboardMetrics()
    
    const response = NextResponse.json({
      ok: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      sessionId: session.sessionId
    })
    
    // Add cache headers (short cache for real-time data)
    Object.entries(cacheHeaders({ sMaxage: 30, swr: 60 })).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    // Handle auth errors
    if (error instanceof NextResponse) {
      return error
    }
    
    console.error('[Dashboard] GET error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'DASHBOARD_ERROR',
          message: 'Failed to fetch metrics'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/dashboard - Refresh dashboard metrics (with CSRF)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAuth(request, ['admin'])
    
    // Validate CSRF for mutation
    const csrfValid = await validateCSRF(request)
    if (!csrfValid) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'Invalid or missing CSRF value'
          }
        },
        { status: 403 }
      )
    }
    
    // Force refresh metrics (clear any cached data)
    const metrics = await getDashboardMetrics()
    
    // Log admin action
    await kv.set(
      `admin-action:${Date.now()}`,
      {
        action: 'dashboard_refresh',
        sessionId: session.sessionId,
        timestamp: Date.now()
      },
      { ex: 86400 } // 24 hours
    )
    
    const response = NextResponse.json({
      ok: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      message: 'Dashboard metrics refreshed'
    })
    
    // No cache for forced refresh
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    
    // Add CORS headers
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    // Handle auth errors
    if (error instanceof NextResponse) {
      return error
    }
    
    console.error('[Dashboard] POST error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'REFRESH_ERROR',
          message: 'Failed to refresh metrics'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPrivate(request.headers.get('origin'))
  })
}