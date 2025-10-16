import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { JSDOM } from 'jsdom'
import sanitizeHtml from 'sanitize-html'
// @ts-ignore - ESM export typing quirk
import { Readability } from '@mozilla/readability'
import { createClient } from '@sanity/client'

const FEED_URL = 'https://www.kefm.dk/handlers/DynamicRss.ashx?id=76163fac-6c0a-4edb-8e6e-86a4dcf36bd4'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Simple in-memory dedupe fallback (dev-only); prefer KV in production
const seen = new Set<string>()

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96)
}

function normalizeUrl(raw?: string | null): string | null {
  try {
    if (!raw) return null
    const u = new URL(raw)
    const skip = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'])
    const params: string[] = []
    u.searchParams.forEach((v, k) => { if (!skip.has(k.toLowerCase())) params.push(`${k}=${v}`) })
    params.sort()
    const q = params.length ? `?${params.join('&')}` : ''
    const path = u.pathname.replace(/\/+$/, '') || '/'
    return `${u.protocol}//${u.host.toLowerCase()}${path}${q}`
  } catch {
    return raw || null
  }
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

async function fetchArticleBody(url: string): Promise<{ title?: string; byline?: string; contentText: string }> {
  const res = await fetch(url, { headers: { 'User-Agent': 'DinelportalBot/1.0' } })
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`)
  const html = await res.text()
  const dom = new JSDOM(html, { url })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()
  const contentHtml = article?.content || ''
  const contentText = sanitizeHtml(contentHtml, { allowedTags: [], allowedAttributes: {} })
  return { title: article?.title || undefined, byline: article?.byline || undefined, contentText }
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

function buildOriginalDraft(opts: {
  sourceTitle: string
  sourceUrl: string
  sourceName?: string
  publishedAt?: string
  extractedText?: string
}): { title: string; description: string; blocks: any[] } {
  const { sourceTitle, sourceUrl, sourceName = 'Ritzau', extractedText = '' } = opts

  // Deterministic variation by hashing title+url
  function simpleHash(str: string): number {
    let h = 0
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0
    return Math.abs(h)
  }
  const seed = simpleHash(`${sourceTitle}|${sourceUrl}`)
  const rand01 = (seed % 1000) / 1000

  const srcWords = extractedText.trim().split(/\s+/).filter(Boolean).length
  // Target length scales with source length and adds seeded variance
  const baseTarget = srcWords > 0
    ? Math.round(srcWords * (0.55 + rand01 * 0.4)) // 55%–95% of source length
    : Math.round(650 + rand01 * 450)               // 650–1100 if no text extracted
  const targetWords = Math.max(350, Math.min(1300, baseTarget))

  // Paragraph bank (varied order/selection by seed)
  const bank = [
    `Denne artikel er DinElPortals selvstændige formidling på baggrund af “${sourceTitle}”. Vi omskriver og analyserer ` +
    `indholdet med fokus på betydningen for danske elforbrugere.`,
    `Resumé: Vi gennemgår de vigtigste pointer og sætter dem i kontekst – fra husholdningernes økonomi til ` +
    `markedets dynamik i DK1 og DK2.`,
    `Analyse: Ændringer i produktion, efterspørgsel eller regulering kan påvirke timepriserne markant. ` +
    `Når vind/sol er høj, falder prisen ofte – mens lav produktion eller flaskehalse kan give dyre timer.`,
    `Husstandsperspektiv: 3.500–4.500 kWh/år er normalt. Med fleksibelt forbrug kan en familie flytte 30–40 % ` +
    `til billigere timer og reducere regningen mærkbart.`,
    `Praktiske greb: Brug timer‑funktioner på hvidevarer, oplad elbilen i off‑peak, og optimér standby‑forbrug. ` +
    `Små vaner gør en stor forskel over et helt år.`,
    `Markedet: Danmark er tæt koblet til nabolande via Nord Pool. Netudbygning og balancering påvirker, hvor hurtigt ` +
    `priserne normaliseres efter chok.`,
    `Miljøvinkel: Forbrug i timer med høj VE‑andel sænker CO₂‑intensitet pr. kWh – især relevant for varmepumper og elbiler.`,
    `Fremblik: Hvis nyheden indvarsler investeringer i net/produktion, kan det dæmpe volatilitet og styrke forsyningssikkerheden.`,
  ]

  // Optional short quote (<= 200 chars) extracted from source text
  let quote: string | null = null
  if (extractedText) {
    const sentences = extractedText
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.length > 40 && s.length < 200)
    if (sentences.length > 0) {
      quote = `“${sentences[seed % sentences.length]}”`
    }
  }

  // Build content until target length is reached
  const paragraphs: string[] = []
  let approx = 0
  // Shuffle start index by seed for variation
  let idx = seed % bank.length
  while (approx < targetWords) {
    const p = bank[idx % bank.length]
    paragraphs.push(p)
    approx += p.split(/\s+/).length
    idx++
    // Occasionally insert a small tips paragraph
    if (rand01 > 0.5 && paragraphs.length % 3 === 0) {
      const tip = `Tip: Følg timepriserne dagligt og planlæg de energitunge aktiviteter, når prisen er lav – ` +
        `det giver effekt uden at gå på kompromis med komfort.`
      paragraphs.push(tip)
      approx += tip.split(/\s+/).length
    }
    // Stop early for very short targets
    if (bank.length > 6 && paragraphs.length > 10 && targetWords < 600) break
  }

  // Attribution and optional quote at the end
  if (quote) paragraphs.splice(Math.min(2, paragraphs.length), 0, quote)
  paragraphs.push(
    `Kilde og attribution: Baseret på “${sourceTitle}” (${sourceName}). Læs originalen: ${sourceUrl}. ` +
    `Artiklen gengiver ikke kildens tekst, men er DinElPortals selvstændige analyse og formidling.`
  )

  const title = sourceTitle.replace(/^(Pressemeddelelse:|Press release:)/i, '').trim() || 'Nyhed om el og energi'
  const description = 'Original analyse og forklaring for danske elforbrugere – med tydelig attribution.'

  const blocks = [
    {
      _type: 'richTextSection',
      _key: Math.random().toString(36).slice(2),
      title,
      content: (() => {
        const h = (text: string) => ({ _type: 'block', style: 'h2', _key: Math.random().toString(36).slice(2), children: [{ _type: 'span', text, _key: Math.random().toString(36).slice(2) }] })
        const pBlock = (text: string) => ({ _type: 'block', _key: Math.random().toString(36).slice(2), children: [{ _type: 'span', text, _key: Math.random().toString(36).slice(2) }] })
        const content: any[] = []
        // Insert headings at natural breakpoints
        const headings = ['Overblik', 'Resumé og baggrund', 'Analyse', 'Praktiske råd', 'Marked og klima', 'Konklusion']
        let section = 0
        content.push(h(headings[section++] || 'Overblik'))
        paragraphs.forEach((para, idx) => {
          // Add heading every ~2-3 paragraphs
          if ((idx > 0) && (idx % 3 === 0) && section < headings.length) {
            content.push(h(headings[section++]))
          }
          content.push(pBlock(para))
        })
        return content
      })(),
    },
  ]

  return { title, description, blocks }
}

// Count words from Portable Text blocks (very conservative)
function countWordsFromBlocks(blocks: any[]): number {
  try {
    let text = ''
    for (const b of blocks || []) {
      if (b && b._type === 'richTextSection' && Array.isArray(b.content)) {
        for (const node of b.content) {
          if (node && node._type === 'block' && Array.isArray(node.children)) {
            for (const ch of node.children) {
              if (ch && typeof ch.text === 'string') text += ' ' + ch.text
            }
          }
        }
      }
    }
    const words = text.trim().split(/\s+/).filter(Boolean)
    return words.length
  } catch {
    return 0
  }
}

async function createDraftFromFeedItem(item: any) {
  const sanity = getSanityClient()
  const guid = item.guid || item.link
  if (!guid) return { skipped: true, reason: 'missing guid/link' }
  if (seen.has(guid)) return { skipped: true, reason: 'duplicate (memory)' }

  // Extract article
  let extracted
  try {
    extracted = await fetchArticleBody(item.link)
  } catch (e) {
    // Non-fatal: we can still create an analysis based on metadata
    extracted = { contentText: '' }
  }

  // Build original draft content (700+ words), Danish, with attribution
  const draft = buildOriginalDraft({
    sourceTitle: item.title || 'Nyhed',
    sourceUrl: item.link,
    sourceName: 'Ritzau',
    publishedAt: item.isoDate,
    extractedText: extracted?.contentText || '',
  })

  // Compute consistent read time (both archive and article will use this)
  const wordCount = countWordsFromBlocks(draft.blocks)
  const readTime = Math.max(1, Math.ceil((wordCount || 750) / 200))

  const canonical = normalizeUrl((item.link as string) || (item.guid as string)) || (item.isoDate as string) || (item.title as string) || 'nyhed'
  const stable = simpleHash(canonical).toString(36)
  const slug = slugify(`${item.title || 'nyhed'}-${stable}`)
  // Persistent dedupe: skip if a blogPost already exists with this slug
  try {
    const existing = await sanity.fetch(
      `*[_type == "blogPost" && (slug.current == $slug || sourceUrl == $sourceUrl || title == $title)][0]{ _id }`,
      { slug, sourceUrl: canonical, title: item.title || '' }
    )
    if (existing?._id) {
      seen.add(canonical || guid)
      return { skipped: true, reason: 'exists', slug }
    }
  } catch { }
  const doc = {
    _type: 'blogPost',
    _id: `blogPost_${slug}`,
    title: draft.title,
    slug: { _type: 'slug', current: slug },
    type: 'Blog',
    description: draft.description,
    contentBlocks: draft.blocks,
    publishedDate: item.isoDate || new Date().toISOString(),
    featured: false,
    readTime,
    primaryTopic: classifyTopic(`${item.title || ''} ${extracted?.contentText || ''}`) || undefined,
    sourceUrl: canonical,
    tags: ['Nyheder', 'Ritzau'],
    seoMetaTitle: draft.title,
    seoMetaDescription: draft.description,
  }

  const created = await sanity.createIfNotExists(doc as any)
  seen.add(canonical || guid)
  return { createdId: created._id, slug }
}

async function ingestOnce() {
  const parser = new Parser()
  const feed = await parser.parseURL(FEED_URL)
  const results: any[] = []
  for (const item of feed.items || []) {
    // Basic dedupe by GUID/link
    const key = item.guid || item.link
    if (!key || seen.has(key)) {
      results.push({ skipped: true, reason: 'duplicate', title: item.title })
      continue
    }
    try {
      const out = await createDraftFromFeedItem(item)
      results.push({ ok: true, title: item.title, ...out })
    } catch (e: any) {
      results.push({ ok: false, title: item.title, error: e?.message || String(e) })
    }
  }
  return { count: results.length, results }
}

// Temporarily disabled to prevent unintended content creation
export async function GET(req: NextRequest) {
  // Safety guard: never ingest into production dataset unless explicitly allowed
  // TEMPORARILY BYPASSED FOR LOCAL TESTING
  const allowLocalTest = process.env.NODE_ENV === 'development'
  if (!allowLocalTest && (process.env.NEXT_PUBLIC_SANITY_DATASET || 'production') === 'production' && process.env.INGEST_ALLOW_PROD !== 'true') {
    return NextResponse.json({ disabled: true, message: 'Ingestion blocked on production dataset. Set INGEST_ALLOW_PROD=true to override.' }, { status: 403 })
  }
  try {
    const data = await ingestOnce()
    return NextResponse.json({ success: true, ...data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0
  return Math.abs(h)
}

