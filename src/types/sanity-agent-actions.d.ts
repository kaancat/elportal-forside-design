import '@sanity/client'

/**
 * Type definitions for Sanity Agent Actions
 * 
 * Since Agent Actions is an experimental feature, these types
 * extend the existing Sanity client types.
 */

declare module '@sanity/client' {
  interface SanityClient {
    agentActions?: {
      generate: (options: GenerateOptions) => Promise<any>
      transform: (options: TransformOptions) => Promise<any>
      translate: (options: TranslateOptions) => Promise<any>
      prompt: (options: PromptOptions) => Promise<any>
      patch: (options: PatchOptions) => Promise<any>
    }
  }

  interface GenerateOptions {
    type: string
    instruction: string
    operation: 'create' | 'replace'
    references?: Array<{ _ref: string; _type: string }>
  }

  interface TransformOptions {
    id: string
    instruction: string
  }

  interface TranslateOptions {
    id: string
    targetLanguage: string
    fields?: string[]
  }

  interface PromptOptions {
    instruction: string
    context?: any
  }

  interface PatchOptions {
    id: string
    operations: Array<{
      set?: Record<string, any>
      unset?: string[]
      inc?: Record<string, number>
      dec?: Record<string, number>
    }>
  }
}