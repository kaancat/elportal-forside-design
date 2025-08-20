/**
 * Sanity Validate Content API Route - Next.js App Router
 * Validates content structure before submission to Sanity
 */

import { NextRequest, NextResponse } from 'next/server'
import { corsPublic } from '@/server/api-helpers'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 10
export const dynamic = 'force-dynamic'

/**
 * Content validation rules
 */
const VALIDATION_RULES = {
  page: {
    required: ['_type', 'title', 'slug'],
    types: {
      title: 'string',
      'slug.current': 'string',
      contentBlocks: 'array'
    }
  },
  pageSection: {
    required: ['_type', 'title'],
    types: {
      title: 'string',
      content: 'array',
      headerAlignment: ['left', 'center', 'right']
    }
  },
  hero: {
    required: ['_type', 'headline'],
    types: {
      headline: 'string',
      subheadline: 'string',
      image: 'object'
    }
  },
  valueProposition: {
    required: ['_type', 'heading'],
    types: {
      heading: 'string',
      valueItems: 'array'
    }
  },
  faqGroup: {
    required: ['_type', 'title', 'faqItems'],
    types: {
      title: 'string',
      faqItems: 'array'
    }
  }
}

/**
 * Validate field type
 */
function validateFieldType(value: any, expectedType: any): boolean {
  if (Array.isArray(expectedType)) {
    return expectedType.includes(value)
  }
  
  switch (expectedType) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number'
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    case 'object':
      return value !== null && typeof value === 'object' && !Array.isArray(value)
    default:
      return true
  }
}

/**
 * Get nested field value
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Validate content structure
 */
function validateContent(content: any): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!content || typeof content !== 'object') {
    return {
      valid: false,
      errors: ['Content must be an object'],
      warnings
    }
  }
  
  const contentType = content._type
  if (!contentType) {
    return {
      valid: false,
      errors: ['Content must have a _type field'],
      warnings
    }
  }
  
  const rules = VALIDATION_RULES[contentType as keyof typeof VALIDATION_RULES]
  if (!rules) {
    warnings.push(`No validation rules for type: ${contentType}`)
    return { valid: true, errors, warnings }
  }
  
  // Check required fields
  if (rules.required) {
    for (const field of rules.required) {
      const value = getNestedValue(content, field)
      if (value === undefined || value === null || value === '') {
        errors.push(`Required field missing: ${field}`)
      }
    }
  }
  
  // Check field types
  if (rules.types) {
    for (const [field, expectedType] of Object.entries(rules.types)) {
      const value = getNestedValue(content, field)
      if (value !== undefined && value !== null) {
        if (!validateFieldType(value, expectedType)) {
          errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${typeof value}`)
        }
      }
    }
  }
  
  // Recursive validation for nested content
  if (content.contentBlocks && Array.isArray(content.contentBlocks)) {
    content.contentBlocks.forEach((block: any, index: number) => {
      const blockValidation = validateContent(block)
      blockValidation.errors.forEach(err => 
        errors.push(`contentBlocks[${index}]: ${err}`)
      )
      blockValidation.warnings.forEach(warn => 
        warnings.push(`contentBlocks[${index}]: ${warn}`)
      )
    })
  }
  
  // Check for common mistakes
  if (contentType === 'pageSection' && content.content) {
    if (Array.isArray(content.content)) {
      content.content.forEach((item: any, index: number) => {
        if (item._type && !['block', 'image'].includes(item._type)) {
          warnings.push(`pageSection.content[${index}]: Only 'block' and 'image' types are allowed in content array`)
        }
      })
    }
  }
  
  // Check for deprecated fields
  if (content.heading && contentType === 'pageSection') {
    warnings.push(`'heading' field found but 'title' is expected for pageSection`)
  }
  
  if (content.title && contentType === 'hero') {
    warnings.push(`'title' field found but 'headline' is expected for hero`)
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * POST /api/sanity/validate-content - Validate content structure
 */
export async function POST(request: NextRequest) {
  try {
    const content = await request.json()
    
    // Validate the content
    const validation = validateContent(content)
    
    // Return validation results
    return NextResponse.json(
      {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        message: validation.valid 
          ? 'Content is valid' 
          : `Validation failed: ${validation.errors.join(', ')}`
      },
      {
        status: validation.valid ? 200 : 400,
        headers: corsPublic()
      }
    )
  } catch (error) {
    console.error('[ValidateContent] Validation error:', error)
    return NextResponse.json(
      { 
        valid: false,
        errors: ['Failed to parse content'],
        warnings: [],
        message: error instanceof Error ? error.message : 'Invalid JSON'
      },
      { 
        status: 400,
        headers: corsPublic()
      }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPublic()
  })
}