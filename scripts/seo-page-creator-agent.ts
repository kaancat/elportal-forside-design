#!/usr/bin/env node
import { createPageWithValidation, validateContent, generateKey } from './create-seo-page-with-validation'
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

// Agent Actions client for AI operations
const agentClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX',
  token: process.env.SANITY_API_TOKEN
})

/**
 * SEO Page Creator Agent - Creates optimized pages with automatic validation
 */
export class SEOPageCreatorAgent {
  private schemaId = '_.schemas.default'
  
  /**
   * Researches a topic and generates comprehensive Danish SEO content
   */
  async researchTopic(topic: string, keywords: string[] = []) {
    console.log(`🔍 Researching topic: ${topic}\n`)
    
    const research = await agentClient.agent.action.prompt({
      instruction: `Research this topic for a Danish electricity price comparison website:
        Topic: ${topic}
        Keywords: ${keywords.join(', ')}
        
        Provide comprehensive research including:
        1. Main pain points for Danish consumers
        2. Key information they need
        3. Competitor content analysis
        4. Recommended content structure
        5. Danish SEO keywords to target
        
        Return as detailed JSON.`,
      format: 'json'
    })
    
    return research
  }
  
  /**
   * Generates complete page content based on research
   */
  async generatePageContent(
    topic: string,
    slug: string,
    keywords: string[] = [],
    research?: any
  ) {
    console.log(`✍️  Generating comprehensive Danish content for: ${topic}\n`)
    
    // If no research provided, do quick research first
    if (!research) {
      research = await this.researchTopic(topic, keywords)
    }
    
    const contentGeneration = await agentClient.agent.action.prompt({
      instruction: `Create a comprehensive Danish SEO page about: ${topic}
        
        Requirements:
        1. 1500-2000 words of high-quality Danish content
        2. Natural keyword integration: ${keywords.join(', ')}
        3. Subtle promotion of Vindstød as premium green energy provider
        4. Include practical tips and local Danish context
        5. Structure with multiple content sections
        
        Use this research: ${JSON.stringify(research)}
        
        CRITICAL: Return complete Sanity page structure with:
        - _type: "page"
        - title, slug, seoTitle, seoDescription
        - contentBlocks array with varied content types
        
        For hero blocks use "headline" and "subheadline"
        For valueItem use "heading" not "title"
        For featureItem use "title" not "name"
        
        Return the complete page object as JSON.`,
      format: 'json'
    })
    
    // Ensure proper structure
    const pageContent = {
      _id: `page.${slug}`,
      _type: 'page',
      slug: { current: slug },
      ...contentGeneration
    }
    
    return pageContent
  }
  
  /**
   * Creates a complete SEO-optimized page with validation
   */
  async createSEOPage(
    topic: string,
    slug: string,
    keywords: string[] = [],
    options: {
      research?: boolean
      analyze?: boolean
    } = {}
  ) {
    console.log('🚀 SEO Page Creator Agent - Starting\n')
    console.log(`📋 Topic: ${topic}`)
    console.log(`🔗 Slug: ${slug}`)
    console.log(`🎯 Keywords: ${keywords.join(', ')}\n`)
    
    try {
      // Step 1: Research (optional)
      let research
      if (options.research !== false) {
        research = await this.researchTopic(topic, keywords)
        console.log('✅ Research completed\n')
      }
      
      // Step 2: Generate content
      const pageContent = await this.generatePageContent(topic, slug, keywords, research)
      console.log('✅ Content generated\n')
      
      // Step 3: Validate and create with Agent Actions
      const result = await createPageWithValidation(pageContent)
      
      if (result.success) {
        console.log('\n🎉 Page created successfully!')
        
        // Step 4: Optional post-creation analysis
        if (options.analyze) {
          await this.analyzeAndSuggestImprovements(result.pageId)
        }
        
        return {
          success: true,
          pageId: result.pageId,
          url: `/${slug}`,
          validation: result.validation,
          seoAnalysis: result.seoAnalysis
        }
      } else {
        throw new Error(result.error || 'Page creation failed')
      }
      
    } catch (error: any) {
      console.error('❌ SEO Page creation failed:', error.message)
      
      // Try to provide helpful recovery suggestions
      const recovery = await agentClient.agent.action.prompt({
        instruction: `The page creation failed with: "${error.message}"
          
          Suggest specific fixes for creating a page about: ${topic}
          Focus on Sanity schema requirements and validation.`,
      })
      
      console.log('\n💡 Recovery suggestions:')
      console.log(recovery)
      
      return {
        success: false,
        error: error.message,
        recovery
      }
    }
  }
  
  /**
   * Analyzes existing page and suggests improvements
   */
  async analyzeAndSuggestImprovements(pageId: string) {
    console.log('\n🔬 Analyzing page for improvements...')
    
    const improvements = await agentClient.agent.action.prompt({
      instruction: `Analyze this Danish electricity page and suggest improvements:
        
        Check for:
        1. SEO optimization (title, meta, keywords)
        2. Content completeness and quality
        3. Vindstød positioning effectiveness
        4. User value and engagement
        5. Technical SEO issues
        
        Provide specific, actionable recommendations.`,
      instructionParams: {
        page: {
          type: 'document',
          documentId: pageId
        }
      }
    })
    
    console.log('\n📈 Improvement suggestions:')
    console.log(improvements)
    
    return improvements
  }
}

// CLI interface
async function main() {
  const agent = new SEOPageCreatorAgent()
  
  // Parse command line arguments
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: npm run seo-agent <topic> <slug> [keywords]')
    console.log('Example: npm run seo-agent "varmepumper og elpriser" "varmepumper-elpriser" "varmepumpe,elpriser,spareråd"')
    process.exit(1)
  }
  
  const topic = args[0]
  const slug = args[1]
  const keywords = args[2] ? args[2].split(',') : []
  
  await agent.createSEOPage(topic, slug, keywords, {
    research: true,
    analyze: true
  })
}

// Export for use in other scripts
export default SEOPageCreatorAgent

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}