/**
 * Sanity Mutation Service
 * 
 * This service provides secure write access to Sanity CMS
 * by routing all mutations through server-side API endpoints.
 * No API tokens are exposed to the client.
 */

/**
 * Create a new page in Sanity
 */
export async function createPage(pageData: any) {
  try {
    const response = await fetch('/api/sanity?action=create-page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create page')
    }

    const result = await response.json()
    console.log('✅ Page created successfully!')
    console.log(`   ID: ${result.page._id}`)
    console.log(`   Slug: /${result.page.slug}`)
    console.log(`   Studio: ${result.page.studioUrl}`)
    
    return result.page
  } catch (error) {
    console.error('❌ Failed to create page:', error)
    throw error
  }
}

/**
 * Update content in Sanity
 */
export async function updateContent(
  documentId: string,
  updates: {
    patches?: any[],
    document?: any,
    replace?: boolean
  }
) {
  try {
    const response = await fetch('/api/sanity?action=update-content', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        ...updates
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update content')
    }

    const result = await response.json()
    console.log('✅ Content updated successfully!')
    return result.document
  } catch (error) {
    console.error('❌ Failed to update content:', error)
    throw error
  }
}

/**
 * Patch specific fields in a document
 */
export async function patchDocument(
  documentId: string,
  patches: Array<{
    set?: Record<string, any>,
    unset?: string[],
    inc?: Record<string, number>,
    dec?: Record<string, number>,
    insert?: {
      after?: string,
      before?: string,
      items: any[]
    }
  }>
) {
  return updateContent(documentId, { patches })
}

/**
 * Replace an entire document
 */
export async function replaceDocument(
  documentId: string,
  document: any
) {
  return updateContent(documentId, { 
    document,
    replace: true 
  })
}