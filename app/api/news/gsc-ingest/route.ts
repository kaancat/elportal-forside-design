import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getSearchConsoleAccessToken } from '@/server/google'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// -------------------------------
// Utilities
// -------------------------------
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96)
}

function normalizeQuery(q: string): string {
  return (q || '')
    .toLowerCase()
    .replace(/[^a-z0-9æøå\s-]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSanityClient() {
  const token = process.env.SANITY_API_TOKEN
  if (!token) throw new Error('SANITY_API_TOKEN is not configured')
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01',
    token,
    useCdn: false,
  })
}

function classifyTopic(text: string): string | null {
  const cats: { label: string; patterns: RegExp[] }[] = [
    { label: 'Elpriser', patterns: [/\belpris/i, /\belpriser/i, /\bspotpris/i, /\bfastpris/i] },
    { label: 'Tariffer', patterns: [/\btarif/i, /\bnettarif/i, /transporttarif/i] },
    { label: 'Afgifter', patterns: [/\bafgift/i, /\belafgift/i] },
    { label: 'CO2', patterns: [/\bco2\b/i, /udledning/i, /emission/i] },
    { label: 'Vind', patterns: [/\bvind\b/i, /havvind/i, /vindm[øo]lle/i] },
    { label: 'Solceller', patterns: [/solcelle/i, /solceller/i, /\bsol\b/i, /pv/i] },
    { label: 'Elbiler', patterns: [/\belbil/i, /elbiler/i, /oplad/i, /ladeboks/i] },
    { label: 'Varmepumper', patterns: [/varmepumpe/i, /varmepumper/i, /cop\b/i] },
    { label: 'Batterier', patterns: [/batteri/i, /lagring/i, /energilagring/i, /storage/i] },
    { label: 'El-net', patterns: [/(el-?net|netudbyg|get|transmissions|balancer|balancering|kabler|netkapacitet)/i] },
    { label: 'Power-to-X', patterns: [/power ?to ?x/i, /\bptx\b/i] },
    { label: 'Forbrug', patterns: [/\bforbrug\b/i, /elforbrug/i, /kwh/i] },
    { label: 'Prissikring', patterns: [/fastpris/i, /prisloft/i, /indk[øo]bsaftale/i] },
  ]
  for (const c of cats) if (c.patterns.some(rx => rx.test(text))) return c.label
  return null
}

function getAIClient(): { type: 'openai' | 'anthropic'; client: any } {
  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (openaiKey) return { type: 'openai', client: new OpenAI({ apiKey: openaiKey }) }
  if (anthropicKey) return { type: 'anthropic', client: new Anthropic({ apiKey: anthropicKey }) }
  throw new Error('Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is configured')
}

// Convert markdown-ish paragraph array into Sanity Portable Text blocks with link markDefs
function paragraphsToPortableText(paragraphs: string[]) {
  const blocks: any[] = []
  for (const para of paragraphs) {
    const children: any[] = []
    const markDefs: any[] = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = linkRegex.exec(para)) !== null) {
      const [full, text, href] = m
      if (m.index > last) {
        const before = para.slice(last, m.index)
        if (before) children.push({ _type: 'span', _key: Math.random().toString(36).slice(2), text: before, marks: [] })
      }
      const key = Math.random().toString(36).slice(2)
      markDefs.push({ _key: key, _type: 'link', href })
      children.push({ _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [key] })
      last = m.index + full.length
    }
    if (last < para.length) {
      const rest = para.slice(last)
      if (rest) children.push({ _type: 'span', _key: Math.random().toString(36).slice(2), text: rest, marks: [] })
    }
    if (children.length) {
      blocks.push({ _type: 'block', _key: Math.random().toString(36).slice(2), style: 'normal', children, markDefs })
    }
  }
  return [{ _type: 'richTextSection', _key: Math.random().toString(36).slice(2), title: undefined, content: blocks }]
}

// -------------------------------
// AI: Two-step keyword article generation (outline → expanded content)
// -------------------------------
async function generateKeywordArticle(keyword: string, opts?: { minWords?: number }) {
  const minWords = Math.max(500, opts?.minWords || 800)
  const { type, client } = getAIClient()
  const sys = `Du er journalist hos DinElPortal. Skriv på dansk til almindelige husholdninger. Fokus: elpriser, forbrug, grøn energi og konkrete råd.`

  // Step 1: Outline & metadata
  const outlineUser = `Lav en artikel-plan for emnet: "${keyword}".
Returner KUN JSON med:
{
  "title": "SEO-titel (maks 60 tegn)",
  "meta": "Meta description (maks 160 tegn)",
  "h2": ["Sektion 1", "Sektion 2", "Sektion 3", "Sektion 4"],
  "bullets": {
    "Sektion 1": ["punkt", "punkt"],
    "Sektion 2": ["punkt", "punkt"],
    "Sektion 3": ["punkt", "punkt"],
    "Sektion 4": ["punkt", "punkt"]
  }
}`

  let outlineText = ''
  if (type === 'openai') {
    const r = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.4, messages: [
      { role: 'system', content: sys },
      { role: 'user', content: outlineUser }
    ]})
    outlineText = r.choices[0]?.message?.content || ''
  } else {
    const r = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1200, temperature: 0.4, messages: [
      { role: 'user', content: outlineUser }
    ]})
    outlineText = r.content[0].type === 'text' ? r.content[0].text : ''
  }

  const outlineJsonMatch = outlineText.match(/\{[\s\S]*\}$/)
  const outline = outlineJsonMatch ? JSON.parse(outlineJsonMatch[0]) : JSON.parse(outlineText)

  // Step 2: Expand content with strict internal links and word target
  const expandUser = `Skriv en dansk artikel baseret på denne plan:
${JSON.stringify(outline)}

KRAV:
- Minimum ${minWords} ord totalt
- Brug lange afsnit (70-120 ord) for hver H2
- Indsæt links i markdown-format:
  - Mindst 2 links til [de aktuelle elpriser](/elpriser)
  - Mindst 1 link til [sammenlign danske eludbydere](/el-udbydere)
- Ingen "Kilde:"-etiketter. Ingen overdrevne påstande uden forbehold.
Returner KUN JSON:
{
  "title": "...",
  "description": "...",
  "sections": [ { "heading": "H2-overskrift", "paragraphs": ["langt afsnit", "langt afsnit"] } ]
}`

  let expandedText = ''
  if (type === 'openai') {
    const r = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.6, messages: [
      { role: 'system', content: sys },
      { role: 'user', content: expandUser }
    ], max_tokens: 8192 })
    expandedText = r.choices[0]?.message?.content || ''
  } else {
    const r = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', temperature: 0.6, max_tokens: 4096, messages: [
      { role: 'user', content: expandUser }
    ]})
    expandedText = r.content[0].type === 'text' ? r.content[0].text : ''
  }

  const codeBlock = expandedText.match(/```json\s*([\s\S]*?)\s*```/) || expandedText.match(/```\s*([\s\S]*?)\s*```/)
  const jsonText = codeBlock ? codeBlock[1] : expandedText
  const parsed = JSON.parse(jsonText)

  // Quality checks
  let totalWords = 0
  let linkCount = 0
  let hasElpriser = false
  let hasUdbydere = false
  for (const s of parsed.sections || []) {
    for (const p of s.paragraphs || []) {
      totalWords += String(p).split(/\s+/).length
      const links = String(p).match(/\[[^\]]+\]\([^\)]+\)/g) || []
      linkCount += links.length
      if (String(p).includes('](/elpriser)')) hasElpriser = true
      if (String(p).includes('](/el-udbydere)')) hasUdbydere = true
    }
  }
  const ok = totalWords >= minWords && linkCount >= 3 && hasElpriser && hasUdbydere

  // Keep raw sections; block conversion happens after polishing
  return { ok, totalWords, linkCount, hasElpriser, hasUdbydere, title: parsed.title, description: parsed.description, sections: parsed.sections }
}

// Post-processing step: SEO polish, CTA/link enforcement, length guards (formatting step)
function polishArticle(keyword: string, data: { title?: string; description?: string; sections?: any[] }) {
  let title = (data.title || keyword || '').trim()
  let description = (data.description || `Guide til ${keyword}`).trim()
  const sections: any[] = Array.isArray(data.sections) ? data.sections : []

  // Ensure title length <= 60 chars (soft trim) and consumer angle
  const consumerPresets = [
    (k: string) => `Hvad betyder ${k} for din elregning?`,
    (k: string) => `Sådan påvirker ${k} dine elpriser`,
    (k: string) => `${k}: Råd og priser for danske husholdninger`,
  ]
  if (title.length > 64 || /guide|hvordan|hvad|elpris/i.test(keyword)) {
    const alt = consumerPresets[(Math.abs(hash(keyword)) % consumerPresets.length)](keyword)
    if (alt.length <= 60) title = alt
  }
  if (title.length > 60) title = title.slice(0, 57).replace(/\s+\S*$/, '') + '…'

  // Compact meta description to <= 160 chars
  if (description.length > 160) {
    description = description.slice(0, 157).replace(/\s+\S*$/, '') + '…'
  }

  // Add final CTA paragraph if missing
  const ensureCta = () => {
    const hasElpriser = sections.some(s => (s.paragraphs || []).some((p: string) => p.includes('](/elpriser)')))
    const hasUdbydere = sections.some(s => (s.paragraphs || []).some((p: string) => p.includes('](/el-udbydere)')))
    const ctaLines: string[] = []
    if (!hasElpriser) ctaLines.push('Tjek [de aktuelle timepriser](/elpriser) og planlæg de energitunge opgaver i de billigste timer.')
    if (!hasUdbydere) ctaLines.push('Sammenlign [danske eludbydere](/el-udbydere) og find en aftale, der passer til dit forbrug.')
    if (ctaLines.length) sections.push({ heading: 'Kom i gang i dag', paragraphs: [ctaLines.join(' ')] })
  }
  ensureCta()

  // Add soft disclaimer paragraph to reduce aggressive claims
  const disclaimer = 'Bemærk: Råd og estimater er vejledende. Dine faktiske priser afhænger af forbrug, netområde og valg af elaftale.'
  sections.push({ heading: 'Vigtigt at vide', paragraphs: [disclaimer] })

  return { title, description, sections }
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

// -------------------------------
// GSC Query helper
// -------------------------------
async function fetchGSCQueries(siteUrl: string, startDate: string, endDate: string, rowLimit: number) {
  const token = await getSearchConsoleAccessToken(false)
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit, type: 'web' })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'GSC query failed')
  return (data.rows || []).map((r: any) => ({
    query: String(r.keys?.[0] || ''),
    clicks: Number(r.clicks || 0),
    impressions: Number(r.impressions || 0),
    ctr: Number(r.ctr || 0),
    position: Number(r.position || 0),
  }))
}

// -------------------------------
// API handlers
// -------------------------------
export async function GET(req: NextRequest) {
  // Require admin secret to avoid accidental mass-ingest
  const hasSecret = req.headers.get('x-admin-secret') === (process.env.ADMIN_SECRET || '')

  // Also require non-production dataset unless explicitly allowed
  const allowProd = process.env.INGEST_ALLOW_PROD === 'true'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (!hasSecret && !(dataset !== 'production' || allowProd)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const url = req.nextUrl
    const siteUrl = url.searchParams.get('siteUrl') || process.env.SITE_URL || 'https://dinelportal.dk'
    const days = Math.max(7, Math.min(90, parseInt(url.searchParams.get('days') || '28', 10)))
    const limit = Math.max(1, Math.min(10, parseInt(url.searchParams.get('limit') || '3', 10)))
    const minWords = Math.max(500, Math.min(1800, parseInt(url.searchParams.get('minWords') || '900', 10)))

    const end = new Date()
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const startDate = start.toISOString().slice(0, 10)
    const endDate = end.toISOString().slice(0, 10)

    const rows = await fetchGSCQueries(siteUrl, startDate, endDate, 200)

    // Heuristics: high impressions, opportunity on CTR/position, informational intent
    const EXCLUDE = [/vindst[øo]d/i, /dinelportal/i]
    const isInfo = (q: string) => /hvordan|hvad|hvorfor|guide|råd|tips|elpris|elpriser|kwh|afgift|tarif|vind|sol|co2/i.test(q)

    const candidates = rows
      .filter(r => r.query && r.impressions >= 80 && r.position <= 20 && r.ctr <= 0.06)
      .filter(r => !EXCLUDE.some(rx => rx.test(r.query)))
      .filter(r => isInfo(r.query))
      .sort((a, b) => (b.impressions * (1 - b.ctr)) - (a.impressions * (1 - a.ctr)))
      .slice(0, 50)

    const sanity = getSanityClient()
    const existing: Array<{ title: string; slug: string }> = await sanity.fetch(`*[_type=="blogPost"]{ title, "slug": slug.current }`)
    const seenTitles = new Set(existing.map(e => (e.title || '').toLowerCase()))
    const seenSlugs = new Set(existing.map(e => (e.slug || '').toLowerCase()))

    const picked: string[] = []
    for (const r of candidates) {
      const norm = normalizeQuery(r.query)
      const slug = slugify(norm)
      if (seenSlugs.has(slug) || seenTitles.has(norm)) continue
      if (!picked.includes(norm)) picked.push(norm)
      if (picked.length >= limit) break
    }

    const results: any[] = []
    for (const kw of picked) {
      try {
        const gen = await generateKeywordArticle(kw, { minWords })
        const polished = polishArticle(kw, { title: gen.title, description: gen.description, sections: (gen as any).sections })
        const title = polished.title || kw
        const slug = slugify(title || kw)
        const blocks = paragraphsToPortableText((polished.sections || []).flatMap((s: any) => Array.isArray(s.paragraphs) ? s.paragraphs : []))
        const readTime = Math.max(1, Math.ceil((title.split(/\s+/).length + (polished.description || '').split(/\s+/).length + (blocks?.[0]?.content || []).reduce((acc: number, b: any) => acc + (b.children || []).reduce((a: number, c: any) => a + String(c.text||'').split(/\s+/).length, 0), 0)) / 200))

        const doc = {
          _type: 'blogPost',
          _id: `drafts.blogPost_${slug}`,
          title,
          slug: { _type: 'slug', current: slug },
          type: 'Guide',
          description: polished.description || `Guide til ${kw}`,
          contentBlocks: blocks,
          publishedDate: new Date().toISOString(),
          featured: false,
          readTime,
          primaryTopic: classifyTopic(`${kw} ${title}`) || undefined,
          sourceUrl: `gsc:query:${kw}`,
          tags: ['SEO', 'Keyword Research'],
          seoMetaTitle: title,
          seoMetaDescription: polished.description || undefined,
        }

        await sanity.createIfNotExists(doc as any)
        results.push({ ok: true, slug, title, words: gen.totalWords, links: gen.linkCount })
      } catch (e: any) {
        results.push({ ok: false, keyword: kw, error: e?.message || String(e) })
      }
    }

    return NextResponse.json({ success: true, count: results.length, picked, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
