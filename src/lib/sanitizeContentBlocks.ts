import { ContentBlock } from '@/types/sanity'

/**
 * Ensures all content blocks have valid _key properties
 * Generates missing keys based on type and index
 */
export function sanitizeContentBlocks(blocks: any[]): ContentBlock[] {
  if (!Array.isArray(blocks)) {
    return []
  }

  return blocks
    .filter(Boolean) // Remove null/undefined blocks
    .map((block, index) => {
      // Skip if not an object
      if (typeof block !== 'object' || !block) {
        return null
      }

      // Ensure _key exists
      if (!block._key) {
        return {
          ...block,
          _key: `${block._type || 'unknown'}-${index}-${Date.now()}`
        }
      }

      // For pageSections, ensure content array is sanitized
      if (block._type === 'pageSection' && Array.isArray(block.content)) {
        return {
          ...block,
          content: block.content
            .filter(Boolean)
            .map((contentItem: any, contentIndex: number) => {
              if (!contentItem._key && contentItem._type) {
                return {
                  ...contentItem,
                  _key: `${contentItem._type}-${contentIndex}-${Date.now()}`
                }
              }
              return contentItem
            })
        }
      }

      return block
    })
    .filter(Boolean) as ContentBlock[]
}

/**
 * Validates that a block has required properties
 */
export function isValidContentBlock(block: any): block is ContentBlock {
  return (
    block &&
    typeof block === 'object' &&
    typeof block._type === 'string' &&
    block._type.length > 0
  )
}