import { NextRequest, NextResponse } from 'next/server'
import { cacheHeaders, corsPublic, retryWithBackoff, delay } from '@/server/api-helpers'
import { getSearchConsoleAccessToken } from '@/server/google'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

type InspectResult = any

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

function parseSitemapXml(xml: string): string[] {
  const urls: string[] = []
  const locRegex = /<loc>([^<]+)<\/loc>/gi
  let m: RegExpExecArray | null
  while ((m = locRegex.exec(xml))) {
    const loc = m[1].trim()
    if (loc) urls.push(loc)
  }
  return urls
}

async function collectUrlsFromSitemaps(sitemaps: string[], limit?: number): Promise<string[]> {
  const out: string[] = []
  for (const sm of sitemaps) {
    try {
      const xml = await fetchText(sm)
      const locs = parseSitemapXml(xml)
      // If this looks like an index sitemap (contains other sitemaps), keep only .xml/.gz from same domain
      const subSitemaps = locs.filter(u => /sitemap/i.test(u) && /\.xml(\.gz)?$/.test(u))
      if (subSitemaps.length && subSitemaps.length < 100) {
        for (const sub of subSitemaps) {
          const subXml = await fetchText(sub)
          const subLocs = parseSitemapXml(subXml).filter(u => !/\.xml(\.gz)?$/.test(u))
          for (const u of subLocs) {
            out.push(u)
            if (limit && out.length >= limit) return Array.from(new Set(out))
          }
        }
      } else {
        for (const u of locs) {
          if (/\.xml(\.gz)?$/.test(u)) continue
          out.push(u)
          if (limit && out.length >= limit) return Array.from(new Set(out))
        }
      }
    } catch (e) {
      console.warn('[Audit] Failed to read sitemap', sm, e)
    }
  }
  return Array.from(new Set(out))
}

async function inspectUrl(token: string, siteUrl: string, inspectionUrl: string): Promise<InspectResult> {
  return retryWithBackoff(async () => {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ siteUrl, inspectionUrl, languageCode: 'en-US' })
    })
    const data = await res.json()
    if (!res.ok) throw Object.assign(new Error('inspect failed'), { status: res.status, data })
    return data
  }, 3, 1000)
}

function summarize(results: InspectResult[]) {
  const summary = {
    total: results.length,
    indexed: 0,
    notIndexed: 0,
    byCoverage: {} as Record<string, number>,
    byVerdict: {} as Record<string, number>,
    byPageFetch: {} as Record<string, number>,
    byRobots: {} as Record<string, number>,
    samples: {} as Record<string, string[]>,
  }

  function inc(map: Record<string, number>, key: string) {
    map[key] = (map[key] || 0) + 1
  }
  function sample(key: string, url: string) {
    const arr = summary.samples[key] || (summary.samples[key] = [])
    if (arr.length < 10) arr.push(url)
  }

  for (const r of results) {
    const s = r?.inspectionResult?.indexStatusResult
    const url = r?.inspectionResult?.inspectionResultLink || r?.inspectionResult?.verdict || 'unknown'
    if (!s) continue
    const coverage = s.coverageState || 'UNKNOWN'
    const verdict = s.verdict || 'VERDICT_UNKNOWN'
    const fetchState = s.pageFetchState || 'FETCH_UNKNOWN'
    const robots = s.robotsTxtState || 'ROBOTS_UNKNOWN'
    const indexed = s.verdict === 'PASS' || s.indexingState === 'INDEXING_ALLOWED'
    if (indexed) summary.indexed++
    else summary.notIndexed++
    inc(summary.byCoverage, coverage)
    inc(summary.byVerdict, verdict)
    inc(summary.byPageFetch, fetchState)
    inc(summary.byRobots, robots)
    sample(`${coverage}`, s?.link || r?.inspectionResult?.inspectedUrl || url)
  }
  return summary
}

export async function POST(request: NextRequest) {
  const hasSecret = request.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')
  if (!hasSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsPublic() })
  }

  let body: any = {}
  try { body = await request.json() } catch {}
  const siteUrl: string | undefined = body.siteUrl
  const sitemapUrls: string[] = Array.isArray(body.sitemaps) ? body.sitemaps : (body.sitemap ? [body.sitemap] : [])
  const maxUrls: number | undefined = body.maxUrls
  const concurrency = Math.min(Number(body.concurrency) || 2, 5)

  if (!siteUrl) {
    return NextResponse.json({ error: 'Missing siteUrl' }, { status: 400, headers: corsPublic() })
  }

  try {
    const token = await getSearchConsoleAccessToken(true)

    let urls: string[] = []
    if (sitemapUrls.length) {
      urls = await collectUrlsFromSitemaps(sitemapUrls, maxUrls)
    } else {
      // If no sitemap provided, try common paths
      const guesses = ['sitemap.xml', 'sitemap_index.xml']
      const base = siteUrl.startsWith('sc-domain:') ? `https://${siteUrl.replace('sc-domain:', '')}/` : siteUrl
      const candidates = guesses.map(g => new URL(g, base).toString())
      urls = await collectUrlsFromSitemaps(candidates, maxUrls)
    }

    if (!urls.length) {
      return NextResponse.json({ error: 'No URLs found from sitemap(s)' }, { status: 400, headers: corsPublic() })
    }

    const results: InspectResult[] = []
    let index = 0
    async function worker() {
      while (index < urls.length) {
        const i = index++
        const u = urls[i]
        try {
          const r = await inspectUrl(token, siteUrl, u)
          results.push(r)
        } catch (e) {
          results.push({ error: true, url: u, message: (e as any).message, status: (e as any).status })
        }
        // be nice to API
        await delay(200)
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () => worker())
    await Promise.all(workers)

    const summary = summarize(results)
    return NextResponse.json({ ok: true, inspected: urls.length, summary, sample: summary.samples }, {
      headers: { ...corsPublic(), ...cacheHeaders({ sMaxage: 60, swr: 300 }) }
    })
  } catch (err: any) {
    console.error('[GSC Audit] Error:', err)
    return NextResponse.json({ error: 'Audit failed', details: err?.message || String(err) }, { status: 502, headers: corsPublic() })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsPublic() })
}

