import { NextResponse } from 'next/server'
import { cacheHeaders, corsPublic } from '@/server/api-helpers'
import { getProviders } from '@/server/sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET() {
  try {
    const providers = await getProviders()
    return NextResponse.json({ providers }, {
      headers: {
        ...cacheHeaders({ sMaxage: 300, swr: 600 }),
        ...corsPublic(),
      }
    })
  } catch (error) {
    console.error('[API] /api/providers error:', error)
    return NextResponse.json({ providers: [] }, {
      status: 200,
      headers: {
        ...cacheHeaders({ sMaxage: 60, swr: 300 }),
        ...corsPublic(),
      }
    })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}















