import { chromium } from 'playwright'
import { createClient } from '@sanity/client'

async function main() {
  const preview = process.env.PREVIEW_URL
  const slug = process.argv.includes('--slug') ? process.argv[process.argv.indexOf('--slug') + 1] : undefined
  if (!preview || !slug) {
    console.error('Usage: PREVIEW_URL=https://<preview>.vercel.app tsx scripts/pw-compare-sanity-vs-dom.ts --slug historiske-priser')
    process.exit(1)
  }

  // Sanity published client (read-only)
  const client = createClient({
    projectId: 'yxesi03x',
    dataset: 'production',
    apiVersion: '2025-01-01',
    useCdn: true,
  })

  // Fetch block list from Sanity
  const pageQuery = `*[_type == "page" && slug.current == $slug][0]{
    title,
    "blocks": contentBlocks[]{_type, _key}
  }`
  const sanityPage = await client.fetch(pageQuery, { slug })
  if (!sanityPage) {
    console.error('Sanity page not found for slug:', slug)
    process.exit(1)
  }

  const sanityBlocks: Array<{ _type: string; _key?: string }> = sanityPage.blocks || []

  // Visit preview and read DOM markers
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const url = `${preview}/${slug}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // small wait for hydration
  await page.waitForTimeout(1500)

  const domBlocks = await page.$$eval('[data-block-type]', (els) =>
    els.map((el) => ({
      type: el.getAttribute('data-block-type') || '',
      key: el.getAttribute('data-block-key') || '',
    }))
  )

  // Build diff
  const report: string[] = []
  const sanitySeq = sanityBlocks.map((b) => `${b._type}:${b._key || ''}`)
  const domSeq = domBlocks.map((b) => `${b.type}:${b.key}`)

  // Quick equality check
  const equal = JSON.stringify(sanitySeq) === JSON.stringify(domSeq)
  if (equal) {
    report.push('OK: Block sequence matches Sanity')
  } else {
    report.push('DIFF: Block sequence mismatch')
    report.push(`  Sanity: ${sanitySeq.join(' | ')}`)
    report.push(`  DOM   : ${domSeq.join(' | ')}`)
  }

  // Per-index comparison
  const maxLen = Math.max(sanityBlocks.length, domBlocks.length)
  for (let i = 0; i < maxLen; i++) {
    const s = sanityBlocks[i]
    const d = domBlocks[i]
    if (!s && d) {
      report.push(`Extra DOM block at #${i}: ${d.type}:${d.key}`)
    } else if (s && !d) {
      report.push(`Missing DOM block at #${i}: ${s._type}:${s._key || ''}`)
    } else if (s && d) {
      if (s._type !== d.type) report.push(`Type mismatch at #${i}: sanity=${s._type} dom=${d.type}`)
      if ((s._key || '') !== (d.key || '')) report.push(`Key mismatch at #${i}: sanity=${s._key || ''} dom=${d.key || ''}`)
    }
  }

  console.log('--- Sanity vs DOM Block Comparison ---')
  console.log(`Page: ${sanityPage.title} (/` + slug + ')')
  report.forEach((line) => console.log(line))

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
