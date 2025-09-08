import { NextRequest, NextResponse } from 'next/server'
import { getHomePage } from '@/server/sanity'

/**
 * Debug API route to inspect homepage content from Sanity
 * This will help us understand what content the App Router is fetching
 */
export async function GET(request: NextRequest) {
  try {
    const page = await getHomePage()
    
    const debug = {
      hasPage: !!page,
      title: page?.title,
      contentBlocksCount: page?.contentBlocks?.length || 0,
      contentBlockTypes: page?.contentBlocks?.map((block: any) => block._type) || [],
      isHomepage: page?.isHomepage,
      seoTitle: page?.seoMetaTitle,
      rawPage: page
    }

    return NextResponse.json(debug, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('[Debug] Error fetching homepage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}