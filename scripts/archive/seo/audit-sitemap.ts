import fetch from 'node-fetch'

// Simple SEO audit: fetch sitemap, then fetch each URL and extract basic tags
// Run: npx tsx scripts/seo/audit-sitemap.ts [baseUrl]

const BASE = process.argv[2] || process.env.SITE_URL || 'https://dinelportal.dk'

function extractTag(html: string, tag: string): string | null {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'))
  return m ? m[1].trim() : null
}

function extractMeta(html: string, name: string): string | null {
  const m = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'))
  return m ? m[1].trim() : null
}

function extractCanonical(html: string): string | null {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  return m ? m[1].trim() : null
}

async function main() {
  const sitemapUrl = `${BASE}/sitemap.xml`
  const sm = await fetch(sitemapUrl)
  if (!sm.ok) {
    console.error('Failed to fetch sitemap:', sm.status, await sm.text())
    process.exit(1)
  }
  const xml = await sm.text()
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1])
  console.log(`Found ${urls.length} URLs in sitemap`)

  const results: any[] = []
  for (const url of urls.slice(0, 50)) {
    try {
      const res = await fetch(url, { redirect: 'manual' })
      const status = res.status
      const html = await res.text()
      const title = extractTag(html, 'title')
      const desc = extractMeta(html, 'description')
      const robots = extractMeta(html, 'robots')
      const canonical = extractCanonical(html)
      const h1 = extractTag(html, 'h1')
      results.push({ url, status, title, desc, robots, canonical, h1 })
    } catch (e) {
      results.push({ url, error: String(e) })
    }
  }

  console.table(results)
}

main().catch(e => { console.error(e); process.exit(1) })

