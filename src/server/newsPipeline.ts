import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { computeStats, sectionsToPortableText, estimateReadTimeFromBlocks, ArticleDraft } from './newsFormatter'
import { buildGuidelinePrompt } from './newsGuidelines'

type LLM = 'openai' | 'anthropic'

function getAIClient(prefer?: LLM): { type: LLM; client: any } {
  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (prefer === 'openai' && openaiKey) return { type: 'openai', client: new OpenAI({ apiKey: openaiKey }) }
  if (prefer === 'anthropic' && anthropicKey) return { type: 'anthropic', client: new Anthropic({ apiKey: anthropicKey }) }
  if (openaiKey) return { type: 'openai', client: new OpenAI({ apiKey: openaiKey }) }
  if (anthropicKey) return { type: 'anthropic', client: new Anthropic({ apiKey: anthropicKey }) }
  throw new Error('Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is configured')
}

function externalSourcesFor(topicOrKeyword: string): Array<{ name: string; url: string }> {
  const s = topicOrKeyword.toLowerCase()
  const out: Array<{ name: string; url: string }> = []
  if (/elpris|elpriser|spot|fastpris|kwh|forbrug/.test(s)) {
    out.push({ name: 'Energistyrelsen', url: 'https://ens.dk/' }, { name: 'Energinet', url: 'https://energinet.dk/' })
  }
  if (/tarif|nettarif|net/.test(s)) out.push({ name: 'Green Power Denmark', url: 'https://greenpowerdenmark.dk/' })
  if (/co2|udledning/.test(s)) out.push({ name: 'Klima-, Energi- og Forsyningsministeriet', url: 'https://kefm.dk/' })
  if (/vind/.test(s)) out.push({ name: 'Energistyrelsen – Vind', url: 'https://ens.dk/ansvarsomraader/vindenergi' })
  if (/sol/.test(s)) out.push({ name: 'Energistyrelsen – Sol', url: 'https://ens.dk/ansvarsomraader/solenergi' })
  if (out.length === 0) out.push({ name: 'Energistyrelsen', url: 'https://ens.dk/' })
  return out
}

function addCtaAndSources(keywordOrTopic: string, draft: ArticleDraft): ArticleDraft {
  const sections = Array.isArray(draft.sections) ? [...draft.sections] : []
  // Ensure CTA
  const hasElpriser = sections.some(s => (s.paragraphs||[]).some(p => p.includes('](/elpriser)')))
  const hasUdbydere = sections.some(s => (s.paragraphs||[]).some(p => p.includes('](/el-udbydere)')))
  const cta: string[] = []
  if (!hasElpriser) cta.push('Tjek [de aktuelle timepriser](/elpriser) og planlæg de energitunge opgaver i de billigste timer.')
  if (!hasUdbydere) cta.push('Sammenlign [danske eludbydere](/el-udbydere) og find en aftale, der passer til dit forbrug.')
  if (cta.length) {
    if (sections.length > 0) {
      const last = sections[sections.length - 1]
      last.paragraphs = [...(last.paragraphs||[]), cta.join(' ')]
    } else {
      sections.push({ paragraphs: [cta.join(' ')] })
    }
  }

  // Ensure sources
  const links = externalSourcesFor(keywordOrTopic).slice(0,3).map(s => `[${s.name}](${s.url})`)
  const srcPara = `Kilder: ${links.join(', ')}`
  const hasAny = sections.some(s => (s.paragraphs||[]).some(p => /\]\(http/i.test(p)))
  if (!hasAny) {
    if (sections.length > 0) {
      const last = sections[sections.length - 1]
      last.paragraphs = [...(last.paragraphs||[]), srcPara]
    } else {
      sections.push({ paragraphs: [srcPara] })
    }
  }

  return { ...draft, sections }
}

async function topUpIfShort(draft: ArticleDraft, minWords: number, prefer?: LLM): Promise<ArticleDraft> {
  const { totalWords } = computeStats(draft)
  if (totalWords >= minWords) return draft
  const { type, client } = getAIClient(prefer)
  const user = `FORLÆNG artiklen nedenfor. Behold tone og stil.\n${buildGuidelinePrompt({ minWords })}\nUddyb baggrund og relevans for danske forbrugere med konkrete eksempler og fakta. Brug H2-overskrifter hvor det giver mening. Returner KUN JSON i samme struktur.\n${JSON.stringify(draft)}`
  if (type === 'openai') {
    const r = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.6, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: 'Du skriver danske forbrugerrettede artikler for Din Elportal.' },
      { role: 'user', content: user }
    ], max_tokens: 8192 })
    const txt = r.choices[0]?.message?.content || ''
    return JSON.parse(txt)
  } else {
    const r = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', temperature: 0.6, max_tokens: 4096, messages: [
      { role: 'user', content: user }
    ]})
    const txt = r.content[0].type === 'text' ? r.content[0].text : ''
    return JSON.parse(txt)
  }
}

export async function runSourcePipeline(input: { title: string; sourceUrl: string; extractedText?: string; minWords: number; prefer?: LLM }) {
  const { type, client } = getAIClient(input.prefer)
  const sys = 'Du skriver danske forbrugerrettede artikler for Din Elportal. Returner KUN JSON.'
  const prompt = `NYHED\nTitel: ${input.title}\nKilde: ${input.sourceUrl}\nKontekst (kun som baggrund): ${(input.extractedText||'').slice(0,2500)}\n\n${buildGuidelinePrompt({ minWords: input.minWords })}\n\nKrav til svar:\n- Minimum ${input.minWords} ord samlet.\n- Brug meningsfulde H2-overskrifter hvor det giver mening (ingen faste labels).\n- Inkludér naturlige links (mindst 2 interne og mindst 2 officielle eksterne).\n- Returner KUN JSON i formatet { "title": "...", "description": "...", "sections": [ { "heading": "...", "paragraphs": ["..."] } ] }.`
  let text = ''
  if (type === 'openai') {
    const r = await client.chat.completions.create({ model: 'gpt-4o', temperature: 0.6, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: sys },
      { role: 'user', content: prompt }
    ], max_tokens: 8192 })
    text = r.choices[0]?.message?.content || ''
  } else {
    const r = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', temperature: 0.6, max_tokens: 4096, messages: [
      { role: 'user', content: prompt }
    ]})
    text = r.content[0].type === 'text' ? r.content[0].text : ''
  }
  let draft: ArticleDraft = JSON.parse(text)
  draft = addCtaAndSources(input.title, draft)
  draft = await topUpIfShort(draft, input.minWords, input.prefer)
  const stats = computeStats(draft)
  const { contentBlocks, body } = sectionsToPortableText(draft)
  const readTime = estimateReadTimeFromBlocks(body)
  return { draft, stats, contentBlocks, body, readTime }
}
