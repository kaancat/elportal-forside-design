import { NextRequest, NextResponse } from 'next/server'
import { getSearchConsoleAccessToken } from '@/server/google'
import { corsPublic } from '@/server/api-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 20

/**
 * POST /api/seo/search-console/sitemaps/submit
 * Body JSON: { siteUrl: string, feedpath: string }
 */
export async function POST(request: NextRequest) {
  const hasSecret = request.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')
  if (!hasSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsPublic() })
  }

  let body: any
  try { body = await request.json() } catch {}
  const siteUrl: string | undefined = body?.siteUrl
  const feedpath: string | undefined = body?.feedpath
  if (!siteUrl || !feedpath) {
    return NextResponse.json({ error: 'siteUrl and feedpath are required' }, { status: 400, headers: corsPublic() })
  }

  try {
    const token = await getSearchConsoleAccessToken(true) // submit requires write scope
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`
    const res = await fetch(endpoint, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ error: data?.error || 'Failed to submit sitemap' }, { status: res.status, headers: corsPublic() })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[GSC Sitemaps Submit] Error:', err)
    return NextResponse.json({ error: 'Failed to submit sitemap' }, { status: 502, headers: corsPublic() })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}

