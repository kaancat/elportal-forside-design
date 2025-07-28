import { createClient, type SanityClient } from '@sanity/client'
import { z } from 'zod'
import * as schemas from './sanity-schemas.zod'

/**
 * Sanity Agent Actions Utility Module
 * 
 * This module provides a clean, type-safe interface for using Sanity's Agent Actions
 * to create and modify content with built-in schema validation.
 * 
 * Benefits:
 * - Schema-aware content generation
 * - Automatic validation and error recovery
 * - Reduced validation errors
 * - AI-powered content enhancement
 */

// Agent Actions client configuration
export interface AgentActionsConfig {
  projectId: string
  dataset: string
  token: string
  apiVersion?: string
}

// Common page creation options
export interface PageCreationOptions {
  title: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  topic?: string
  keywords?: string[]
  contentRequirements?: string
  references?: Array<{ _ref: string; _type: 'reference' }>
}

// Content block generation options
export interface ContentBlockOptions {
  type: 'hero' | 'valueProposition' | 'featureList' | 'providerList' | 'faqSection' | 'ctaSection'
  content?: string
  requirements?: string
}

export class SanityAgentActions {
  private client: SanityClient

  constructor(config: AgentActionsConfig) {
    this.client = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      useCdn: false,
      apiVersion: config.apiVersion || 'vX', // vX required for Agent Actions
      token: config.token,
    })

    // Check if Agent Actions is available
    if (!this.client.agentActions) {
      console.warn('⚠️  Agent Actions not available on this client')
      console.warn('   This feature may be experimental or not available on your plan')
    }
  }

  /**
   * Creates a new page using Agent Actions with automatic schema validation
   */
  async createPage(options: PageCreationOptions): Promise<any> {
    if (!this.client.agentActions) {
      throw new Error('Agent Actions not available. Please check your Sanity plan or use traditional API methods.')
    }

    const instruction = this.buildPageInstruction(options)

    try {
      console.log('🤖 Generating page with Agent Actions...')
      
      const result = await this.client.agentActions.generate({
        type: 'page',
        instruction,
        operation: 'create',
        references: options.references,
      })

      // Validate the generated content
      await this.validatePage(result)

      return result
    } catch (error) {
      console.error('Failed to create page:', error)
      
      // Attempt to recover from validation errors
      if (error.name === 'ValidationError' && result?._id) {
        console.log('🔧 Attempting to fix validation errors...')
        return await this.fixValidationErrors(result._id, error)
      }
      
      throw error
    }
  }

  /**
   * Adds a content block to an existing page
   */
  async addContentBlock(pageId: string, blockOptions: ContentBlockOptions): Promise<any> {
    if (!this.client.agentActions) {
      throw new Error('Agent Actions not available. Please check your Sanity plan or use traditional API methods.')
    }

    const instruction = this.buildBlockInstruction(blockOptions)

    try {
      const result = await this.client.agentActions.transform({
        id: pageId,
        instruction: `Add a ${blockOptions.type} content block to the page. ${instruction}`,
      })

      return result
    } catch (error) {
      console.error(`Failed to add ${blockOptions.type} block:`, error)
      throw error
    }
  }

  /**
   * Enhances existing page content with SEO improvements
   */
  async enhancePageSEO(pageId: string, keywords: string[]): Promise<any> {
    if (!this.client.agentActions) {
      throw new Error('Agent Actions not available. Please check your Sanity plan or use traditional API methods.')
    }

    const instruction = `Enhance the page for SEO:
      - Optimize content for keywords: ${keywords.join(', ')}
      - Add internal linking opportunities
      - Ensure proper heading hierarchy
      - Add schema markup suggestions
      - Improve meta descriptions for CTR
      - Keep all content in Danish`

    try {
      const result = await this.client.agentActions.transform({
        id: pageId,
        instruction,
      })

      return result
    } catch (error) {
      console.error('Failed to enhance page SEO:', error)
      throw error
    }
  }

  /**
   * Validates page content against Sanity schemas
   */
  async validatePage(page: any): Promise<boolean> {
    try {
      // Validate main page structure
      schemas.PageSchema.parse(page)

      // Validate content blocks if present
      if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
        for (const block of page.contentBlocks) {
          this.validateContentBlock(block)
        }
      }

      console.log('✅ Page validation passed')
      return true
    } catch (error) {
      console.error('❌ Page validation failed:', error)
      throw error
    }
  }

  /**
   * Validates individual content blocks
   */
  private validateContentBlock(block: any): void {
    switch (block._type) {
      case 'hero':
        schemas.HeroSchema.parse(block)
        break
      case 'valueProposition':
        schemas.ValuePropositionSchema.parse(block)
        break
      case 'featureList':
        schemas.FeatureListSchema.parse(block)
        break
      case 'providerList':
        schemas.ProviderListSchema.parse(block)
        break
      case 'faqSection':
        schemas.FaqSectionSchema.parse(block)
        break
      case 'ctaSection':
        schemas.CallToActionSectionSchema.parse(block)
        break
      default:
        console.warn(`Unknown block type: ${block._type}`)
    }
  }

  /**
   * Attempts to fix validation errors using Transform action
   */
  private async fixValidationErrors(documentId: string, validationError: any): Promise<any> {
    if (!this.client.agentActions) {
      throw new Error('Agent Actions not available. Cannot auto-fix validation errors.')
    }

    const errorDetails = this.extractValidationErrorDetails(validationError)
    
    const instruction = `Fix the following validation errors in the document:
      ${errorDetails}
      
      Critical schema rules to remember:
      - hero uses "headline" and "subheadline" (NOT title/subtitle)
      - valueItem uses "heading" (NOT title)
      - featureItem uses "title" (NOT name)
      - All rich text fields use Portable Text array format
      - Icons must be icon.manager objects with metadata`

    try {
      const result = await this.client.agentActions.transform({
        id: documentId,
        instruction,
      })

      // Re-validate after fix
      await this.validatePage(result)
      console.log('✅ Validation errors fixed successfully')
      
      return result
    } catch (error) {
      console.error('Failed to fix validation errors:', error)
      throw error
    }
  }

  /**
   * Builds page creation instruction from options
   */
  private buildPageInstruction(options: PageCreationOptions): string {
    return `Create a comprehensive Danish page with the following specifications:

    Basic Information:
    - Title: "${options.title}"
    - Slug: "${options.slug}"
    - SEO Title: "${options.seoTitle || options.title}"
    - SEO Description: "${options.seoDescription || `Alt om ${options.topic} - find de bedste løsninger hos ElPortal`}"
    ${options.topic ? `- Topic: ${options.topic}` : ''}
    ${options.keywords ? `- Target keywords: ${options.keywords.join(', ')}` : ''}

    Content Requirements:
    ${options.contentRequirements || `
    - Create engaging, informative content in Danish
    - Include relevant sections based on the topic
    - Add CTAs where appropriate
    - Subtly promote Vindstød as a green energy provider
    `}

    CRITICAL Schema Requirements:
    - hero block: use "headline" and "subheadline" fields (NOT title/subtitle)
    - valueProposition: valueItem uses "heading" field (NOT title)
    - featureList: featureItem uses "title" field (NOT name)
    - All text content must be in Danish
    - Use Portable Text format for rich text fields
    - Include proper _key values for all array items

    Ensure all content follows the exact Sanity schema structure.`
  }

  /**
   * Builds content block instruction from options
   */
  private buildBlockInstruction(options: ContentBlockOptions): string {
    const baseInstructions: Record<ContentBlockOptions['type'], string> = {
      hero: 'Create a compelling hero section with headline and subheadline. Remember to use "headline" and "subheadline" fields.',
      valueProposition: 'Create a value proposition with 3-4 benefits. Each valueItem must use "heading" field.',
      featureList: 'Create a feature list with 4-6 features. Each featureItem must use "title" field.',
      providerList: 'Create a provider comparison section. Ensure Vindstød appears first.',
      faqSection: 'Create an FAQ section with 5-6 relevant questions and answers.',
      ctaSection: 'Create a call-to-action section with compelling copy.',
    }

    return `${baseInstructions[options.type]}
    ${options.content ? `Content focus: ${options.content}` : ''}
    ${options.requirements ? `Additional requirements: ${options.requirements}` : ''}
    All content must be in Danish.`
  }

  /**
   * Extracts readable error details from validation errors
   */
  private extractValidationErrorDetails(error: any): string {
    if (error instanceof z.ZodError) {
      return error.errors
        .map(err => `- ${err.path.join('.')}: ${err.message}`)
        .join('\n')
    }
    
    return JSON.stringify(error, null, 2)
  }

  /**
   * Creates a complete SEO page with all standard sections
   */
  async createCompleteSEOPage(options: PageCreationOptions & {
    includeHero?: boolean
    includeValueProps?: boolean
    includeFeatures?: boolean
    includeProviders?: boolean
    includeFAQ?: boolean
    includeCTA?: boolean
  }): Promise<any> {
    const sections = []
    
    if (options.includeHero !== false) sections.push('hero section')
    if (options.includeValueProps !== false) sections.push('value proposition')
    if (options.includeFeatures !== false) sections.push('feature list')
    if (options.includeProviders !== false) sections.push('provider comparison')
    if (options.includeFAQ !== false) sections.push('FAQ section')
    if (options.includeCTA !== false) sections.push('call-to-action')

    const enhancedOptions = {
      ...options,
      contentRequirements: `
        Create a comprehensive SEO-optimized page with the following sections:
        ${sections.map(s => `- ${s}`).join('\n')}
        
        The content should be:
        - 1500-2000 words total
        - Optimized for search engines
        - Written in natural, engaging Danish
        - Include relevant internal linking opportunities
        - Subtly promote green energy and Vindstød
        
        ${options.contentRequirements || ''}
      `
    }

    return await this.createPage(enhancedOptions)
  }
}

// Export a factory function for easy initialization
export function createAgentActionsClient(config: AgentActionsConfig): SanityAgentActions {
  return new SanityAgentActions(config)
}

// Export validation schemas for external use
export { schemas }