import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@sanity/client'

// Server-side only - no VITE_ prefix
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN

// Create authenticated client for mutations
const getClient = () => {
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST/PATCH requests
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { documentId, patches, replace } = req.body

    if (!documentId) {
      return res.status(400).json({ 
        error: 'Document ID is required' 
      })
    }

    const client = getClient()
    let result

    if (replace) {
      // Full document replacement
      const { _id, _rev, _type, _createdAt, _updatedAt, ...documentData } = req.body.document || {}
      
      if (!_type) {
        return res.status(400).json({ 
          error: 'Document type is required for replacement' 
        })
      }

      result = await client.createOrReplace({
        _id: documentId,
        _type,
        ...documentData
      })
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
            if (after) patch.insertAfter(after, items)
            else if (before) patch.insertBefore(before, items)
          }
        })
        return patch
      })
      
      result = await transaction.commit()
    } else {
      return res.status(400).json({ 
        error: 'Either patches or replace must be specified' 
      })
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      document: result,
      message: 'Content updated successfully'
    })
  } catch (error) {
    console.error('Failed to update content:', error)
    return res.status(500).json({ 
      error: 'Failed to update content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}