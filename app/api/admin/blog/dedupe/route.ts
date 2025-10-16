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
    token,
    useCdn: false,
  })
}

function normalizeTitle(t?: string) {
  return (t || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function POST(req: NextRequest) {
  const client = getClient()
  const { dryRun = false, maxDeletes = 50 } = await req.json().catch(() => ({ dryRun: false, maxDeletes: 50 }))
  // Fetch recent posts; adjust window if needed
  const docs: Array<{ _id: string; title?: string; slug?: { current?: string }; _createdAt: string }>= await client.fetch(
    `*[_type == "blogPost"] | order(_createdAt desc)[0...500]{ _id, title, slug, _createdAt }`
  )
  const byTitle = new Map<string, Array<typeof docs[0]>>()
  for (const d of docs) {
    const key = normalizeTitle(d.title)
    const arr = byTitle.get(key) || []
    arr.push(d)
    byTitle.set(key, arr)
  }
  const toDelete: Array<{ _id: string; title?: string; slug?: string }> = []
  for (const [key, arr] of byTitle.entries()) {
    if (!key || arr.length <= 1) continue
    // keep the newest, delete the older ones
    const sorted = arr.sort((a,b)=> new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    const keep = sorted[0]
    for (const dup of sorted.slice(1)) {
      toDelete.push({ _id: dup._id, title: dup.title, slug: dup.slug?.current })
      if (toDelete.length >= maxDeletes) break
    }
    if (toDelete.length >= maxDeletes) break
  }
  if (!dryRun) {
    for (const d of toDelete) {
      await client.delete(d._id)
    }
  }
  return NextResponse.json({ dryRun, deletedCount: dryRun ? 0 : toDelete.length, candidates: toDelete })
}

export async function GET() {
  return NextResponse.json({ ok: true, usage: 'POST with {dryRun?:boolean, maxDeletes?:number} to delete duplicates by identical titles (keeps newest).' })
}

