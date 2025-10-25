import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { formatTitleSentenceCase } from '@/server/newsFormatter'
import { env as appEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSanityWriteClient() {
  const token = process.env.SANITY_API_TOKEN
  if (!token) throw new Error('SANITY_API_TOKEN is not configured')
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || appEnv.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || appEnv.SANITY_DATASET
  return createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01', token, useCdn: false })
}

export async function POST(req: NextRequest) {
  const ok = req.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const sanity = getSanityWriteClient()
    const limit = Math.max(1, Math.min(50, parseInt(req.nextUrl.searchParams.get('limit') || '20', 10)))
    const docs: Array<{ _id: string; title?: string; slug?: { current?: string }; seoMetaTitle?: string }> = await sanity.fetch(
      `*[_type=="blogPost"]|order(_updatedAt desc)[0...$lim]{ _id, title, slug, seoMetaTitle }`,
      { lim: limit }
    )
    const changes: any[] = []
    for (const d of docs) {
      const desired = formatTitleSentenceCase(d.title || '')
      const needTitle = !!d.title && d.title !== desired
      const needSeo = !d.seoMetaTitle || d.seoMetaTitle !== desired
      if (needTitle || needSeo) {
        await sanity.patch(d._id).set({ title: needTitle ? desired : d.title, seoMetaTitle: desired }).commit()
        changes.push({ id: d._id, slug: d.slug?.current, old: d.title, new: desired })
      }
    }
    return NextResponse.json({ ok: true, updated: changes.length, changes })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}

