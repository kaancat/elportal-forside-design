import { NextRequest, NextResponse } from 'next/server'
import { getSearchConsoleAccessToken } from '@/server/google'
import { cacheHeaders, corsPublic } from '@/server/api-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 20

/**
 * GET /api/seo/search-console/sitemaps?siteUrl=https://example.com/
 * Lists sitemaps for a property
 */
export async function GET(request: NextRequest) {
  const hasSecret = request.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')
  if (!hasSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsPublic() })
  }

  const { searchParams } = request.nextUrl
  const siteUrl = searchParams.get('siteUrl')
  if (!siteUrl) {
    return NextResponse.json({ error: 'Missing siteUrl' }, { status: 400, headers: corsPublic() })
  }
  try {
    const token = await getSearchConsoleAccessToken(false)
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`
    const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data?.error || data }, { status: res.status, headers: corsPublic() })
    return NextResponse.json(data, { headers: { ...corsPublic(), ...cacheHeaders({ sMaxage: 300, swr: 600 }) } })
  } catch (err: any) {
    console.error('[GSC Sitemaps] Error:', err)
    return NextResponse.json({ error: 'Failed to list sitemaps' }, { status: 502, headers: corsPublic() })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}

