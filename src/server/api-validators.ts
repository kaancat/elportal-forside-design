/**
 * Input validation schemas for API routes
 * Uses zod for runtime validation and type inference
 */

import { z } from 'zod'

/**
 * Valid regions for electricity data
 */
export const regionSchema = z.enum(['DK1', 'DK2', 'Danmark']).describe('Price area or region')

/**
 * Date format validation (YYYY-MM-DD) with calendar validation
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      if (!date) return true // Optional dates are allowed
      const d = new Date(date + 'T00:00:00Z')
      // Check if date is valid and matches the input
      return !isNaN(d.getTime()) && d.toISOString().startsWith(date)
    },
    'Invalid calendar date'
  )
  .optional()
  .describe('Date in YYYY-MM-DD format')

/**
 * Aggregation types for data grouping
 */
export const aggregationSchema = z
  .enum(['5min', 'hourly', 'daily', 'monthly', 'latest'])
  .optional()
  .default('hourly')
  .describe('Data aggregation level')

/**
 * Time view windows for data ranges
 */
export const viewSchema = z
  .enum(['24h', '7d', '30d', 'month'])
  .optional()
  .default('24h')
  .describe('Time window for data')

/**
 * Municipality code validation (3 digits)
 */
export const municipalitySchema = z
  .string()
  .regex(/^\d{3}$/, 'Municipality code must be 3 digits')
  .optional()
  .describe('Municipality code')

/**
 * Consumer type for consumption data
 */
export const consumerTypeSchema = z
  .enum(['private', 'industry', 'all'])
  .optional()
  .default('all')
  .describe('Consumer type filter')

// Composite schemas for specific API endpoints

/**
 * Electricity prices endpoint validation
 */
export const electricityPricesSchema = z.object({
  region: regionSchema.optional().default('DK2'),
  area: regionSchema.optional(), // Alternative parameter name
  date: dateSchema,
  endDate: dateSchema,
})

/**
 * CO2 emissions endpoint validation
 */
export const co2EmissionsSchema = z.object({
  region: regionSchema.optional().default('Danmark'),
  date: dateSchema,
  aggregation: aggregationSchema,
})

/**
 * Consumption map endpoint validation
 */
export const consumptionMapSchema = z.object({
  consumerType: consumerTypeSchema,
  aggregation: aggregationSchema.or(z.literal('latest')), // Handle 'latest' from Sanity
  view: viewSchema,
  municipality: municipalitySchema,
})

/**
 * Energy forecast endpoint validation
 */
export const energyForecastSchema = z.object({
  region: regionSchema.optional().default('Danmark'),
  type: z.enum(['wind', 'solar', 'all']).optional().default('all'),
  hours: z.string()
    .regex(/^\d+$/)
    .refine(
      (val) => {
        const num = parseInt(val, 10)
        return num > 0 && num <= 168 // Max 1 week
      },
      'Hours must be between 1 and 168'
    )
    .optional()
    .default('24'),
})

/**
 * Monthly production endpoint validation
 */
export const monthlyProductionSchema = z.object({
  year: z.string().regex(/^\d{4}$/).optional(),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/).optional(),
  productionType: z.enum(['wind', 'solar', 'thermal', 'nuclear', 'hydro', 'all']).optional().default('all'),
})

/**
 * Helper function to validate request parameters
 * @param schema - Zod schema to validate against
 * @param params - Parameters to validate (from searchParams)
 * @returns Validated and typed parameters
 * @throws ZodError if validation fails
 */
export function validateParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | null>
): z.infer<T> {
  // Convert null values to undefined for optional fields
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)
  
  return schema.parse(cleanParams)
}

/**
 * Safe version that returns validation result without throwing
 */
export function safeValidateParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | null>
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)
  
  const result = schema.safeParse(cleanParams)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error }
  }
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(err.message)
  })
  
  return formatted
}