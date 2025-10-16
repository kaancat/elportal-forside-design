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

export async function POST(req: NextRequest) {
    try {
        const c = client()

        // Find blog posts with titles that are just month names (3-4 characters, likely month abbreviations)
        const query = `*[_type == "blogPost" && length(title) <= 4]{ _id, title }`
        const monthPosts = await c.fetch(query)

        let deleted = 0
        for (const post of monthPosts) {
            try {
                await c.delete(post._id)
                deleted++
                console.log(`Deleted month post: ${post.title}`)
            } catch (e) {
                console.error(`Failed to delete ${post._id}:`, e)
            }
        }

        return NextResponse.json({
            success: true,
            deleted,
            total: monthPosts.length
        })
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e?.message || String(e)
        }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, usage: 'POST to delete blog posts with very short titles (likely month names).' })
}

