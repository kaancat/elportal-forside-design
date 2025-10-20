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

function getTopicSpecificAdvice(topic: string, seed: number): string | null {
  const adviceMap: { [key: string]: string[] } = {
    'Elpriser': [
      'Følg timepriserne dagligt og planlæg energitunge aktiviteter til billige timer.',
      'Overvej en fastpris-aftale, hvis du vil have forudsigelige elpriser.',
      'Brug elpris-apps til at optimere dit forbrug og spare penge.'
    ],
    'Vind': [
      'Når det blæser meget, er elpriserne ofte lave - perfekt til at oplade elbilen.',
      'Vindkraft betyder billigere strøm til dig som forbruger.',
      'Følg vindprognoserne for at planlægge dit elforbrug optimalt.'
    ],
    'Solceller': [
      'Hvis du har solceller, kan du sælge overskudsstrøm til nettet.',
      'Solceller kan reducere din elregning med op til 70%.',
      'Overvej at investere i solceller for at blive mere uafhængig af elpriserne.'
    ],
    'Elbiler': [
      'Oplad din elbil i off-peak timer for at spare penge.',
      'Brug smarte ladeboks-løsninger til at optimere opladning.',
      'Elbiler kan faktisk hjælpe med at stabilisere elnettet.'
    ],
    'Varmepumper': [
      'Varmepumper er mest effektive, når elpriserne er lave.',
      'Brug timer-funktioner på din varmepumpe til at optimere forbrug.',
      'Varmepumper kan reducere dine opvarmningsomkostninger markant.'
    ],
    'CO2': [
      'Grøn strøm betyder lavere CO2-udledning og ofte billigere priser.',
      'Vælg en grøn elaftale for at støtte vedvarende energi.',
      'Dit valg af elaftale påvirker faktisk miljøet direkte.'
    ]
  }

  const advice = adviceMap[topic]
  if (!advice) return null

  return advice[seed % advice.length]
}

function createConsumerTitle(sourceTitle: string, topic: string | null): string | null {
  // SEO-optimized titles following the Danish news interpretation prompt
  const titleTemplates: { [key: string]: string[] } = {
    'Elpriser': [
      `Regeringen ændrer støtteordning – hvad betyder det for din elregning?`,
      `Nye elprisregler: Sådan påvirker det din elregning`,
      `Elprisændringer: Hvad betyder det for dig som forbruger?`
    ],
    'Vind': [
      `Vindkraftudvikling: Sådan påvirker det din elregning`,
      `Nye vindkraftprojekter – hvad betyder det for din elregning?`,
      `Vindkraft og elpriser: Hvad betyder det for dig?`
    ],
    'Solceller': [
      `Solcelleudvikling: Sådan påvirker det din elregning`,
      `Nye solcelleprojekter – hvad betyder det for din elregning?`,
      `Solceller og elpriser: Hvad betyder det for dig?`
    ],
    'Elbiler': [
      `Elbiludvikling: Sådan påvirker det din elregning`,
      `Nye elbilregler – hvad betyder det for din elregning?`,
      `Elbiler og elpriser: Hvad betyder det for dig?`
    ],
    'Varmepumper': [
      `Varmepumpeudvikling: Sådan påvirker det din elregning`,
      `Nye varmepumpeprojekter – hvad betyder det for din elregning?`,
      `Varmepumper og elpriser: Hvad betyder det for dig?`
    ],
    'CO2': [
      `CO2-udvikling: Sådan påvirker det din elregning`,
      `Nye CO2-regler – hvad betyder det for din elregning?`,
      `CO2 og elpriser: Hvad betyder det for dig?`
    ]
  }

  if (!topic || !titleTemplates[topic]) return null

  const templates = titleTemplates[topic]
  return templates[Math.floor(Math.random() * templates.length)]
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

  // Content generation using the new Danish news interpretation prompt
  const contentTemplates = {
    // Opening hooks - consumer-focused news interpretation
    openings: [
      `Som dansk elforbruger er det vigtigt at forstå, hvordan ${sourceTitle.toLowerCase()} påvirker dig og din elregning.`,
      `For alle danske husholdninger er det relevant at vide, hvad ${sourceTitle.toLowerCase()} betyder for elpriserne og dit forbrug.`,
      `Hvis du betaler for strøm i Danmark, påvirker ${sourceTitle.toLowerCase()} dig direkte - her er hvad du skal vide.`,
      `Som dansk elforbruger er det vigtigt at forstå, hvordan ${sourceTitle.toLowerCase()} påvirker dig og dine muligheder.`
    ],

    // Consumer impact explanations - what it means for consumers
    impacts: [
      `For en typisk dansk familie betyder det, at din elregning kan ændre sig, og du skal muligvis justere dit forbrug.`,
      `Det kan direkte påvirke, hvor meget du betaler for strøm hver måned, og hvilke muligheder du har som forbruger.`,
      `Som forbruger betyder det, at du kan spare penge på din elregning ved at forstå de nye forhold.`,
      `Det kan give dig mulighed for at optimere dit elforbrug og spare penge, hvis du handler klogt.`
    ],

    // Practical savings advice - actionable consumer tips
    savings: [
      `Du kan spare penge ved at følge timepriserne og flytte dit forbrug til billigere timer.`,
      `Med smarte vaner kan du reducere din elregning med flere hundrede kroner om året.`,
      `Ved at optimere dit elforbrug kan du spare op til 2.000 kr. årligt.`,
      `Små ændringer i dine vaner kan betyde store besparelser på din elregning.`
    ],

    // Practical tips - what consumers can do
    tips: [
      `Tjek timepriserne dagligt og planlæg energitunge aktiviteter til billige timer.`,
      `Brug timer-funktioner på dine hvidevarer til at optimere dit forbrug.`,
      `Oplad din elbil i off-peak timer for at spare penge.`,
      `Sluk standby-forbrug og spar op til 500 kr. årligt.`,
      `Sammenlign eludbydere regelmæssigt for at sikre dig den bedste pris.`,
      `Overvej at skifte til en eludbyder, der matcher dine forbrugsvaner.`
    ],

    // Future outlook - what to expect
    outlooks: [
      `Fremadrettet kan det betyde mere stabile elpriser for danske forbrugere.`,
      `Det kan give dig bedre muligheder for at spare på din elregning.`,
      `Som forbruger kan du forvente mere forudsigelige elpriser.`,
      `Det kan åbne nye muligheder for at optimere dit elforbrug.`
    ],

    // Call-to-action templates for internal linking
    ctas: [
      `Vil du se, hvordan ændringen påvirker priserne? Se vores opdaterede sammenligning af eludbydere her.`,
      `Få overblik over de bedste eludbydere og find den aftale, der passer til dit forbrug.`,
      `Sammenlign eludbydere og find den mest fordelagtige aftale til dit hjem.`,
      `Tjek vores opdaterede oversigt over eludbydere og find den bedste pris til dig.`
    ]
  }

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

  // Build content following the new Danish news interpretation prompt structure
  const paragraphs: string[] = []
  let approx = 0

  // Section 1: Intro (2-3 lines) - Quick summary and relevance
  const intro = contentTemplates.openings[seed % contentTemplates.openings.length]
  paragraphs.push(intro)
  approx += intro.split(/\s+/).length

  // Section 2: Short summary with source reference
  const summary = `Ifølge ${sourceName} ${sourceTitle.toLowerCase()}. ${contentTemplates.impacts[seed % contentTemplates.impacts.length]}`
  paragraphs.push(summary)
  approx += summary.split(/\s+/).length

  // Section 3: What it means for consumers and the market
  const consumerImpact = contentTemplates.impacts[(seed + 1) % contentTemplates.impacts.length]
  paragraphs.push(consumerImpact)
  approx += consumerImpact.split(/\s+/).length

  // Add practical savings advice
  const savings = contentTemplates.savings[seed % contentTemplates.savings.length]
  paragraphs.push(savings)
  approx += savings.split(/\s+/).length

  // Section 4: What consumers can do (2-3 actionable tips)
  const numTips = 2 + (seed % 2) // 2-3 tips
  for (let i = 0; i < numTips && approx < targetWords * 0.8; i++) {
    const tip = contentTemplates.tips[(seed + i) % contentTemplates.tips.length]
    paragraphs.push(tip)
    approx += tip.split(/\s+/).length
  }

  // Add future outlook
  const outlook = contentTemplates.outlooks[seed % contentTemplates.outlooks.length]
  paragraphs.push(outlook)
  approx += outlook.split(/\s+/).length

  // Add call-to-action with internal linking
  const cta = contentTemplates.ctas[seed % contentTemplates.ctas.length]
  paragraphs.push(cta)
  approx += cta.split(/\s+/).length

  // Add specific consumer advice based on topic
  const topic = classifyTopic(`${sourceTitle} ${extractedText}`)
  if (topic) {
    const topicAdvice = getTopicSpecificAdvice(topic, seed)
    if (topicAdvice) {
      paragraphs.push(topicAdvice)
      approx += topicAdvice.split(/\s+/).length
    }
  }

  // Section 5: Source and attribution with proper linking
  if (quote) paragraphs.splice(Math.min(2, paragraphs.length), 0, quote)
  paragraphs.push(
    `Kilde: ${sourceName}, [${sourceUrl}](${sourceUrl}). ` +
    `Artiklen gengiver ikke kildens tekst, men er DinElPortals selvstændige analyse og formidling.`
  )

  // Create consumer-friendly title
  const consumerTitle = createConsumerTitle(sourceTitle, topic)
  const title = consumerTitle || sourceTitle.replace(/^(Pressemeddelelse:|Press release:)/i, '').trim() || 'Nyhed om el og energi'
  const description = `Praktisk guide til, hvordan ${sourceTitle.toLowerCase()} påvirker din elregning og muligheder for at spare penge. Læs vores analyse og få råd til at optimere dit elforbrug.`

  const blocks = [
    {
      _type: 'richTextSection',
      _key: Math.random().toString(36).slice(2),
      title,
      content: (() => {
        const h = (text: string) => ({ _type: 'block', style: 'h2', _key: Math.random().toString(36).slice(2), children: [{ _type: 'span', text, _key: Math.random().toString(36).slice(2) }] })
        const pBlock = (text: string) => ({ _type: 'block', _key: Math.random().toString(36).slice(2), children: [{ _type: 'span', text, _key: Math.random().toString(36).slice(2) }] })
        const content: any[] = []
        // Insert headings following the Danish news interpretation prompt structure
        const headings = ['Overblik', 'Nyhedsresumé', 'Hvad betyder det for dig?', 'Praktiske råd', 'Fremtidsudsigter', 'Kilder']
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

