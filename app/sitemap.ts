import { NextResponse } from 'next/server'
import { generateSitemap } from '@/utils/sitemapGenerator'
import { SITE_URL } from '@/lib/url-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const xml = await generateSitemap(SITE_URL)
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}

export const preferredRegion = 'auto'

