export type ArticleSection = { heading?: string; paragraphs?: string[] };
export type ArticleDraft = { title?: string; description?: string; sections?: ArticleSection[] };

export type ArticleStats = {
  totalWords: number;
  linkCount: number;
  hasElpriser: boolean;
  hasUdbydere: boolean;
};

export function computeStats(draft: ArticleDraft): ArticleStats {
  const stats: ArticleStats = { totalWords: 0, linkCount: 0, hasElpriser: false, hasUdbydere: false };
  for (const s of draft.sections || []) {
    for (const p of s.paragraphs || []) {
      stats.totalWords += String(p).split(/\s+/).filter(Boolean).length;
      const links = String(p).match(/\[[^\]]+\]\([^\)]+\)/g) || [];
      stats.linkCount += links.length;
      if (String(p).includes('](/elpriser)')) stats.hasElpriser = true;
      if (String(p).includes('](/el-udbydere)')) stats.hasUdbydere = true;
    }
  }
  return stats;
}

// Convert sections -> Portable Text contentBlocks (richTextSection) + classic body
export function sectionsToPortableText(draft: ArticleDraft) {
  const blocks: any[] = [];
  for (const s of draft.sections || []) {
    // Insert section heading as an H2 block when present
    if (s.heading && String(s.heading).trim().length > 0) {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).slice(2),
        style: 'h2',
        children: [
          { _type: 'span', _key: Math.random().toString(36).slice(2), text: String(s.heading).trim(), marks: [] },
        ],
        markDefs: [],
      })
    }
    for (const para of s.paragraphs || []) {
      const children: any[] = [];
      const markDefs: any[] = [];
      const rx = /\[([^\]]+)\]\(([^)]+)\)/g;
      let last = 0; let m: RegExpExecArray | null;
      while ((m = rx.exec(para)) !== null) {
        const [full, text, href] = m;
        if (m.index > last) {
          const before = para.slice(last, m.index);
          if (before) children.push({ _type: 'span', _key: Math.random().toString(36).slice(2), text: before, marks: [] });
        }
        const key = Math.random().toString(36).slice(2);
        markDefs.push({ _key: key, _type: 'link', href });
        children.push({ _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [key] });
        last = m.index + full.length;
      }
      if (last < para.length) {
        const rest = para.slice(last);
        if (rest) children.push({ _type: 'span', _key: Math.random().toString(36).slice(2), text: rest, marks: [] });
      }
      if (children.length) blocks.push({ _type: 'block', _key: Math.random().toString(36).slice(2), style: 'normal', children, markDefs });
    }
  }
  const contentBlocks = [{ _type: 'richTextSection', _key: Math.random().toString(36).slice(2), title: draft.title, content: blocks }];
  const body = blocks;
  return { contentBlocks, body };
}

export function estimateReadTimeFromBlocks(bodyBlocks: any[]): number {
  const words = bodyBlocks.reduce((sum, b) => sum + (Array.isArray(b?.children) ? b.children.reduce((s: number, c: any) => s + (c?.text ? String(c.text).split(/\s+/).filter(Boolean).length : 0), 0) : 0), 0);
  return Math.max(1, Math.ceil(words / 200));
}

// Format titles so only the first letter is capitalized (sentence case),
// while preserving common uppercase abbreviations (EU, DK1/DK2, CO2, kWh, etc.).
export function formatTitleSentenceCase(input?: string): string {
  if (!input) return ''
  const keepUpper = new Set(['EU', 'DK1', 'DK2', 'CO2', 'kWh', 'kW', 'MW', 'MWh', 'GWh', 'PtX', 'EV', 'V2G'])
  // Trim and collapse spaces
  let s = input.trim().replace(/\s+/g, ' ')
  // Make sentence case naive baseline
  s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  // Restore known uppercase tokens
  s = s.split(/(\b)/).map(tok => keepUpper.has(tok.toUpperCase()) ? tok.toUpperCase() : tok).join('')
  // Preserve all-caps alphanumerics with digits (e.g., DK1, 2025) and tokens >=3
  s = s.replace(/\b([A-Z]{2,}\d*|\d+[A-Z]+)\b/gi, (m) => m.toUpperCase())
  return s
}
