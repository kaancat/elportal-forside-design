import { SanityPage, UnifiedPage } from '@/types/sanity'

/**
 * Service for handling type conversions and operations with the unified page schema
 */
export class UnifiedPageService {

  /**
   * Convert SanityPage to UnifiedPage format
   * @param page - Regular page document
   * @returns UnifiedPage with isHomepage=false
   */
  static sanityPageToUnified(page: SanityPage): UnifiedPage {
    return {
      ...page,
      _type: 'page',
      isHomepage: false
    }
  }


  /**
   * Type guard to check if a document is a UnifiedPage
   * @param page - Document to check
   */
  static isUnifiedPage(page: any): page is UnifiedPage {
    return page?._type === 'page'
  }

  /**
   * Type guard to check if a UnifiedPage is the homepage
   * @param page - UnifiedPage to check
   */
  static isUnifiedHomepage(page: UnifiedPage): boolean {
    return page.isHomepage === true
  }

  /**
   * Normalize any page type to UnifiedPage
   * Handles SanityPage to UnifiedPage conversion
   * @param page - Page document of any supported type
   * @returns UnifiedPage or null if input is invalid
   */
  static normalizeToUnified(page: SanityPage | UnifiedPage | null): UnifiedPage | null {
    if (!page) return null

    // Already unified
    if (this.isUnifiedPage(page)) {
      return page
    }

    // Regular page (SanityPage)
    if (page._type === 'page' && 'slug' in page) {
      return this.sanityPageToUnified(page as SanityPage)
    }

    console.warn('Unknown page type:', page._type)
    return null
  }

  /**
   * Get the appropriate slug for routing
   * @param page - UnifiedPage to get slug from
   * @returns Slug string or null for homepage
   */
  static getSlugForRouting(page: UnifiedPage): string | null {
    if (page.isHomepage) {
      return null // Homepage uses root path
    }
    return page.slug?.current || null
  }

  /**
   * Get the canonical URL for a page
   * @param page - UnifiedPage to get URL for
   * @param baseUrl - Base URL of the site
   * @returns Full canonical URL
   */
  static getCanonicalUrl(page: UnifiedPage, baseUrl: string = ''): string {
    const slug = this.getSlugForRouting(page)
    if (!slug) {
      return baseUrl // Homepage
    }
    return `${baseUrl}/${slug}`
  }
}