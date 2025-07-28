import { createClient, SanityClient } from '@sanity/client'
import { z } from 'zod'
import * as schemas from './sanity-schemas.zod'

// Type definitions
interface AIProvider {
  generateContent(prompt: string, options?: { temperature?: number }): Promise<string>
}

interface GenerateOptions {
  temperature?: number
  maxRetries?: number
  includeExamples?: boolean
}

interface SchemaInfo {
  name: string
  requiredFields: string[]
  fieldDescriptions: Record<string, string>
  examples?: any[]
}

// Schema metadata - maps schema names to their Zod schemas and info
const schemaRegistry = new Map<string, { schema: z.ZodSchema, info: SchemaInfo }>([
  ['hero', {
    schema: schemas.HeroSchema,
    info: {
      name: 'hero',
      requiredFields: ['headline', 'subheadline'],
      fieldDescriptions: {
        headline: 'Main heading text (NOT title!)',
        subheadline: 'Supporting text below headline (NOT subtitle!)',
        image: 'Optional image object with asset reference'
      }
    }
  }],
  ['valueProposition', {
    schema: schemas.ValuePropositionSchema,
    info: {
      name: 'valueProposition',
      requiredFields: ['title', 'items'],
      fieldDescriptions: {
        title: 'Section title',
        items: 'Array of value items with icon, heading (NOT title!), and description'
      }
    }
  }],
  ['faqGroup', {
    schema: schemas.FaqGroupSchema,
    info: {
      name: 'faqGroup',
      requiredFields: ['title', 'faqItems'],
      fieldDescriptions: {
        title: 'FAQ section title',
        faqItems: 'Array of FAQ items (inline objects, NOT references!)'
      }
    }
  }],
  // Add more schemas as needed
])

export class SanityAIContentGenerator {
  constructor(
    private sanityClient: SanityClient,
    private aiProvider: AIProvider
  ) {}

  /**
   * Generate content for a specific schema type
   */
  async generate(
    schemaType: string,
    instruction: string,
    options: GenerateOptions = {}
  ): Promise<any> {
    const schemaEntry = schemaRegistry.get(schemaType)
    if (!schemaEntry) {
      throw new Error(`Unknown schema type: ${schemaType}`)
    }

    const { schema, info } = schemaEntry
    const maxRetries = options.maxRetries || 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create schema-aware prompt
        const prompt = this.createPrompt(info, instruction, attempt > 1)
        
        // Generate content with AI
        const jsonString = await this.aiProvider.generateContent(prompt, {
          temperature: options.temperature || 0.3
        })
        
        // Parse JSON
        const content = JSON.parse(jsonString)
        
        // Add required Sanity fields
        content._type = schemaType
        content._key = this.generateKey()
        
        // Validate with Zod
        const validated = schema.parse(content)
        
        console.log(`✅ Generated valid ${schemaType} content on attempt ${attempt}`)
        return validated
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message)
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate valid content after ${maxRetries} attempts: ${error.message}`)
        }
        
        // Add error to instruction for next attempt
        if (error instanceof z.ZodError) {
          instruction += `\n\nPrevious attempt had validation errors: ${JSON.stringify(error.errors, null, 2)}`
        }
      }
    }
  }

  /**
   * Create and save content in one operation
   */
  async createContent(
    schemaType: string,
    instruction: string,
    options: GenerateOptions = {}
  ): Promise<any> {
    const content = await this.generate(schemaType, instruction, options)
    return this.sanityClient.create(content)
  }

  /**
   * Enhance existing content
   */
  async enhanceContent(
    documentId: string,
    enhancementInstruction: string
  ): Promise<any> {
    // Fetch existing document
    const existing = await this.sanityClient.getDocument(documentId)
    if (!existing) {
      throw new Error(`Document ${documentId} not found`)
    }

    const schemaEntry = schemaRegistry.get(existing._type)
    if (!schemaEntry) {
      throw new Error(`Unknown schema type: ${existing._type}`)
    }

    const prompt = `
You are enhancing existing Sanity CMS content. 

Current content:
${JSON.stringify(existing, null, 2)}

Enhancement instruction: ${enhancementInstruction}

Return the COMPLETE enhanced document with all fields preserved.
Maintain the same structure and field names.
Only modify content according to the instruction.
`

    const enhanced = await this.aiProvider.generateContent(prompt, { temperature: 0.4 })
    const parsed = JSON.parse(enhanced)
    
    // Validate enhanced content
    const validated = schemaEntry.schema.parse(parsed)
    
    // Update document
    return this.sanityClient
      .patch(documentId)
      .set(validated)
      .commit()
  }

  /**
   * Create schema-aware prompt
   */
  private createPrompt(info: SchemaInfo, instruction: string, includeErrors = false): string {
    return `
You are creating content for a Sanity CMS. You MUST follow the schema EXACTLY.

SCHEMA: ${info.name}
REQUIRED FIELDS: ${info.requiredFields.join(', ')}

FIELD DESCRIPTIONS:
${Object.entries(info.fieldDescriptions).map(([field, desc]) => `- ${field}: ${desc}`).join('\n')}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Include all required fields
3. Use EXACT field names as specified
4. For 'hero': use 'headline' NOT 'title', 'subheadline' NOT 'subtitle'
5. For 'valueItem': use 'heading' NOT 'title'
6. For arrays, include at least one item
7. For Portable Text fields, use proper block structure

${info.examples ? `\nEXAMPLE:\n${JSON.stringify(info.examples[0], null, 2)}` : ''}

INSTRUCTION: ${instruction}

Remember: Return ONLY the JSON object, no other text.
`
  }

  /**
   * Generate unique key for Sanity
   */
  private generateKey(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}

/**
 * Mock AI Provider for testing
 * Replace with actual OpenAI/Anthropic implementation
 */
export class MockAIProvider implements AIProvider {
  async generateContent(prompt: string, options?: { temperature?: number }): Promise<string> {
    // Simulate AI response based on prompt
    if (prompt.includes('hero')) {
      return JSON.stringify({
        headline: 'Fremtidens Grønne Energi',
        subheadline: 'Skift til vedvarende energi og bliv en del af den bæredygtige fremtid'
      })
    }
    
    if (prompt.includes('faqGroup')) {
      return JSON.stringify({
        title: 'Ofte stillede spørgsmål',
        faqItems: [
          {
            _type: 'faqItem',
            _key: 'faq1',
            question: 'Hvad er spotpris?',
            answer: [{
              _type: 'block',
              _key: 'block1',
              children: [{
                _type: 'span',
                _key: 'span1',
                text: 'Spotpris er den aktuelle markedspris for el.'
              }]
            }]
          }
        ]
      })
    }
    
    return '{}'
  }
}

/**
 * Factory function to create AI generator
 */
export function createSanityAIGenerator(
  sanityClient: SanityClient,
  aiProvider: AIProvider
): SanityAIContentGenerator {
  return new SanityAIContentGenerator(sanityClient, aiProvider)
}