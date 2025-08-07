import { z } from 'zod'
import { ContentBlockSchema } from '@/lib/sanity-schemas.zod'

/**
 * UnifiedPage runtime validation schema
 * Validates core page shape and enforces that contentBlocks match our union schema
 */
export const UnifiedPageSchema = z.object({
  _id: z.string().min(1),
  _type: z.literal('page'),
  title: z.string().optional(),
  slug: z
    .object({
      _type: z.literal('slug').optional(),
      current: z.string().optional(),
    })
    .optional(),
  isHomepage: z.boolean().optional(),
  seoMetaTitle: z.string().optional(),
  seoMetaDescription: z.string().optional(),
  ogImage: z.any().optional(),
  noIndex: z.boolean().optional(),
  contentBlocks: z.array(ContentBlockSchema).optional(),
})

export type UnifiedPageParsed = z.infer<typeof UnifiedPageSchema>

/**
 * Filters invalid content blocks using the ContentBlockSchema.
 * Returns a shallow-cloned page with invalid blocks removed and any validation errors collected.
 */
export function validateAndFilterUnifiedPage(page: any): {
  page: any
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const cloned = { ...page }

  if (Array.isArray(cloned?.contentBlocks)) {
    const filtered = cloned.contentBlocks.filter((block: any, index: number) => {
      const result = ContentBlockSchema.safeParse(block)
      if (!result.success) {
        errors.push(`Invalid content block at index ${index} (_type=${block?._type || 'unknown'}): ${result.error.message}`)
      }
      return result.success
    })
    cloned.contentBlocks = filtered
  }

  const overall = UnifiedPageSchema.safeParse(cloned)
  if (!overall.success) {
    errors.push(`UnifiedPage validation failed: ${overall.error.message}`)
  }

  return {
    page: cloned,
    valid: overall.success && errors.length === 0,
    errors,
  }
}


