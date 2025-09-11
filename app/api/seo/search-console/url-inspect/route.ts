import { NextRequest, NextResponse } from 'next/server'
import { getSearchConsoleAccessToken } from '@/server/google'
import { corsPublic, cacheHeaders } from '@/server/api-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/seo/search-console/url-inspect
 * Body JSON: { siteUrl: string, inspectionUrl: string, languageCode?: string }
 */
export async function POST(request: NextRequest) {
  const hasSecret = request.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')
  if (!hasSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsPublic() })
  }

  let body: any
  try { body = await request.json() } catch {}
  const siteUrl: string | undefined = body?.siteUrl
  const inspectionUrl: string | undefined = body?.inspectionUrl
  const languageCode: string = body?.languageCode || 'en-US'

  if (!siteUrl || !inspectionUrl) {
    return NextResponse.json({ error: 'siteUrl and inspectionUrl are required' }, { status: 400, headers: corsPublic() })
  }

  try {
    // URL Inspection API requires the full webmasters scope
    const token = await getSearchConsoleAccessToken(true)
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inspectionUrl, siteUrl, languageCode })
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || data }, { status: res.status, headers: corsPublic() })
    }
    return NextResponse.json(data, {
      headers: { ...corsPublic(), ...cacheHeaders({ sMaxage: 60, swr: 300 }) }
    })
  } catch (err: any) {
    console.error('[GSC Inspect] Error:', err)
    return NextResponse.json({ error: 'Failed to inspect URL' }, { status: 502, headers: corsPublic() })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}

