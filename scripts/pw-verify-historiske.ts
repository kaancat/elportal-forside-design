import { chromium } from 'playwright'

async function main() {
  const base = process.env.PREVIEW_URL || process.env.PW_BASE_URL
  if (!base) {
    console.error('Set PREVIEW_URL to your preview domain, e.g. https://<preview>.vercel.app')
    process.exit(1)
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()

  // Attach protection/session cookies if provided
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

  const page = await context.newPage()
  const url = `${base}/historiske-priser`
  console.log(`Open: ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  // Detect errors
  const errorTexts = [
    'Kunne ikke hente prisdata',
    'Data ikke tilgængelig',
  ]
  let errorVisible = false
  let errorCount = 0
  for (const t of errorTexts) {
    const loc = page.getByText(t, { exact: false })
    errorCount += await loc.count()
    if (!errorVisible) errorVisible = await loc.first().isVisible().catch(() => false)
  }

  // Detect charts
  const hasChart = await page.locator('canvas, svg.recharts-surface, .recharts-wrapper').first().isVisible().catch(() => false)

  console.log(`historiske-priser chart visible: ${hasChart} errors-visible: ${errorVisible} errors-count: ${errorCount}`)

  await browser.close()
}

main().catch(err => { console.error(err); process.exit(1) })
