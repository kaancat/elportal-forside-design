import { NextRequest, NextResponse } from 'next/server'
import { getPageBySlug } from '@/server/sanity'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await getPageBySlug(params.slug)
    return NextResponse.json({
      slug: params.slug,
      hasPage: !!page,
      title: page?.title,
      blockTypes: page?.contentBlocks?.map((b: any) => b?._type) || [],
      blocks: page?.contentBlocks || []
    }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


