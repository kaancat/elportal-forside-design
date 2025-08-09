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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const pageData = req.body

    if (!pageData || !pageData._type) {
      return res.status(400).json({ 
        error: 'Invalid page data provided' 
      })
    }

    // Security: Remove any _id to prevent ID manipulation
    const { _id, ...cleanPageData } = pageData
    
    if (_id && _id.startsWith('page.')) {
      console.warn('Removing page.{slug} ID pattern - Sanity will auto-generate')
    }

    // Create the page using authenticated client
    const client = getClient()
    const result = await client.create({
      _type: 'page',
      ...cleanPageData
    })
    
    // Return success with created page info
    return res.status(200).json({
      success: true,
      page: {
        _id: result._id,
        slug: result.slug?.current || 'no-slug',
        title: result.title,
        studioUrl: `https://dinelportal.sanity.studio/structure/page;${result._id}`
      }
    })
  } catch (error) {
    console.error('Failed to create page:', error)
    return res.status(500).json({ 
      error: 'Failed to create page',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}