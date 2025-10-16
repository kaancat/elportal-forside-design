export interface UnsplashPhoto {
  id: string
  description?: string
  alt_description?: string
  urls: { raw: string; full: string; regular: string; small: string }
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

export async function getUnsplashImage(query: string, uniquenessKey?: string, fallbackTerms: string = 'energy,electricity,denmark'): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  const q = (query || '').trim() || fallbackTerms
  try {
    if (!key) throw new Error('UNSPLASH_ACCESS_KEY not set')
    // Use search endpoint for deterministic pick
    const page = 1
    const perPage = 20
    const resp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=landscape&content_filter=high&page=${page}&per_page=${perPage}`, {
      headers: { Authorization: `Client-ID ${key}` },
      cache: 'no-store'
    })
    if (!resp.ok) throw new Error(`Unsplash error ${resp.status}`)
    const data = await resp.json()
    const results: UnsplashPhoto[] = data?.results || []
    if (results.length === 0) return null
    const selector = uniquenessKey ? (q + '|' + uniquenessKey) : q
    const idx = hash(selector) % results.length
    return results[idx].urls.regular + '&auto=format&fit=crop&w=1600&q=80'
  } catch (e) {
    return null
  }
}

export function getHashedFallbackImage(key: string): string {
  // A small pool of free-to-use Unsplash landscape images (generic energy theme)
  const pool = [
    'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1600&q=80', // wind turbines
    'https://images.unsplash.com/photo-1509395176047-6cf3a6ccbdc8?auto=format&fit=crop&w=1600&q=80', // power lines
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80', // solar panels
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1600&q=80', // grid at dusk
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', // abstract energy
  ]
  const idx = hash(key) % pool.length
  return pool[idx]
}
