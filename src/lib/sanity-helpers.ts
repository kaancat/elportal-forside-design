import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create authenticated client for mutations
export const mutationClient = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

/**
 * Creates a new page in Sanity with proper ID generation
 * @param pageData - Page content without _id field
 * @returns Created page document
 */
export async function createPage(pageData: any) {
  // Ensure no _id is provided - let Sanity generate it
  const { _id, ...cleanPageData } = pageData
  
  if (_id && _id.startsWith('page.')) {
    console.warn('⚠️  Warning: Removing invalid page.{slug} ID pattern. Sanity will auto-generate a proper ID.')
  }
  
  try {
    // Use create() to let Sanity generate a unique ID
    const result = await mutationClient.create({
      _type: 'page',
      ...cleanPageData
    })
    
    console.log('✅ Page created successfully!')
    console.log(`   ID: ${result._id}`)
    console.log(`   Slug: /${result.slug?.current || 'no-slug'}`)
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;${result._id}`)
    
    return result
  } catch (error) {
    console.error('❌ Failed to create page:', error)
    throw error
  }
}

/**
 * Updates navigation to include a new page
 * @param pageId - The ID of the page to add to navigation
 * @param linkText - The text to display in navigation
 * @param position - Where to insert in navigation (defaults to end)
 */
export async function addPageToNavigation(pageId: string, linkText: string, position?: number) {
  try {
    // Fetch current site settings
    const settings = await mutationClient.fetch(`*[_type == "siteSettings"][0]`)
    
    if (!settings) {
      throw new Error('Site settings not found')
    }
    
    // Create new link item
    const newLink = {
      _type: 'link',
      _key: Math.random().toString(36).substring(7),
      title: linkText,
      linkType: 'internal',
      internalLink: {
        _type: 'reference',
        _ref: pageId
      }
    }
    
    // Add to header links
    const updatedHeaderLinks = [...settings.headerLinks]
    if (position !== undefined && position >= 0) {
      updatedHeaderLinks.splice(position, 0, newLink)
    } else {
      updatedHeaderLinks.push(newLink)
    }
    
    // Update site settings
    await mutationClient
      .patch(settings._id)
      .set({ headerLinks: updatedHeaderLinks })
      .commit()
    
    console.log(`✅ Added "${linkText}" to navigation`)
    return true
  } catch (error) {
    console.error('❌ Failed to update navigation:', error)
    throw error
  }
}

/**
 * Helper to create Portable Text blocks
 */
export function createTextBlock(text: string, style: string = 'normal') {
  return {
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text,
        marks: [],
      },
    ],
  }
}

/**
 * Helper to create bold text block
 */
export function createBoldTextBlock(text: string) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text,
        marks: ['strong'],
      },
    ],
  }
}