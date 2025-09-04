import { chromium, APIRequestContext } from 'playwright'

function toISOdk(d: Date) {
  const s = new Date(d.toLocaleString('sv-SE', { timeZone: 'Europe/Copenhagen' }))
  return s.toISOString().slice(0, 10)
}

async function checkApi(request: APIRequestContext, label: string, url: string) {
  const resp = await request.get(url)
  const xcache = resp.headers()['x-cache'] || 'none'
  const statusCode = resp.status()
  const ctype = resp.headers()['content-type'] || ''
  let records = 'n/a'
  let mcache = 'n/a'
  let status = 'n/a'
  if (ctype.includes('application/json')) {
    try {
      const j = await resp.json()
      records = Array.isArray(j?.records) ? String(j.records.length) : 'n/a'
      mcache = j?.metadata?.cache || 'n/a'
      status = j?.metadata?.status || 'none'
    } catch {
      // fall through to body snippet below
    }
  }
  // On non-JSON, show a tiny snippet for diagnostics
  if (records === 'n/a' && !ctype.includes('application/json')) {
    const text = await resp.text().catch(() => '')
    const snippet = text.replace(/\s+/g, ' ').slice(0, 120)
    console.log(`${label}: status=${statusCode} X-Cache=${xcache} (non-JSON: ${snippet}...)`)
    return
  }
  console.log(`${label}: status=${statusCode} X-Cache=${xcache} meta.cache=${mcache} status=${status} records=${records}`)
}

async function main() {
  const base = process.env.PREVIEW_URL || process.env.PW_BASE_URL
  if (!base) {
    console.error('Set PREVIEW_URL to your preview domain, e.g. https://<preview>.vercel.app')
    process.exit(1)
  }
  const today = toISOdk(new Date())

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  const request = await context.request

  console.log(`Base: ${base}`)
  console.log(`Date(DK): ${today}`)

  // Add protection cookies when available (support both bypass and session-based protection)
  const bypass = process.env.PROTECTION_BYPASS || process.env.VERCEL_PROTECTION_BYPASS
  const vercelJwt = process.env.VERCEL_JWT
  const vercelSession = process.env.VERCEL_SESSION
  try {
    const urlObj = new URL(base)
    const cookies: { name: string; value: string; domain: string; path: string }[] = []
    if (bypass) cookies.push({ name: '__vercel_protection_bypass', value: String(bypass), domain: urlObj.hostname, path: '/' })
    if (vercelJwt) cookies.push({ name: '_vercel_jwt', value: String(vercelJwt), domain: urlObj.hostname, path: '/' })
    if (vercelSession) cookies.push({ name: '_vercel_session', value: String(vercelSession), domain: urlObj.hostname, path: '/' })
    if (cookies.length) await context.addCookies(cookies)
  } catch {}

  // API checks DK1 (first should MISS and populate KV; second should HIT-KV)
  await checkApi(request, 'DK1 first (MISS expected)', `${base}/api/electricity-prices?region=DK1&date=${today}&debug=1`)
  await checkApi(request, 'DK1 second (HIT-KV expected)', `${base}/api/electricity-prices?region=DK1&date=${today}&debug=1`)

  // API checks DK2
  await checkApi(request, 'DK2 first (MISS expected)', `${base}/api/electricity-prices?region=DK2&date=${today}&debug=1`)
  await checkApi(request, 'DK2 second (HIT-KV expected)', `${base}/api/electricity-prices?region=DK2&date=${today}&debug=1`)

  // Forced no-cache probe to ensure protection doesn’t interfere
  await checkApi(request, 'DK2 forced MISS (nocache)', `${base}/api/electricity-prices?region=DK2&date=${today}&nocache&debug=1`)

  // Page check
  await page.goto(`${base}/elpriser`, { waitUntil: 'domcontentloaded' })
  // wait a little for hydration and data load
  await page.waitForTimeout(2500)
  // Look for a chart element (canvas or recharts svg)
  const hasChart = await page.locator('canvas, svg.recharts-surface, .recharts-wrapper').first().isVisible().catch(() => false)
  console.log(`Page /elpriser chart visible: ${hasChart}`)

  await browser.close()
}

main().catch(err => { console.error(err); process.exit(1) })
