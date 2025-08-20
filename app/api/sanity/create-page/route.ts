/**
 * Sanity Create Page API Route - Next.js App Router
 * Protected endpoint for creating new pages in Sanity CMS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { corsPrivate } from '@/server/api-helpers'
import { requireAuth } from '@/server/session-helpers'
import { validateCSRF } from '@/server/csrf-helpers'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

// Server-side only - no VITE_ prefix
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN

/**
 * Create authenticated Sanity client
 */
function getClient() {
  if (!SANITY_API_TOKEN) {
    throw new Error('SANITY_API_TOKEN not configured')
  }
  
  return createClient({
    projectId: 'yxesi03x',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2025-01-01',
    token: SANITY_API_TOKEN
  })
}

/**
 * POST /api/sanity/create-page - Create a new page in Sanity
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAuth(request, ['admin'])
    
    // Validate CSRF token
    const csrfValid = await validateCSRF(request)
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { 
          status: 403,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Parse request body
    const pageData = await request.json()
    
    if (!pageData || !pageData._type) {
      return NextResponse.json(
        { error: 'Invalid page data provided' },
        { 
          status: 400,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Security: Remove any _id to prevent ID manipulation
    const { _id, ...cleanPageData } = pageData
    
    if (_id && _id.startsWith('page.')) {
      console.warn('[CreatePage] Removing page.{slug} ID pattern - Sanity will auto-generate')
    }
    
    // Create the page using authenticated client
    const client = getClient()
    const result = await client.create({
      _type: 'page',
      ...cleanPageData
    })
    
    console.log('[CreatePage] Page created successfully:', result._id)
    
    // Return success with created page info
    return NextResponse.json(
      {
        success: true,
        page: {
          _id: result._id,
          slug: result.slug?.current || 'no-slug',
          title: result.title,
          studioUrl: `https://dinelportal.sanity.studio/structure/page;${result._id}`
        }
      },
      {
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { 
            status: 401,
            headers: corsPrivate(request.headers.get('origin'))
          }
        )
      }
    }
    
    console.error('[CreatePage] Failed to create page:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create page',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPrivate(request.headers.get('origin'))
  })
}