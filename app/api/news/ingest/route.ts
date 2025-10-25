import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { JSDOM } from 'jsdom'
import sanitizeHtml from 'sanitize-html'
// @ts-ignore - ESM export typing quirk
import { Readability } from '@mozilla/readability'
import { createClient } from '@sanity/client'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { runSourcePipeline } from '@/server/newsPipeline'

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

// Initialize AI client (OpenAI preferred, falls back to Anthropic)
function getAIClient(): { type: 'openai' | 'anthropic'; client: any } {
  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (openaiKey) {
    return { type: 'openai', client: new OpenAI({ apiKey: openaiKey }) }
  } else if (anthropicKey) {
    return { type: 'anthropic', client: new Anthropic({ apiKey: anthropicKey }) }
  } else {
    throw new Error('Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is configured')
  }
}

// Generate AI-powered content using Claude following the Danish news interpretation prompt
async function generateClaudeContent(opts: {
  sourceTitle: string
  sourceUrl: string
  sourceName?: string
  publishedAt?: string
  extractedText?: string
  minWords?: number
}): Promise<{ title: string; description: string; blocks: any[] }> {
  const { sourceTitle, sourceUrl, sourceName = 'Ritzau', extractedText = '', minWords = 700 } = opts

  const systemPrompt = `Du er en professionel dansk journalist for Din Elportal – Danmarks uafhængige el-guide.

DIT MÅL: Fortolk energi-nyheder og forklar, hvad de betyder for danske husholdningers elregning og forbrug.

TONE & STIL:
- Professionel og neutral (som Børsen eller Finans)
- Konkret og handlingsorienteret
- Ingen AI-slop eller generiske fraser
- Brug aktivt sprog og konkrete eksempler

🚨 KRITISK: LINKS ER OBLIGATORISKE! 🚨
DU SKAL inkludere MINIMUM 3-5 links i HVER artikel!

INTERNE LINKS (SKAL bruges!):
DU SKAL inkludere mindst 2-3 interne links:
- "/elpriser" → NÅR du nævner priser, timepriser, spotpriser
  ✓ "Tjek [aktuelle elpriser](/elpriser) for at se..."
  ✓ "Se [dagens timepriser](/elpriser) her"
- "/el-udbydere" → NÅR du nævner selskaber, skift, sammenligning
  ✓ "Sammenlign [danske eludbydere](/el-udbydere) for at..."
  ✓ "Find [det bedste tilbud](/el-udbydere) til dit forbrug"

EKSTERNE LINKS (SKAL bruges!):
DU SKAL inkludere kildelink NATURLIGT:
✓ "Ifølge [den nye aftale](${sourceUrl}) vil..."
  ✓ "Det fremgår af [energiministrenes beslutning](${sourceUrl}), at..."
  ✓ Det er OK at tilføje en afsluttende "Kilde:"-linje med link

  STRUKTUR (MINIMUM ${minWords} ORD):
  Skriv frit i 3–6 sektioner med klart forbrugerfokus. Forslag:

  - **Overblik**: Hvad er nyheden? Hvorfor er den vigtig for husholdninger?

  - **Hvad sker der?**: Opsummer beslutning/ændring, inkluder naturligt kildelink

  - **Hvad betyder det for din elregning?**: Konkrete konsekvenser (tal hvor muligt)

  - **Det kan du gøre**: Praktiske råd, inkl. links til /elpriser og /el-udbydere

  - **Kilde & links**: Kilde: [myndighed](${sourceUrl}) og evt. relaterede links

RETURNER KUN JSON - HUSK ${minWords}+ ORD TOTALT!
  Afsnit kan variere i længde for naturlig læsbarhed:
{
  "title": "SEO-titel (max 60 tegn)",
  "description": "Meta description (maks 160 tegn)",
  "sections": [
    {"heading": "Overblik", "paragraphs": ["Kort intro om hvorfor nyheden er relevant for danske husholdninger."]},
    {"heading": "Hvad sker der?", "paragraphs": ["Ifølge [kilden](${sourceUrl})... Beslutningen betyder at..." ]},
    {"heading": "Hvad betyder det for din elregning?", "paragraphs": ["Konkrete konsekvenser (kr/måned, % hvor muligt)." ]},
    {"heading": "Det kan du gøre", "paragraphs": ["Tjek [de aktuelle timepriser](/elpriser) ... Sammenlign [danske eludbydere](/el-udbydere) ..." ]},
    {"heading": "Kilde & links", "paragraphs": ["Kilde: [officiel kilde](${sourceUrl})" ]}
  ]
}`

  const userPrompt = `NYHED:
Titel: ${sourceTitle}
Kilde-URL: ${sourceUrl}
Publiceret: ${opts.publishedAt || 'Dags dato'}

${extractedText ? `Kontekst fra kilden (brug KUN til forståelse, parafrasér aldrig direkte):\n${extractedText.slice(0, 3000)}\n` : ''}

VIGTIGT - LINK-EKSEMPLER:
✓ KORREKT: "Ifølge [den nye aftale](${sourceUrl}) vil danskerne..."
✓ KORREKT: "Det fremgår af [regeringens udmelding](${sourceUrl}), at..."
  ✓ Det er OK at skrive en afsluttende "Kilde:"-linje
  ✓ Det er OK at nævne myndigheden ved navn

INTERNE LINKS - EKSEMPLER:
✓ "Tjek [de aktuelle timepriser](/elpriser) for at..."
✓ "Sammenlign [danske eludbydere](/el-udbydere) og find..."
✓ "Se [elpriserne](/elpriser) i dag"

Skriv nu en ${minWords}+ ord artikel der fortolker nyheden for danske elforbrugere.

🔴 FINAL CHECK FØR DU SVARER:
1. Har jeg inkluderet kildelink i [markdown format](url)? ✓
2. Har jeg inkluderet mindst 2 links til /elpriser? ✓
3. Har jeg inkluderet mindst 1 link til /el-udbydere? ✓
4. Er alle links i [tekst](url) format? ✓

Hvis IKKE alle 4 er JA, tilføj links NU!`

  try {
    const { type, client } = getAIClient()
    let responseText = ''

    if (type === 'openai') {
      // Use OpenAI GPT-4o (faster and cheaper than Claude)
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 8192, // Increased to allow for longer articles
      })
      responseText = completion.choices[0]?.message?.content || ''
      console.log('[OpenAI] Generated response length:', responseText.length, 'chars')
      console.log('[OpenAI] First 500 chars:', responseText.slice(0, 500))
      console.log('[OpenAI] Contains markdown links?', responseText.includes('[') && responseText.includes(']('))
    } else {
      // Use Anthropic Claude (fallback)
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })
      responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    }

    // Try to extract JSON from code blocks or raw text
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : responseText

    let parsed = JSON.parse(jsonText.trim())

    // Log the parsed structure for debugging
    console.log('[AI] Parsed sections count:', parsed.sections?.length || 0)
    console.log('[AI] First section:', JSON.stringify(parsed.sections?.[0]).slice(0, 200))

    // Count total words in all sections
    let totalWords = 0
    for (const section of parsed.sections || []) {
      for (const para of section.paragraphs || []) {
        totalWords += para.split(/\s+/).length
      }
    }
    console.log(`[AI] Total word count in generated content: ${totalWords} words`)

    // Count links in the content
    let linkCount = 0
    let hasElpriserLink = false
    let hasElUdbydereLink = false
    let hasSourceLink = false
    for (const section of parsed.sections || []) {
      for (const para of section.paragraphs || []) {
        const links = para.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []
        linkCount += links.length
        if (para.includes('](/elpriser)')) hasElpriserLink = true
        if (para.includes('](/el-udbydere)')) hasElUdbydereLink = true
        if (para.includes(`](${sourceUrl})`)) hasSourceLink = true
      }
    }
    console.log(`[AI] Link count: ${linkCount} (elpriser: ${hasElpriserLink}, el-udbydere: ${hasElUdbydereLink}, source: ${hasSourceLink})`)

    const needsRetry = totalWords < minWords || linkCount < 3 || !hasElpriserLink || !hasElUdbydereLink || !hasSourceLink

    if (needsRetry) {
      const reasons: string[] = []
      if (totalWords < minWords) reasons.push(`only ${totalWords} words (need ${minWords})`)
      if (linkCount < 3) reasons.push(`only ${linkCount} links (need 3+)`)
      if (!hasElpriserLink) reasons.push('missing /elpriser link')
      if (!hasElUdbydereLink) reasons.push('missing /el-udbydere link')
      if (!hasSourceLink) reasons.push('missing source link')

      console.log(`[AI] ❌ QUALITY CHECK FAILED: ${reasons.join(', ')}. RETRYING...`)

      // Retry with even MORE aggressive prompt
      const retryPrompt = `🚨 DIT SVAR BLEV AFVIST! 🚨

PROBLEMER med dit svar:
${reasons.map(r => `❌ ${r}`).join('\n')}

CRITICAL REQUIREMENTS DU SKAL FØLGE:

1. WORD COUNT: Minimum ${minWords} ord total
   - Hver paragraph: 80-120 ord
   - Tilføj flere detaljer, eksempler, konkrete tal

2. LINKS ER OBLIGATORISKE (du glemte dem!):
   ${!hasSourceLink ? `❌ DU SKAL INKLUDERE: "Ifølge [beslutningen](${sourceUrl}) vil..."` : ''}
   ${!hasElpriserLink ? `❌ DU SKAL INKLUDERE: "Tjek [aktuelle elpriser](/elpriser) for at..."` : ''}
   ${!hasElpriserLink ? `❌ DU SKAL INKLUDERE: "Se [dagens priser](/elpriser) her"` : ''}
   ${!hasElUdbydereLink ? `❌ DU SKAL INKLUDERE: "Sammenlign [danske eludbydere](/el-udbydere) og..."` : ''}
   - ALLE links skal være i [tekst](url) format
   - Minimum 5 links i alt

PRØV IGEN NU - og GLEM IKKE LINKS!

${userPrompt}`

      const retryCompletion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: retryPrompt },
        ],
        temperature: 0.8, // Slightly higher for more variation
        max_tokens: 8192,
      })

      const retryResponse = retryCompletion.choices[0]?.message?.content || ''
      console.log('[AI] RETRY - Response length:', retryResponse.length, 'chars')

      // Parse retry response
      const retryJsonMatch = retryResponse.match(/```json\s*([\s\S]*?)\s*```/) || retryResponse.match(/```\s*([\s\S]*?)\s*```/)
      const retryJsonText = retryJsonMatch ? retryJsonMatch[1] : retryResponse
      const retryParsed = JSON.parse(retryJsonText.trim())

      // Count retry words
      let retryTotalWords = 0
      for (const section of retryParsed.sections || []) {
        for (const para of section.paragraphs || []) {
          retryTotalWords += para.split(/\s+/).length
        }
      }
      console.log(`[AI] RETRY - Total word count: ${retryTotalWords} words`)

      if (retryTotalWords >= minWords) {
        console.log('[AI] ✓ RETRY SUCCESS - Using retry content')
        // Use retry content
        responseText = retryResponse
        parsed = retryParsed
        totalWords = retryTotalWords
      } else {
        console.log(`[AI] ✗ RETRY FAILED - Still only ${retryTotalWords} words, using original`)
        // Keep original even if short
      }
    }

    // Convert Claude's structured output to Sanity Portable Text blocks
    const blocks: any[] = []
    const markDefs: any[] = []

    for (const section of parsed.sections || []) {
      // Add heading
      if (section.heading) {
        blocks.push({
          _type: 'block',
          _key: Math.random().toString(36).slice(2),
          style: 'h2',
          children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), text: section.heading }],
          markDefs: [],
        })
      }

      // Add paragraphs
      for (const para of section.paragraphs || []) {
        // Parse markdown links in paragraphs
        const children: any[] = []
        const blockMarkDefs: any[] = []
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
        let lastIndex = 0
        let match

        while ((match = linkRegex.exec(para)) !== null) {
          const linkText = match[1]
          const linkUrl = match[2]

          // Add text before link
          if (match.index > lastIndex) {
            const textBefore = para.slice(lastIndex, match.index)
            if (textBefore) {
              children.push({
                _type: 'span',
                _key: Math.random().toString(36).slice(2),
                text: textBefore,
                marks: [],
              })
            }
          }

          // Create unique mark key for this link
          const markKey = Math.random().toString(36).slice(2)

          // Add link definition to markDefs
          blockMarkDefs.push({
            _key: markKey,
            _type: 'link',
            href: linkUrl,
          })

          // Add link span with mark reference
          children.push({
            _type: 'span',
            _key: Math.random().toString(36).slice(2),
            text: linkText,
            marks: [markKey],
          })

          lastIndex = match.index + match[0].length
        }

        // Add remaining text
        if (lastIndex < para.length) {
          const remainingText = para.slice(lastIndex)
          if (remainingText) {
            children.push({
              _type: 'span',
              _key: Math.random().toString(36).slice(2),
              text: remainingText,
              marks: [],
            })
          }
        }

        // Only add block if we have children
        if (children.length > 0) {
          blocks.push({
            _type: 'block',
            _key: Math.random().toString(36).slice(2),
            style: 'normal',
            children,
            markDefs: blockMarkDefs,
          })
        }
      }
    }

    // Wrap in richTextSection
    const richTextBlocks = [{
      _type: 'richTextSection',
      _key: Math.random().toString(36).slice(2),
      title: parsed.title,
      content: blocks,
    }]

    return {
      title: parsed.title,
      description: parsed.description,
      blocks: richTextBlocks,
    }
  } catch (error: any) {
    console.error('[Claude Generation Error]', error?.message || error)
    throw new Error(`Claude content generation failed: ${error?.message || 'Unknown error'}`)
  }
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
}, extra?: { minWords?: number }): { title: string; description: string; blocks: any[] } {
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
  const minWords = Math.max(0, extra?.minWords || 350)
  const targetWords = Math.max(minWords, Math.min(1300, baseTarget))

  // Content generation using the new Danish news interpretation prompt with longer, more substantial paragraphs
  const contentTemplates = {
    // Opening hooks - consumer-focused news interpretation (50-70 words each)
    openings: [
      `Som dansk elforbruger er det vigtigt at forstå, hvordan ${sourceTitle.toLowerCase()} påvirker dig og din elregning. De seneste års udvikling på det danske elmarked har vist, at selv små ændringer i energipolitikken kan have stor betydning for danskernes hverdag og økonomi. I denne artikel gennemgår vi, hvad denne nyhed betyder for dig, og hvordan du bedst kan navigere i den nuværende situation.`,
      `For alle danske husholdninger er det relevant at vide, hvad ${sourceTitle.toLowerCase()} betyder for elpriserne og dit forbrug. Det danske energimarked er i konstant udvikling, og som forbruger er det vigtigt at holde sig opdateret på de ændringer, der kan påvirke din daglige økonomi. Her får du et overblik over situationen og konkrete råd til, hvordan du kan optimere dit forbrug.`,
      `Hvis du betaler for strøm i Danmark, påvirker ${sourceTitle.toLowerCase()} dig direkte - her er hvad du skal vide. Som elforbruger i Danmark står du midt i en tid med store forandringer på energimarkedet. Denne udvikling har konsekvenser for både elpriser, forsyningssikkerhed og dine muligheder som forbruger. Vi har samlet det vigtigste information, så du kan træffe de bedste beslutninger for din husstand.`
    ],

    // Consumer impact explanations - what it means for consumers (60-80 words each)
    impacts: [
      `For en typisk dansk familie betyder det, at din elregning kan ændre sig markant i de kommende måneder. Erfaringer fra tidligere år viser, at elprisen kan svinge betydeligt afhængigt af både nationale og internationale forhold. Det er derfor vigtigt at være opmærksom på, hvordan disse ændringer påvirker netop din husstand, og hvilke muligheder du har for at minimere udgifterne gennem smart planlægning af dit elforbrug.`,
      `Det kan direkte påvirke, hvor meget du betaler for strøm hver måned, og hvilke muligheder du har som forbruger. For mange danske familier udgør elregningen en væsentlig del af de faste udgifter, og selv små stigninger kan mærkes på budgettet. Derfor er det afgørende at forstå sammenhængen mellem markedsudviklingen og din personlige økonomi, så du kan træffe informerede valg om dit energiforbrug og valg af elselskab.`,
      `Som forbruger betyder det, at du kan spare betydelige beløb på din elregning ved at forstå de nye forhold på elmarkedet. Danske husholdninger har i gennemsnit et årligt elforbrug på omkring 4.000 kWh, og med de rette strategier kan du reducere både dit forbrug og dine udgifter markant. Det handler om at kombinere indsigt i markedet med praktiske ændringer i dine forbrugsvaner.`,
      `Det kan give dig mulighed for at optimere dit elforbrug og spare penge, hvis du handler klogt og følger udviklingen nøje. Med det stigende fokus på bæredygtighed og effektivisering er der kommet flere værktøjer og muligheder for forbrugere, der vil have større kontrol over deres energiforbrug. Ved at udnytte disse muligheder aktivt kan du både spare penge og bidrage til den grønne omstilling.`
    ],

    // Practical savings advice - actionable consumer tips (70-90 words each)
    savings: [
      `Du kan spare betydelige beløb ved at følge timepriserne nøje og flytte dit elforbrug til de billigste timer på døgnet. Især energikrævende aktiviteter som opvask, tøjvask og tørretumbler bør planlægges til off-peak timer, hvor elpriserne typisk er lavest. Med de moderne smart home løsninger kan du endda automatisere dette, så dine apparater kører på de mest økonomiske tidspunkter uden, at du skal tænke over det.`,
      `Med smarte vaner og bevidst planlægning kan du reducere din elregning med flere hundrede kroner om året, og i nogle tilfælde endda over tusind kroner. Det handler ikke nødvendigvis om at ændre dit liv drastisk, men om at forstå, hvornår det er smartest at bruge strøm, og hvordan du kan undgå spidslast-perioder. Mange danskere har allerede opdaget, at små justeringer i hverdagen kan give overraskende stor effekt på den samlede elregning.`,
      `Ved at optimere dit elforbrug systematisk kan du spare op til 2.000 kr. eller mere årligt, afhængigt af din husstands forbrug og vaner. Start med at identificere de største elslugere i dit hjem - typisk varmtvandsbeholder, køleskab, frysere og opvarmning. Ved at fokusere på disse områder først, får du den største effekt af dine besparelsesinitiativer. Kombiner dette med smart timing af dit forbrug, og besparelserne vil hurtigt blive synlige.`,
      `Små, enkle ændringer i dine daglige rutiner kan betyde store besparelser på din elregning over tid. Det kan være så simpelt som at sænke temperaturen i dit hjem med en enkelt grad, skifte til LED-pærer overalt, eller slukke for apparater helt i stedet for at lade dem stå på standby. Når disse små tiltag lægges sammen, kan de nemt spare dig for hundredvis af kroner om måneden.`
    ],

    // Practical tips - what consumers can do (50-70 words each)
    tips: [
      `Tjek timepriserne dagligt og planlæg dine energikrævende aktiviteter til de billigste timer. Mange elselskaber tilbyder nu apps, hvor du kan følge prisudviklingen i realtid og få notifikationer, når priserne er særligt lave. Dette gør det nemt at planlægge store forbrugsaktiviteter som opladning af elbil eller brug af vaskemaskine til de mest økonomiske tidspunkter.`,
      `Brug timer-funktioner på dine hvidevarer strategisk for at optimere dit forbrug og spare penge hver dag. Moderne opvaskemaskiner, vaskemaskiner og tørretumblere har ofte indbyggede forsinkede start-funktioner, som du kan indstille til at køre om natten, hvor elpriserne typisk er lavest. Dette er en nem måde at spare penge på uden at ændre dine vaner.`,
      `Oplad din elbil i off-peak timer, typisk mellem kl. 23 og 06, for at spare betydeligt på din elregning. En fuld opladning af en elbil kan nemt koste 50-100 kr., men ved at vælge de rigtige tidspunkter kan du reducere denne udgift med op til 30-40%. Mange elbiler har smart-opladning indbygget, så det sker automatisk.`,
      `Sluk for standby-forbrug konsekvent og spar op til 500-800 kr. årligt på unødvendigt strømforbrug. Mange elektroniske apparater bruger strøm, selvom de er slukket, især TV, computere, kaffemaskiner og mikroovne. Ved at bruge stikdåser med tænd/sluk knap kan du nemt slukke for flere apparater på én gang.`,
      `Sammenlign eludbydere minimum én gang årligt for at sikre dig, at du får den bedste pris på markedet. Elmarkedet er konkurrencepræget, og nye tilbud dukker jævnligt op. Ved at skifte til et selskab med bedre priser kan du spare flere tusind kroner om året. Brug online sammenligningsværktøjer for at finde det bedste tilbud til netop dine behov.`,
      `Overvej at skifte til en eludbyder, der tilbyder dynamiske timepriser, hvis du har mulighed for at styre dit forbrug fleksibelt. For husstande med høj fleksibilitet - for eksempel med varmepumpe, elbil eller stor elektrisk opvarmning - kan dynamiske priser give betydelige besparelser. Dog kræver det også, at du er villig til at justere dit forbrug efter priserne.`,
      `Invester i smart home teknologi for automatisk at styre dit forbrug efter de laveste priser. Smart termostater, styrede stikkontakter og energiovervågningssystemer kan hjælpe dig med at optimere forbruget uden besvær. Selvom der er en initial investering, betaler denne form for teknologi sig typisk hjem på 1-3 år.`,
      `Hold øje med dit månedlige forbrug og sæt mål for reduktion - bare 10% mindre forbrug kan spare flere hundrede kroner om måneden. De fleste elselskaber tilbyder nu detaljerede forbrugsrapporter, hvor du kan se præcis, hvornår og hvordan du bruger strøm. Brug denne indsigt aktivt til at identificere muligheder for besparelser.`
    ],

    // Future outlook - what to expect (60-80 words each)
    outlooks: [
      `Fremadrettet kan vi forvente mere stabile og forudsigelige elpriser for danske forbrugere, efterhånden som Danmark øger andelen af vedvarende energi. Med den fortsatte udbygning af vindkraft, solceller og andre grønne energikilder forventes elpriserne at blive mindre afhængige af volatile internationale brændselspriser. Dette vil give forbrugerne bedre mulighed for at planlægge deres økonomi og potentielt nyde godt af lavere gennemsnitspriser på sigt.`,
      `Det kan give dig markant bedre muligheder for at spare på din elregning i fremtiden gennem nye teknologier og markedsmodeller. Udviklingen går mod mere intelligent energistyring, hvor dit hjem automatisk kan tilpasse forbruget efter priserne. Dette kombineret med stigende konkurrence mellem elselskaber og flere grønne energiløsninger betyder, at forbrugere får stadig flere værktøjer til at optimere deres energiudgifter.`,
      `Som forbruger kan du forvente mere gennemsigtige og fleksible elprismodeller, der giver dig større kontrol over dine udgifter. Elmarkedet bliver mere digitaliseret, og det åbner op for innovative løsninger, hvor du kan få realtidsindsigt i dit forbrug og dine omkostninger. Dette gør det nemmere at træffe informerede beslutninger og tilpasse dit forbrug for maksimal økonomi.`,
      `Det kan åbne nye muligheder for almindelige forbrugere til at deltage aktivt i energisystemet og måske endda tjene penge. Fremtidens energisystem vil i højere grad inddrage forbrugerne, for eksempel gennem muligheden for at sælge overskudsstrøm fra solceller tilbage til nettet, eller ved at lade din elbil fungere som et batterilager, der kan levere strøm tilbage til systemet i spidsbelastningsperioder.`
    ],

    // Call-to-action templates for internal linking (40-50 words each)
    ctas: [
      `Vil du have et komplet overblik over, hvordan de aktuelle ændringer påvirker dit valg af elselskab? Se vores opdaterede sammenligning af eludbydere, hvor vi har samlet alle relevante oplysninger om priser, abonnementstyper og særlige tilbud, så du kan træffe et informeret valg.`,
      `Få fuld gennemsigtighed over alle danske eludbydere og find præcis den aftale, der passer perfekt til dit forbrugsmønster og din families behov. Vores sammenligningstool giver dig mulighed for at filtrere på pris, grøn energi, kundeservice og meget mere, så du finder det optimale match.`,
      `Sammenlign alle de førende eludbydere på det danske marked og find den mest fordelagtige aftale til netop dit hjem. Uanset om du prioriterer den laveste pris, grøn energi, god kundeservice eller fleksible abonnementer, hjælper vores detaljerede oversigt dig med at navigere i junglen af tilbud og vælge det rigtige selskab.`,
      `Tag det første skridt mod en lavere elregning ved at tjekke vores løbende opdaterede oversigt over danske eludbydere, hvor du kan sammenligne priser, læse anmeldelser fra andre kunder og se, hvilke selskaber der tilbyder de bedste betingelser lige nu. Det tager kun få minutter at finde en potentiel besparelse.`
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

  // Section 4: What consumers can do - add all actionable tips to reach target
  let tipIndex = 0
  while (approx < targetWords * 0.85 && tipIndex < contentTemplates.tips.length * 3) {
    const tip = contentTemplates.tips[(seed + tipIndex) % contentTemplates.tips.length]
    paragraphs.push(tip)
    approx += tip.split(/\s+/).length
    tipIndex++
  }

  // Add more impact explanations if we still need words
  let impactIndex = 2
  while (approx < targetWords * 0.90 && impactIndex < contentTemplates.impacts.length * 2) {
    const impact = contentTemplates.impacts[(seed + impactIndex) % contentTemplates.impacts.length]
    paragraphs.push(impact)
    approx += impact.split(/\s+/).length
    impactIndex++
  }

  // Add more savings advice if we still need words
  let savingsIndex = 1
  while (approx < targetWords * 0.93 && savingsIndex < contentTemplates.savings.length * 2) {
    const saving = contentTemplates.savings[(seed + savingsIndex) % contentTemplates.savings.length]
    paragraphs.push(saving)
    approx += saving.split(/\s+/).length
    savingsIndex++
  }

  // Add future outlook
  const outlook = contentTemplates.outlooks[seed % contentTemplates.outlooks.length]
  paragraphs.push(outlook)
  approx += outlook.split(/\s+/).length

  // Add more outlooks if we still need words
  let outlookIndex = 1
  while (approx < targetWords * 0.96 && outlookIndex < contentTemplates.outlooks.length * 2) {
    const futureOutlook = contentTemplates.outlooks[(seed + outlookIndex) % contentTemplates.outlooks.length]
    paragraphs.push(futureOutlook)
    approx += futureOutlook.split(/\s+/).length
    outlookIndex++
  }

  // Add specific consumer advice based on topic
  const topic = classifyTopic(`${sourceTitle} ${extractedText}`)
  if (topic) {
    const topicAdvice = getTopicSpecificAdvice(topic, seed)
    if (topicAdvice) {
      paragraphs.push(topicAdvice)
      approx += topicAdvice.split(/\s+/).length
    }
  }

  // Add call-to-action with internal linking
  const cta = contentTemplates.ctas[seed % contentTemplates.ctas.length]
  paragraphs.push(cta)
  approx += cta.split(/\s+/).length

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

async function createDraftFromFeedItem(item: any, opts?: { force?: boolean; minWords?: number }) {
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

  // Generate article using shared pipeline (non‑templated, guideline‑driven)
  const pipelineOut = await runSourcePipeline({
    title: item.title || 'Nyhed',
    sourceUrl: item.link,
    extractedText: extracted?.contentText || '',
    minWords: opts?.minWords || 700,
    prefer: 'openai'
  })

  const draft = {
    title: pipelineOut.draft.title || (item.title || 'Nyhed'),
    description: pipelineOut.draft.description || `Guide til ${(item.title || 'nyhed')}`,
    blocks: pipelineOut.contentBlocks,
  }

  const readTime = pipelineOut.readTime

  const canonical = normalizeUrl((item.link as string) || (item.guid as string)) || (item.isoDate as string) || (item.title as string) || 'nyhed'
  const stable = simpleHash(canonical).toString(36)
  const slug = slugify(`${item.title || 'nyhed'}-${stable}`)
  // Persistent dedupe: skip if a blogPost already exists with this slug (unless force update)
  // Check for both draft and published versions
  try {
    const existing = await sanity.fetch(
      `*[_type == "blogPost" && (_id == $draftId || _id == $publishedId || slug.current == $slug || sourceUrl == $sourceUrl)][0]{ _id }`,
      { draftId: `drafts.blogPost_${slug}`, publishedId: `blogPost_${slug}`, slug, sourceUrl: canonical }
    )
    if (existing?._id) {
      if (opts?.force) {
        // Update existing document with new Claude-generated content and SEO
        // Flatten richTextSection blocks to classic Portable Text for visible Body field
        const bodyBlocks = (draft.blocks || []).flatMap((b: any) => Array.isArray(b?.content) ? b.content : [])
        await sanity.patch(existing._id)
          .set({
            title: draft.title,
            description: draft.description,
            contentBlocks: draft.blocks,
            body: bodyBlocks,
            readTime,
            seoMetaTitle: draft.title,
            seoMetaDescription: draft.description,
          })
          .commit()
        seen.add(canonical || guid)
        return { updatedId: existing._id, slug }
      } else {
        seen.add(canonical || guid)
        return { skipped: true, reason: 'exists', slug }
      }
    }
  } catch { }
  // Create as draft for manual publishing workflow
  const doc = {
    _type: 'blogPost',
    _id: `drafts.blogPost_${slug}`,
    title: draft.title,
    slug: { _type: 'slug', current: slug },
    type: 'Blog',
    description: draft.description,
    contentBlocks: draft.blocks,
    body: (draft.blocks || []).flatMap((b: any) => Array.isArray(b?.content) ? b.content : []),
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

async function ingestOnce(options?: { force?: boolean; titleContains?: string; slug?: string; minWords?: number }) {
  const parser = new Parser()
  const feed = await parser.parseURL(FEED_URL)
  const results: any[] = []
  for (const item of feed.items || []) {
    // Optional filtering to a single item by title or slug fragment
    if (options?.titleContains) {
      const t = (item.title || '').toLowerCase()
      if (!t.includes(options.titleContains.toLowerCase())) continue
    }
    if (options?.slug) {
      const t = (item.title || '').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$|/g, '')
      if (!t.includes(options.slug.toLowerCase())) continue
    }
    // Basic dedupe by GUID/link (skip if force=true for testing single articles)
    const key = item.guid || item.link
    if (!options?.force && (!key || seen.has(key))) {
      results.push({ skipped: true, reason: 'duplicate', title: item.title })
      continue
    }
    try {
      const out = await createDraftFromFeedItem(item, { force: options?.force, minWords: options?.minWords })
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
    const force = req.nextUrl.searchParams.get('force') === '1' || req.nextUrl.searchParams.get('force') === 'true'
    const minWords = parseInt(req.nextUrl.searchParams.get('minWords') || '700', 10)
    const titleContains = req.nextUrl.searchParams.get('titleContains') || undefined
    const slug = req.nextUrl.searchParams.get('slug') || undefined
    const data = await ingestOnce({ force, minWords, titleContains, slug })
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
