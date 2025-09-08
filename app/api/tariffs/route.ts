/**
 * Network Tariffs API Route
 * Returns processed tariff data (24 hourly rates, average, type) for a given GLN
 * Backed by EnergiDataService DatahubPricelist with server-side caching and retries
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  readKvJson,
  setKvJsonWithFallback,
  retryWithBackoff,
  cacheHeaders,
  fetchWithTimeout,
  createLRUCache,
  corsPublic,
} from '@/server/api-helpers'
import { z } from 'zod'

// Configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 // 24 hours
const FALLBACK_TTL = 48 * 60 * 60 // 48 hours
const memoryCache = createLRUCache<any>(CACHE_TTL * 1000)

// Schemas
const glnSchema = z.string().regex(/^\d{13}$/, 'GLN must be 13 digits')
const chargeCodeSchema = z.string().min(2).max(16).optional()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const gln = searchParams.get('gln')
    const chargeCode = searchParams.get('chargeCode') || undefined

    // Validate params
    const glnResult = glnSchema.safeParse(gln)
    const codeResult = chargeCodeSchema.safeParse(chargeCode)
    if (!glnResult.success || !codeResult.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Invalid gln or chargeCode',
          details: {
            gln: glnResult.success ? null : glnResult.error.issues,
            chargeCode: codeResult.success ? null : codeResult.error.issues,
          }
        }
      }, { status: 400 })
    }

    // Keys
    const cacheKey = `tariff:${gln}:${chargeCode || 'default'}`
    const latestKey = `tariff:${gln}`

    // 1) KV cache
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      return NextResponse.json(kvCached, {
        headers: { ...cacheHeaders({ sMaxage: CACHE_TTL, swr: FALLBACK_TTL }), ...corsPublic(), 'X-Cache': 'HIT-KV' }
      })
    }

    // 2) Memory cache
    const memCached = memoryCache.get(cacheKey)
    if (memCached) {
      return NextResponse.json(memCached, {
        headers: { ...cacheHeaders({ sMaxage: CACHE_TTL, swr: FALLBACK_TTL }), ...corsPublic(), 'X-Cache': 'HIT-MEMORY' }
      })
    }

    // 3) Fetch from EnergiDataService with retry
    const data = await retryWithBackoff(async () => {
      const code = chargeCode || 'DT_C_01' // Default residential charge code
      const filter = {
        ChargeType: 'D03',
        GLN_Number: gln,
        ChargeTypeCode: code,
      }

      const apiUrl = new URL('https://api.energidataservice.dk/dataset/DatahubPricelist')
      apiUrl.searchParams.set('filter', JSON.stringify(filter))
      apiUrl.searchParams.set('sort', 'ValidFrom desc')
      apiUrl.searchParams.set('limit', '10')

      const response = await fetchWithTimeout(apiUrl.toString(), { timeout: 8000 })
      if (!response.ok) {
        // Return empty-like but allow retry on 429/503 via retryWithBackoff
        if (response.status === 404 || response.status === 400) {
          return { records: [] }
        }
        throw new Error(`Upstream error ${response.status}`)
      }
      return await response.json()
    }, 3, 1000)

    const records = data.records || []
    const now = new Date()
    const current = records.find((r: any) => {
      const from = new Date(r.ValidFrom)
      const to = r.ValidTo ? new Date(r.ValidTo) : null
      return now >= from && (!to || now < to)
    }) || records[0] // Fallback to most recent if none strictly valid

    if (!current) {
      // Cache empty for short time to prevent hammering
      const empty = { gln, provider: '', validFrom: null, validTo: null, hourlyRates: new Array(24).fill(0), averageRate: 0, tariffType: 'flat', season: 'year-round' }
      memoryCache.set(cacheKey, empty)
      await setKvJsonWithFallback(cacheKey, latestKey, empty, 900, 1800)
      return NextResponse.json(empty, { headers: { ...cacheHeaders({ sMaxage: 900 }), ...corsPublic(), 'X-Cache': 'MISS' } })
    }

    // Build TariffData
    const hourlyRates: number[] = []
    for (let i = 1; i <= 24; i++) {
      hourlyRates.push(current[`Price${i}`] ?? 0)
    }
    const uniqueRates = new Set(hourlyRates)
    const tariffType: 'time-of-use' | 'flat' = uniqueRates.size === 1 ? 'flat' : 'time-of-use'

    const validFrom = new Date(current.ValidFrom)
    const month = validFrom.getMonth()
    const season: 'winter' | 'summer' | 'year-round' = month >= 3 && month < 9 ? 'summer' : 'winter'

    // Weighted average using DEFAULT_CONSUMPTION_PATTERN
    const lowHours = [0, 1, 2, 3, 4, 5]
    const peakHours = [17, 18, 19, 20]
    const highHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21, 22, 23]
    const avg = (arr: number[]) => arr.reduce((s, h) => s + hourlyRates[h], 0) / arr.length
    const averageRate = avg(lowHours) * 0.25 + avg(highHours) * 0.60 + avg(peakHours) * 0.15

    const result = {
      gln,
      provider: current.ChargeOwner,
      validFrom,
      validTo: current.ValidTo ? new Date(current.ValidTo) : null,
      hourlyRates,
      averageRate,
      tariffType,
      season,
    }

    // Cache and return
    memoryCache.set(cacheKey, result)
    await setKvJsonWithFallback(cacheKey, latestKey, result, CACHE_TTL, FALLBACK_TTL)
    return NextResponse.json(result, { headers: { ...cacheHeaders({ sMaxage: CACHE_TTL, swr: FALLBACK_TTL }), ...corsPublic(), 'X-Cache': 'MISS' } })
  } catch (error) {
    console.error('[Tariffs] Unexpected error:', error)
    return NextResponse.json({
      gln: null,
      provider: '',
      validFrom: null,
      validTo: null,
      hourlyRates: new Array(24).fill(0),
      averageRate: 0,
      tariffType: 'flat',
      season: 'year-round',
      status: 'error',
    }, { headers: { ...cacheHeaders({ sMaxage: 60 }), ...corsPublic(), 'X-Cache': 'ERROR' } })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}


