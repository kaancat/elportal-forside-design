#!/usr/bin/env tsx
import 'dotenv/config'
import { createClient } from '@sanity/client'

type Block = {
  _type: 'block'
  _key?: string
  children: Array<{ _type: 'span'; _key?: string; text: string; marks?: string[] }>
  markDefs?: Array<{ _key: string; _type: string; href?: string }>
  style?: string
}

type AnyObject = Record<string, any>

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'yxesi03x'
const DATASET = process.env.SANITY_DATASET || 'production'
const API_VERSION = '2025-01-01'
const TOKEN = process.env.SANITY_API_TOKEN!

if (!TOKEN) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1)
}

const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, token: TOKEN, useCdn: false })

// Map of phrases -> internal absolute URL
const LINK_MAP: Array<{ re: RegExp; href: string }> = [
  // Broader variants that capture whole phrases/words
  { re: /\b(elpris(?:er|erne)?)\b/gi, href: 'https://dinelportal.dk/elpriser' },
  { re: /(sammenlign(?:e|ing|ingsværktøj)?(?:\s+elaftaler)*)/gi, href: 'https://dinelportal.dk/leverandoer-sammenligning' },
  { re: /\belselskab(?:er|erne)?\b/gi, href: 'https://dinelportal.dk/elselskaber' },
  { re: /(historiske\s+elpriser|historiske\s+priser)/gi, href: 'https://dinelportal.dk/historiske-priser' },
  { re: /(forbrug\s*tracker)/gi, href: 'https://dinelportal.dk/forbrug-tracker' },
  { re: /(elpris(?:-|\s*)beregner|prisberegner)/gi, href: 'https://dinelportal.dk/elprisberegner' },
  { re: /(prognoser?\s*for\s*elpriser|prognoser?)/gi, href: 'https://dinelportal.dk/prognoser' },
  { re: /\bladeboks(?:e|en)?\b/gi, href: 'https://dinelportal.dk/ladeboks' },
  { re: /(energibesparende\s+tips(?:\s*2025)?)/gi, href: 'https://dinelportal.dk/energibesparende-tips-2025' },
  { re: /\bom\s*os\b/gi, href: 'https://dinelportal.dk/om-os' },
]

function makeKey() { return Math.random().toString(36).slice(2) }

// Build link ranges from a string using LINK_MAP (no overlap, first come first serve)
function findLinkRanges(text: string, limit = 1): Array<{ start: number; end: number; href: string }> {
  const ranges: Array<{ start: number; end: number; href: string }> = []
  let count = 0
  const usedHref = new Set<string>()
  for (const { re, href } of LINK_MAP) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) && count < limit) {
      const start = m.index
      const end = start + m[0].length
      // skip overlaps
      if (ranges.some(r => Math.max(r.start, start) < Math.min(r.end, end))) continue
      if (usedHref.has(href)) continue
      ranges.push({ start, end, href })
      count++
      usedHref.add(href)
    }
  }
  // sort by start
  ranges.sort((a, b) => a.start - b.start)
  return ranges
}

// Apply link mark to text spans based on absolute ranges; preserves non-link marks
function linkifyBlock(block: Block, maxLinksPerBlock = 1): { changed: boolean; block: Block } {
  if (block._type !== 'block' || !Array.isArray(block.children)) return { changed: false, block }

  const text = block.children.map(c => (c._type === 'span' ? c.text : '')).join('')
  if (!text.trim()) return { changed: false, block }

  const ranges = findLinkRanges(text, maxLinksPerBlock)
  if (ranges.length === 0) return { changed: false, block }

  // Remove existing link markDefs
  const cleanMarkDefs = (block.markDefs || []).filter(md => md._type !== 'link')

  // Walk children and split to apply link marks across boundaries
  const newChildren: Block['children'] = []
  let cursor = 0 // absolute index into concatenated text
  for (const child of block.children) {
    if (child._type !== 'span' || !child.text) {
      newChildren.push(child)
      continue
    }
    let offset = 0
    while (offset < child.text.length) {
      const here = cursor + offset
      // Find first range that intersects [here, ...)
      const range = ranges.find(r => r.start < cursor + child.text.length && r.end > here)
      if (!range) {
        // push the rest unchanged
        newChildren.push({ ...child, _key: makeKey(), text: child.text.slice(offset) })
        offset = child.text.length
        break
      }
      if (range.start > here) {
        const chunk = child.text.slice(offset, range.start - cursor)
        newChildren.push({ ...child, _key: makeKey(), text: chunk })
        offset += chunk.length
        continue
      }
      // We are inside a link range
      const endLocal = Math.min(child.text.length, range.end - cursor)
      const chunk = child.text.slice(offset, endLocal)
      const key = makeKey()
      cleanMarkDefs.push({ _key: key, _type: 'link', href: range.href })
      const marks = Array.isArray(child.marks) ? [...child.marks, key] : [key]
      newChildren.push({ ...child, _key: makeKey(), text: chunk, marks })
      offset = endLocal
      // Move to next range if fully consumed
      if (cursor + offset >= range.end) {
        // remove consumed range so we don't reapply
        const idx = ranges.indexOf(range)
        if (idx >= 0) ranges.splice(idx, 1)
      }
    }
    cursor += child.text.length
  }

  return { changed: true, block: { ...block, children: newChildren, markDefs: cleanMarkDefs } }
}

function traverseAndLinkify(node: AnyObject): { changed: boolean; node: AnyObject } {
  let changed = false
  const clone: AnyObject = Array.isArray(node) ? [...node] : { ...node }

  for (const key of Object.keys(clone)) {
    const val = clone[key]
    if (Array.isArray(val)) {
      // If this is a blocks array (portable text)
      if (val.length && val[0] && val[0]._type === 'block') {
        const newBlocks: Block[] = []
        for (const b of val as Block[]) {
          const res = linkifyBlock(b)
          newBlocks.push(res.block)
          if (res.changed) changed = true
        }
        clone[key] = newBlocks
      } else {
        const arr: any[] = []
        for (const item of val) {
          if (item && typeof item === 'object') {
            const r = traverseAndLinkify(item)
            arr.push(r.node)
            if (r.changed) changed = true
          } else {
            arr.push(item)
          }
        }
        clone[key] = arr
      }
    } else if (val && typeof val === 'object') {
      const r = traverseAndLinkify(val)
      clone[key] = r.node
      if (r.changed) changed = true
    }
  }
  return { changed, node: clone }
}

async function main() {
  const pages: any[] = await client.fetch(`*[_type == "page"]{ _id, "slug": slug.current, title, contentBlocks }`)
  console.log(`Found ${pages.length} pages`)

  const tx = client.transaction()
  let changedCount = 0

  for (const page of pages) {
    const res = traverseAndLinkify(page.contentBlocks || [])
    if (res.changed) {
      changedCount++
      tx.patch(page._id, p => p.set({ contentBlocks: res.node }))
      console.log(` + Will update: /${page.slug}`)
    } else {
      console.log(` - No change: /${page.slug}`)
    }
  }

  if (changedCount > 0) {
    const out = await tx.commit()
    console.log(`Committed changes to ${changedCount} pages.`)
  } else {
    console.log('No changes needed.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
