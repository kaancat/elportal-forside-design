import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function client() {
  const token = process.env.SANITY_API_TOKEN
  if (!token) throw new Error('SANITY_API_TOKEN not configured')
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01',
    token,
    useCdn: false,
  })
}

// Deletes ONLY blog posts created by ingestion (identified by presence of sourceUrl)
export async function POST(req: NextRequest) {
  try {
    const c = client()
    const ids: Array<{ _id: string; sourceUrl?: string }> = await c.fetch(`*[_type == "blogPost" && defined(sourceUrl)]{ _id, sourceUrl }`)
    let deleted = 0
    for (const chunk of Array.from({ length: Math.ceil(ids.length / 50) }, (_, i) => ids.slice(i * 50, (i + 1) * 50))) {
      await Promise.all(chunk.map(d => c.delete(d._id).then(() => deleted++).catch(() => {})))
    }
    return NextResponse.json({ success: true, deleted })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, usage: 'POST to delete all ingested posts (blogPost with sourceUrl).' })
}

