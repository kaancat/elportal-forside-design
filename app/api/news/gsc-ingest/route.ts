import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getSearchConsoleAccessToken } from '@/server/google'
import { env as appEnv } from '@/lib/env'
import { getUnsplashImage, getHashedFallbackImage } from '@/server/unsplash'
import { sectionsToPortableText, estimateReadTimeFromBlocks, computeStats, formatTitleSentenceCase } from '@/server/newsFormatter'
import { buildGuidelinePrompt } from '@/server/newsGuidelines'

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
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || appEnv.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || appEnv.SANITY_DATASET
  return createClient({
    projectId,
    dataset,
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

// Suggest official external sources per topic for credible outbound links
function getExternalSources(topicOrKeyword: string): Array<{ name: string; url: string }> {
  const lower = topicOrKeyword.toLowerCase()
  const list: Array<{ name: string; url: string }> = []
  if (/elpris|elpriser|spot|fastpris|kwh|forbrug/.test(lower)) {
    list.push(
      { name: 'Energistyrelsen (ens.dk)', url: 'https://ens.dk/' },
      { name: 'Energinet (energinet.dk)', url: 'https://energinet.dk/' },
    )
  }
  if (/tarif|nettarif|net/.test(lower)) list.push({ name: 'Green Power Denmark', url: 'https://greenpowerdenmark.dk/' })
  if (/co2|udledning/.test(lower)) list.push({ name: 'Klimaministeriet', url: 'https://kefm.dk/' })
  if (/vind/.test(lower)) list.push({ name: 'Energistyrelsen – vind', url: 'https://ens.dk/ansvarsomraader/vindenergi' })
  if (/sol/.test(lower)) list.push({ name: 'Energistyrelsen – sol', url: 'https://ens.dk/ansvarsomraader/solenergi' })
  if (list.length === 0) list.push({ name: 'Energistyrelsen', url: 'https://ens.dk/' })
  return list
}

function getAIClient(prefer?: 'openai' | 'anthropic'): { type: 'openai' | 'anthropic'; client: any } {
  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (prefer === 'openai' && openaiKey) return { type: 'openai', client: new OpenAI({ apiKey: openaiKey }) }
  if (prefer === 'anthropic' && anthropicKey) return { type: 'anthropic', client: new Anthropic({ apiKey: anthropicKey }) }
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
// AI: Two-step keyword article generation (flex outline → flexible expansion)
// -------------------------------
async function generateKeywordArticle(keyword: string, opts?: { minWords?: number; forceLLM?: 'openai' | 'anthropic' }) {
  const minWords = Math.max(500, opts?.minWords || 800)
  const { type, client } = getAIClient(opts?.forceLLM)
  const llmType = type
  const sys = `Du er journalist hos DinElPortal. Skriv på dansk til almindelige husholdninger. Fokus: elpriser, forbrug, grøn energi og konkrete råd.`

  // Step 1: Outline & metadata (flexible sections 3–6)
  const outlineUser = `Lav en artikelplan for emnet: "${keyword}" til danske husholdninger.
Returner KUN JSON med:
{
  "title": "SEO-titel (maks 60 tegn)",
  "meta": "Meta description (maks 160 tegn)",
  "sections": [
    { "heading": "...", "purpose": "hvad dækker afsnittet" }
  ]
}

KRAV:
- 3–6 sektioner (ikke fast skabelon)
- Forbrugerfokus (hvad betyder det for elregning/valg/forbrug)
- Neutral, faktuel tone`

  let outlineText = ''
  if (type === 'openai') {
    const r = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.4, response_format: { type: 'json_object' }, messages: [
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

  const outline = safeParseJson(outlineText)

  // Step 2: Expand content with flexible structure, headings and guardrails
  const expandUser = `Skriv en dansk artikel baseret på denne plan:
${JSON.stringify(outline)}

KRAV:
- ${buildGuidelinePrompt({ minWords })}
- Minimum ${minWords} ord i alt.
- Brug meningsfulde H2-overskrifter hvor det giver mening (ingen faste labels).
- Indsæt links i markdown-format (naturligt i teksten):
  - Mindst 2 links til [de aktuelle elpriser](/elpriser)
  - Mindst 1 link til [sammenlign danske eludbydere](/el-udbydere)
- Indsæt mindst 2 eksterne kilder (officielle domæner) i Kilder-sektionen, fx: ${getExternalSources(keyword).map(s=>`[${s.name}](${s.url})`).join(', ')}
- Undgå kategoriske påstande uden forbehold (brug “kan”, “typisk”, “afhænger af …”)
- Brug neutralt, forklarende sprog; fokus på forbrugerens perspektiv
Returner KUN JSON:
{
  "title": "...",
  "description": "...",
  "sections": [ { "heading": "...", "paragraphs": ["...", "..."] } ]
}`

  let expandedText = ''
  if (type === 'openai') {
    const r = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.6, response_format: { type: 'json_object' }, messages: [
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
  let parsed = safeParseJson(jsonText)

  // Quality checks
  let { totalWords, linkCount, hasElpriser, hasUdbydere } = computeStats(parsed)
  let ok = totalWords >= minWords && linkCount >= 3 && hasElpriser && hasUdbydere

  // Length top-up: ask model to extend content with "Historik & Baggrund" and more examples if short
  if (!ok && totalWords < minWords) {
    const topupUser = `FORLÆNG artiklen nedenfor, behold tone og struktur. Uddyb baggrund og konsekvenser for forbrugere med konkrete eksempler og fakta. Sørg for at inkludere mindst 2 officielle eksterne kilder naturligt i teksten eller som afsluttende kildeangivelse. Brug H2-overskrifter hvor det giver mening. Returner KUN JSON i samme struktur.
${JSON.stringify(parsed)}`
    if (type === 'openai') {
      const r2 = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.6, response_format: { type: 'json_object' }, messages: [
        { role: 'system', content: sys },
        { role: 'user', content: topupUser }
      ], max_tokens: 8192 })
      const txt = r2.choices[0]?.message?.content || ''
      parsed = safeParseJson(txt)
    } else {
      const r2 = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', temperature: 0.6, max_tokens: 4096, messages: [
        { role: 'user', content: topupUser }
      ]})
      const txt = r2.content[0].type === 'text' ? r2.content[0].text : ''
      parsed = safeParseJson(txt)
    }
    const stats2 = computeStats(parsed)
    totalWords = stats2.totalWords; linkCount = stats2.linkCount; hasElpriser = stats2.hasElpriser; hasUdbydere = stats2.hasUdbydere
    ok = totalWords >= minWords && linkCount >= 3 && hasElpriser && hasUdbydere
  }

  // Keep raw sections; block conversion happens after polishing
  return { ok, totalWords, linkCount, hasElpriser, hasUdbydere, title: parsed.title, description: parsed.description, sections: parsed.sections, llmType }
}

function safeParseJson(raw: string): any {
  const s = String(raw)
  // First, direct parse
  try { return JSON.parse(s.trim()) } catch {}
  // Second, balanced object extraction
  const start = s.indexOf('{')
  if (start >= 0) {
    let depth = 0
    let inStr: string | null = null
    let esc = false
    for (let i = start; i < s.length; i++) {
      const ch = s[i]
      if (inStr) {
        if (esc) { esc = false }
        else if (ch === '\\') { esc = true }
        else if (ch === inStr) { inStr = null }
      } else {
        if (ch === '"' || ch === '\'') inStr = ch
        else if (ch === '{') depth++
        else if (ch === '}') {
          depth--
          if (depth === 0) {
            const candidate = s.slice(start, i + 1)
            try { return JSON.parse(candidate) } catch {}
            break
          }
        }
      }
    }
  }
  // Third, strip code fences
  const cleaned = s.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim()
  try { return JSON.parse(cleaned) } catch (e) {
    throw new Error((e as Error).message || 'Failed to parse JSON')
  }
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

  // Ensure der er mindst 2 eksterne kilder i teksten; hvis ikke, tilføj en enkel kilde-linje som sidste afsnit (uden fast overskrift)
  const ensureSources = () => {
    const topic = classifyTopic(keyword) || keyword
    const sources = getExternalSources(topic)
    const links = sources.slice(0, 3).map(s => `[${s.name}](${s.url})`)
    const para = `Kilder: ${links.join(', ')}`
    const hasExternal = sections.some(s => (s.paragraphs||[]).some((p:string)=>/https?:\/\//i.test(p)))
    if (!hasExternal) {
      if (sections.length > 0) {
        const last = sections[sections.length - 1]
        last.paragraphs = [...(last.paragraphs||[]), para]
      } else {
        sections.push({ paragraphs: [para] })
      }
    }
  }
  ensureSources()

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

async function uploadImageToSanity(sanity: any, url: string, filename: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Image fetch failed ${res.status}`)
    const ct = res.headers.get('content-type') || 'image/jpeg'
    const buf = Buffer.from(await res.arrayBuffer())
    const asset = await sanity.assets.upload('image', buf as any, { filename, contentType: ct })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset?._id } }
  } catch (e) {
    return null
  }
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
    const llmPref = (url.searchParams.get('llm') as 'openai' | 'anthropic' | null) || null
    const debug = url.searchParams.get('debug') === '1'

    const end = new Date()
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const startDate = start.toISOString().slice(0, 10)
    const endDate = end.toISOString().slice(0, 10)

    let candidates: Array<{ query: string; impressions?: number; ctr?: number; position?: number }> = []
    // Manual override: one or more explicit keywords via ?q=...
    const qParams = url.searchParams.getAll('q').map(q => (q || '').trim()).filter(Boolean)
    if (qParams.length > 0) {
      candidates = qParams.map(q => ({ query: q }))
    } else try {
    const rows = await fetchGSCQueries(siteUrl, startDate, endDate, 200)
      const EXCLUDE = [/vindst[øo]d/i, /dinelportal/i]
      const isInfo = (q: string) => /hvordan|hvad|hvorfor|guide|råd|tips|elpris|elpriser|kwh|afgift|tarif|vind|sol|co2/i.test(q)
      candidates = rows
        .filter(r => r.query && r.impressions >= 80 && r.position <= 20 && r.ctr <= 0.06)
        .filter(r => !EXCLUDE.some(rx => rx.test(r.query)))
        .filter(r => isInfo(r.query))
        .sort((a, b) => (b.impressions * (1 - b.ctr)) - (a.impressions * (1 - a.ctr)))
        .slice(0, 50)
    } catch (err: any) {
      // Fallback when GSC is not authorized/available
      console.warn('[GSC] Fallback to curated seeds:', err?.message || String(err))
      const seeds = [
        'elpriser i dag',
        'nettariffer 2025',
        'vindenergi i danmark',
        'solceller og elregning',
        'grøn strøm betydning for priser',
      ]
      candidates = seeds.map(s => ({ query: s }))
    }

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
        const gen = await generateKeywordArticle(kw, { minWords, forceLLM: llmPref || undefined })
        const polished = polishArticle(kw, { title: gen.title, description: gen.description, sections: (gen as any).sections })
        const title = formatTitleSentenceCase(polished.title || kw)
        const slug = slugify(title || kw)
        const { contentBlocks: blocks, body: bodyBlocks } = sectionsToPortableText({ title, description: polished.description, sections: polished.sections })
        const readTime = estimateReadTimeFromBlocks(bodyBlocks)

        // Image selection (Unsplash → fallback)
        const ogImageUrl = (await getUnsplashImage(`${kw} energi elpriser Danmark`, slug)) || getHashedFallbackImage(slug)
        const altText = `Illustration: ${title} – elpriser i Danmark`
        const uploadedImage = await uploadImageToSanity(sanity, ogImageUrl, `${slug}.jpg`)

        const doc = {
          _type: 'blogPost',
          _id: `blogPost_${slug}`,
          title,
          slug: { _type: 'slug', current: slug },
          type: 'Guide',
          description: polished.description || `Guide til ${kw}`,
          contentBlocks: blocks,
          body: bodyBlocks,
          publishedDate: new Date().toISOString(),
          featured: false,
          readTime,
          primaryTopic: classifyTopic(`${kw} ${title}`) || undefined,
          sourceUrl: `gsc:query:${kw}`,
          tags: Array.from(new Set(['SEO','Keyword Research', 'elpriser', 'elregning', 'Danmark', kw])).slice(0,8),
          seoMetaTitle: title,
          seoMetaDescription: polished.description || undefined,
          // Featured image for cards and OG
          featuredImage: uploadedImage ? { ...uploadedImage, alt: altText } : undefined,
          seoOpenGraphImage: uploadedImage ? { ...uploadedImage, alt: altText } : undefined,
        }

        // Upsert: if a draft already exists, patch missing image/SEO fields
        const existing = await sanity.fetch(`*[_type=="blogPost" && slug.current==$slug][0]{ _id, featuredImage, seoOpenGraphImage, contentBlocks, body }`, { slug })
        if (existing?._id) {
          const patch: any = {}
          const needsFI = !existing.featuredImage || !existing.featuredImage.asset || !existing.featuredImage.asset._ref
          const needsOG = !existing.seoOpenGraphImage || !existing.seoOpenGraphImage.asset || !existing.seoOpenGraphImage.asset._ref
          const needsBlocks = !Array.isArray((existing as any).contentBlocks) || (existing as any).contentBlocks.length === 0
          const needsBody = !Array.isArray((existing as any).body) || (existing as any).body.length === 0
          if (needsFI && uploadedImage) patch.featuredImage = { ...uploadedImage, alt: altText }
          if (needsOG && uploadedImage) patch.seoOpenGraphImage = { ...uploadedImage, alt: altText }
          // Only fill content if missing to avoid clobbering manual edits
          if (needsBlocks) patch.contentBlocks = blocks
          if (needsBody) patch.body = bodyBlocks
          if (Object.keys(patch).length) await sanity.patch(existing._id).set(patch).commit()
        } else {
          // Create published doc and clean up any stale draft
          const draftId = `drafts.blogPost_${slug}`
          const tx = sanity.transaction()
          tx.createOrReplace(doc as any)
          try { tx.delete(draftId) } catch {}
          await tx.commit()
        }
        results.push({ ok: true, slug, title, words: gen.totalWords, links: gen.linkCount, llm: llmPref || gen.llmType })
      } catch (e: any) {
        // Emergency fallback: create a minimal draft so the flow can be reviewed
        try {
          const title = formatTitleSentenceCase(`Hvad betyder ${kw} for din elregning?`)
          const slug = slugify(title)
          const paras = [
            `Dette indlæg forklarer kort, hvad "${kw}" betyder for danske husholdninger, og hvordan det kan påvirke elpriser og forbrug.`,
            `Vil du følge udviklingen i priser? Se [de aktuelle timepriser](/elpriser) og planlæg forbruget i de billigste timer.`,
            `Overvejer du at skifte elaftale? Sammenlign [danske eludbydere](/el-udbydere) for at finde en aftale der passer til dit forbrug.`,
          ]
          const { contentBlocks: blocks, body: bodyBlocks } = sectionsToPortableText({ title, description: `Kort guide om ${kw}`, sections: [{ heading: 'Overblik', paragraphs: paras }] })
          const readTime = estimateReadTimeFromBlocks(bodyBlocks)
          const ogImageUrl = (await getUnsplashImage(`${kw} energi elpriser Danmark`, slug)) || getHashedFallbackImage(slug)
          const altText = `Illustration: ${title} – elpriser i Danmark`
          const uploadedImage = await uploadImageToSanity(sanity, ogImageUrl, `${slug}.jpg`)
          const doc = {
            _type: 'blogPost', _id: `blogPost_${slug}`, title,
            slug: { _type: 'slug', current: slug }, type: 'Guide',
            description: `Kort guide om ${kw} og elpriser i Danmark.`,
            contentBlocks: blocks, body: bodyBlocks, publishedDate: new Date().toISOString(),
            featured: false, readTime, primaryTopic: classifyTopic(kw) || undefined,
            sourceUrl: `gsc:query:${kw}`, tags: ['SEO', 'Keyword Research'],
            seoMetaTitle: title, seoMetaDescription: `Kort guide om ${kw}.`,
            featuredImage: uploadedImage ? { ...uploadedImage, alt: altText } : undefined,
            seoOpenGraphImage: uploadedImage ? { ...uploadedImage, alt: altText } : undefined,
          }
          await sanity.createOrReplace(doc as any)
          results.push({ ok: true, slug, title, fallback: true, llm: llmPref || 'openai' })
        } catch (inner: any) {
          results.push({ ok: false, keyword: kw, error: e?.message || String(e), fallbackError: inner?.message || String(inner) })
        }
      }
    }

    const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || appEnv.SANITY_PROJECT_ID
    const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || appEnv.SANITY_DATASET
    return NextResponse.json({ success: true, count: results.length, picked, results, llmPref: llmPref || 'auto', debug, sanity: { projectId, dataset } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
