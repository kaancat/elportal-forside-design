import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Delete duplicate document function
async function deleteDuplicateDocument(documentId: string) {
  try {
    console.log(`🗑️  Deleting duplicate document: ${documentId}`)
    await client.delete(documentId)
    console.log('✅ Duplicate document deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Error deleting document:', error)
    return false
  }
}

// Fetch document to fix
async function fetchDocument(documentId: string) {
  try {
    console.log(`📄 Fetching document: ${documentId}`)
    const document = await client.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }
    return document
  } catch (error) {
    console.error('❌ Error fetching document:', error)
    throw error
  }
}

// Transform infoCardsSection to pageSection
function transformInfoCardsToPageSection(infoCardsSection: any) {
  console.log('🔄 Transforming infoCardsSection to pageSection')
  
  return {
    _type: 'pageSection',
    _key: infoCardsSection._key || generateKey(),
    heading: infoCardsSection.title || 'Særlige overvejelser for forskellige forbrugertyper',
    headerAlignment: 'left',
    content: [
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: infoCardsSection.subtitle || 'Find anbefalinger baseret på dit forbrug',
            marks: []
          }
        ]
      },
      // Transform each card into structured content
      ...(infoCardsSection.cards || []).map((card: any) => [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: `${card.title} - ${card.description}`,
              marks: []
            }
          ]
        },
        ...(card.content || [])
      ]).flat()
    ]
  }
}

// Fix callToActionSection structure
function fixCallToActionSection(ctaSection: any) {
  console.log('🔧 Fixing callToActionSection structure')
  
  // If it has primaryCta/secondaryCta structure, convert to simple format
  if (ctaSection.primaryCta) {
    return {
      _type: 'callToActionSection',
      _key: ctaSection._key || generateKey(),
      title: ctaSection.title || 'Tag kontrollen over dine elomkostninger i dag',
      buttonText: ctaSection.primaryCta.text || 'Start sammenligning nu',
      buttonUrl: ctaSection.primaryCta.href || '/'
    }
  }
  
  // Already in correct format
  return ctaSection
}

// Add icon metadata where missing
function addIconMetadata(icon: any) {
  if (!icon) return null
  
  // If icon already has proper structure, return it
  if (icon._type === 'icon.manager' && icon.svg) {
    return icon
  }
  
  // Create default icon structure
  return {
    _type: 'icon.manager',
    name: icon.name || 'circleEuro',
    provider: icon.provider || 'hi',
    svg: icon.svg || '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-width="2" d="M12,23 C18.0751322,23 23,18.0751322 23,12 C23,5.92486775 18.0751322,1 12,1 C5.92486775,1 1,5.92486775 1,12 C1,18.0751322 5.92486775,23 12,23 Z"></path></svg>'
  }
}

// Fix validation errors in content blocks
function fixContentBlocks(contentBlocks: any[]) {
  console.log('🔍 Fixing content blocks validation errors')
  
  return contentBlocks.map((block: any) => {
    // Handle infoCardsSection
    if (block._type === 'infoCardsSection') {
      return transformInfoCardsToPageSection(block)
    }
    
    // Handle callToActionSection
    if (block._type === 'callToActionSection') {
      return fixCallToActionSection(block)
    }
    
    // Handle featureList
    if (block._type === 'featureList') {
      return {
        ...block,
        features: (block.items || block.features || []).map((item: any) => ({
          ...item,
          _type: 'featureItem',
          _key: item._key || generateKey(),
          icon: addIconMetadata(item.icon)
        }))
      }
    }
    
    // Handle valueProposition
    if (block._type === 'valueProposition') {
      return {
        ...block,
        items: (block.items || []).map((item: any) => ({
          ...item,
          _type: 'valueItem',
          _key: item._key || generateKey(),
          icon: item.icon ? addIconMetadata(item.icon) : undefined
        }))
      }
    }
    
    // Return other blocks as-is
    return block
  })
}

// Update document with fixes
async function updateDocument(documentId: string, fixedContent: any) {
  try {
    console.log('📝 Updating document with fixes')
    
    const result = await client
      .patch(documentId)
      .set({ contentBlocks: fixedContent })
      .commit()
    
    console.log('✅ Document updated successfully')
    return result
  } catch (error) {
    console.error('❌ Error updating document:', error)
    throw error
  }
}

// Main function
async function consolidateAndFix() {
  console.log('🚀 Starting consolidation and fix process')
  
  const duplicateId = '1BrgDwXdqxJ08rMIondb0j'
  const keepId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    // Step 1: Delete duplicate document
    await deleteDuplicateDocument(duplicateId)
    
    // Step 2: Fetch the document to fix
    const document = await fetchDocument(keepId)
    
    // Step 3: Fix validation errors
    const fixedContentBlocks = fixContentBlocks(document.contentBlocks || [])
    
    // Step 4: Update the document
    await updateDocument(keepId, fixedContentBlocks)
    
    console.log('✅ Consolidation and fix complete!')
    console.log(`📌 View the fixed page at: https://dinelportal.sanity.studio/structure/page;${keepId}`)
    console.log('📌 Frontend URL: /hvordan-vaelger-du-elleverandoer')
    console.log('\n⚠️  Remember to manually adjust provider order in Sanity Studio to ensure Vindstød appears first!')
    
  } catch (error) {
    console.error('❌ Process failed:', error)
    process.exit(1)
  }
}

// Execute
consolidateAndFix()