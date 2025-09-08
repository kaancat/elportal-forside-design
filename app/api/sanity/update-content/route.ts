/**
 * Sanity Update Content API Route - Next.js App Router
 * Protected endpoint for updating content in Sanity CMS
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
 * Handle content update operations
 */
async function handleUpdate(request: NextRequest): Promise<NextResponse> {
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
    const { documentId, patches, replace } = await request.json()
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { 
          status: 400,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    const client = getClient()
    let result
    
    if (replace) {
      // Full document replacement
      const { _id, _rev, _type, _createdAt, _updatedAt, ...documentData } = replace
      
      if (!_type) {
        return NextResponse.json(
          { error: 'Document type is required for replacement' },
          { 
            status: 400,
            headers: corsPrivate(request.headers.get('origin'))
          }
        )
      }
      
      result = await client.createOrReplace({
        _id: documentId,
        _type,
        ...documentData
      })
      
      console.log('[UpdateContent] Document replaced:', documentId)
    } else if (patches) {
      // Patch operations
      const transaction = client.transaction()
      
      transaction.patch(documentId, patch => {
        patches.forEach((p: any) => {
          if (p.set) patch.set(p.set)
          if (p.unset) patch.unset(p.unset)
          if (p.inc) patch.inc(p.inc)
          if (p.dec) patch.dec(p.dec)
          if (p.insert) {
            const { after, before, items } = p.insert
            if (after) (patch as any).insertAfter(after, items)
            else if (before) (patch as any).insertBefore(before, items)
          }
          if (p.append) {
            Object.entries(p.append).forEach(([key, value]) => {
              (patch as any).append(key, value)
            })
          }
          if (p.prepend) {
            Object.entries(p.prepend).forEach(([key, value]) => {
              (patch as any).prepend(key, value)
            })
          }
        })
        return patch
      })
      
      result = await transaction.commit()
      console.log('[UpdateContent] Document patched:', documentId)
    } else {
      return NextResponse.json(
        { error: 'Either patches or replace must be specified' },
        { 
          status: 400,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Return success
    return NextResponse.json(
      {
        success: true,
        document: result,
        message: 'Content updated successfully'
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
    
    console.error('[UpdateContent] Failed to update content:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update content',
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
 * POST handler
 */
export async function POST(request: NextRequest) {
  return handleUpdate(request)
}

/**
 * PATCH handler
 */
export async function PATCH(request: NextRequest) {
  return handleUpdate(request)
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