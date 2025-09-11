import { NextRequest, NextResponse } from 'next/server'
import { getSearchConsoleAccessToken } from '@/server/google'
import { cacheHeaders, corsPublic } from '@/server/api-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/seo/search-console
 * Body JSON: { siteUrl: string, startDate?: string, endDate?: string, dimensions?: string[], rowLimit?: number, type?: 'web'|'image'|'video' }
 * Defaults: last 7 days, type=web, rowLimit=2500, dimensions=['query']
 */
export async function POST(request: NextRequest) {
  const hasSecret = request.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')
  if (!hasSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsPublic() })
  }
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsPublic() })
  }

  const siteUrl: string | undefined = body?.siteUrl
  if (!siteUrl) {
    return NextResponse.json({ error: 'Missing siteUrl' }, { status: 400, headers: corsPublic() })
  }

  // Dates
  const end = body?.endDate ? new Date(body.endDate) : new Date()
  const start = body?.startDate ? new Date(body.startDate) : new Date(end)
  if (!body?.startDate) start.setUTCDate(end.getUTCDate() - 7)
  const startDate = start.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

  const dimensions: string[] = Array.isArray(body?.dimensions) && body.dimensions.length
    ? body.dimensions
    : ['query']
  const rowLimit = Number.isFinite(body?.rowLimit) ? Math.min(Number(body.rowLimit), 25000) : 2500
  const type = body?.type || 'web'

  try {
    const token = await getSearchConsoleAccessToken(false)

    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        type,
      })
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || data }, { status: res.status, headers: corsPublic() })
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        ...corsPublic(),
        ...cacheHeaders({ sMaxage: 60, swr: 300 }),
      }
    })
  } catch (err: any) {
    console.error('[GSC] Error:', err)
    return NextResponse.json({ error: 'Failed to query Search Console' }, { status: 502, headers: corsPublic() })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}
