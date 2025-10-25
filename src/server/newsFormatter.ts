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
      if (/\]\(\/(el-udbydere|sammenlign)\)/i.test(String(p)) || /https?:\/\/[^\s)]+\/sammenlign\)/i.test(String(p))) stats.hasUdbydere = true;
    }
  }
  return stats;
}

// Convert sections -> Portable Text contentBlocks (richTextSection) + classic body
export function sectionsToPortableText(draft: ArticleDraft) {
  const blocks: any[] = [];
  const normalizeInternalLink = (href: string) => {
    try {
      // If absolute to our domain, take pathname
      if (/^https?:\/\//i.test(href)) {
        const u = new URL(href)
        if (u.hostname.endsWith('dinelportal.dk')) href = u.pathname || '/'
      }
      // Map known aliases/typos to canonical routes we actually have
      const path = href.trim()
      const aliases: Array<[RegExp, string]> = [
        [/^\/el[- ]?udbydere\/?$/i, '/sammenlign'],
        [/^\/udbydere\/?$/i, '/sammenlign'],
        [/^\/sammenlign\/?$/i, '/sammenlign'],
        [/^\/elpriser\/?$/i, '/elpriser'],
      ]
      for (const [rx, to] of aliases) if (rx.test(path)) return to
      return href
    } catch { return href }
  }
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
        const normHref = normalizeInternalLink(href)
        markDefs.push({ _key: key, _type: 'link', href: normHref });
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
  // Trim and collapse spaces
  let s = input.trim().replace(/\s+/g, ' ')
  // Baseline sentence case
  s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  // Restore preferred casing for known tokens and abbreviations
  const exactCase: Record<string, string> = {
    'eu': 'EU',
    'dk1': 'DK1',
    'dk2': 'DK2',
    'co2': 'CO2',
    'kwh': 'kWh',
    'kw': 'kW',
    'mw': 'MW',
    'mwh': 'MWh',
    'gwh': 'GWh',
    'ptx': 'PtX',
    'ev': 'EV',
    'v2g': 'V2G',
  }
  s = s.replace(/\b([a-z0-9]+)\b/gi, (m) => {
    const key = m.toLowerCase()
    if (exactCase[key]) return exactCase[key]
    // Preserve tokens that mix letters and digits (e.g., 2025Q1, 3G) as uppercase
    if (/[a-z]/i.test(m) && /\d/.test(m)) return m.toUpperCase()
    return m
  })
  return s
}
