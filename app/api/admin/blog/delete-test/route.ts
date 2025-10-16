import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getClient() {
  const token = process.env.SANITY_API_TOKEN
  if (!token) throw new Error('SANITY_API_TOKEN not configured')
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01',
    useCdn: false,
    token,
  })
}

export async function POST(req: NextRequest) {
  try {
    const client = getClient()
    const { limit = 3 } = await req.json().catch(() => ({ limit: 3 }))
    const query = `*[_type == "blogPost" && (title match "*test*" || title match "*Test*" || title match "*TEST*")][0...$limit]{ _id, title, slug }`
    const toDelete = await client.fetch(query, { limit: Math.max(1, Math.min(10, limit)) })
    for (const d of toDelete) {
      await client.delete(d._id)
    }
    return NextResponse.json({ deleted: toDelete })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, usage: 'POST with {limit?:number} to delete blog posts with title containing "test" (case-insensitive), max 10.' })
}

