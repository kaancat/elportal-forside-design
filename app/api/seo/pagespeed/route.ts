import { NextRequest, NextResponse } from 'next/server'
import { cacheHeaders, corsPublic } from '@/server/api-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 20

/**
 * GET /api/seo/pagespeed?url=https://example.com&strategy=mobile
 * Server-side proxy to Google PageSpeed Insights API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const strategy = searchParams.get('strategy') || 'mobile'
  const category = searchParams.getAll('category') // allow multiple categories

  if (!url) {
    return NextResponse.json(
      { error: 'Missing required query param: url' },
      { status: 400, headers: corsPublic() }
    )
  }

  const apiKey = process.env.GOOGLE_PSI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'PSI key not configured (GOOGLE_PSI_API_KEY)' },
      { status: 500, headers: corsPublic() }
    )
  }

  const target = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  target.searchParams.set('url', url)
  target.searchParams.set('key', apiKey)
  if (strategy) target.searchParams.set('strategy', strategy)
  for (const c of category) target.searchParams.append('category', c)

  try {
    const res = await fetch(target.toString(), { next: { revalidate: 0 } })
    const data = await res.json()

    return NextResponse.json(data, {
      status: res.ok ? 200 : res.status,
      headers: {
        ...corsPublic(),
        ...cacheHeaders({ sMaxage: 60, swr: 300 }),
      },
    })
  } catch (err: any) {
    console.error('[PSI] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch PageSpeed data' },
      { status: 502, headers: corsPublic() }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}

