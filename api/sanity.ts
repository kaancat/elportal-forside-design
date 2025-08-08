import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@sanity/client'

// Consolidated Sanity API handler to reduce serverless function count
// Combines create-page and update-content endpoints

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Create page handler
async function handleCreatePage(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const pageContent = req.body

    if (!pageContent._type || !pageContent.slug) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['_type', 'slug']
      })
    }

    // Generate _id if not provided
    if (!pageContent._id) {
      pageContent._id = `page.${pageContent.slug.current || pageContent.slug}`
    }

    const result = await client.createOrReplace(pageContent)

    return res.status(200).json({
      success: true,
      id: result._id,
      slug: pageContent.slug.current || pageContent.slug,
      message: 'Page created successfully'
    })
  } catch (error) {
    console.error('Error creating page:', error)
    return res.status(500).json({ 
      error: 'Failed to create page',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Update content handler
async function handleUpdateContent(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { documentId, operations } = req.body

    if (!documentId || !operations || !Array.isArray(operations)) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['documentId', 'operations (array)']
      })
    }

    // Start a transaction
    const transaction = client.transaction()

    // Apply operations
    for (const op of operations) {
      switch (op.type) {
        case 'set':
          transaction.patch(documentId).set(op.path ? { [op.path]: op.value } : op.value)
          break
        
        case 'unset':
          transaction.patch(documentId).unset([op.path])
          break
        
        case 'insert':
          const patchForInsert = transaction.patch(documentId)
          if (op.position === 'after') {
            // TypeScript workaround - we know this method exists
            (patchForInsert as any).insertAfter(op.path, op.items)
          } else if (op.position === 'before') {
            // TypeScript workaround - we know this method exists
            (patchForInsert as any).insertBefore(op.path, op.items)
          }
          break
        
        case 'append':
          transaction.patch(documentId).append(op.path, op.items)
          break
        
        case 'prepend':
          transaction.patch(documentId).prepend(op.path, op.items)
          break
        
        case 'remove':
          // For array removal
          transaction.patch(documentId).unset([op.path])
          break
        
        default:
          console.warn(`Unknown operation type: ${op.type}`)
      }
    }

    // Commit the transaction
    const result = await transaction.commit()

    return res.status(200).json({
      success: true,
      documentId,
      operations: operations.length,
      message: 'Content updated successfully'
    })
  } catch (error) {
    console.error('Error updating content:', error)
    return res.status(500).json({ 
      error: 'Failed to update content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Main handler that routes to appropriate function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Check for API token
  if (!process.env.SANITY_API_TOKEN) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Sanity API token not configured'
    })
  }

  // Route based on action parameter
  const { action } = req.query

  switch (action) {
    case 'create-page':
      return handleCreatePage(req, res)
    case 'update-content':
      return handleUpdateContent(req, res)
    default:
      return res.status(400).json({ 
        error: 'Invalid action',
        validActions: ['create-page', 'update-content']
      })
  }
}