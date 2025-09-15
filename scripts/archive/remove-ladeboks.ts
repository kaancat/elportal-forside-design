import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'yxesi03x'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01'
const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.error('Missing SANITY_API_TOKEN in env')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function removeLadeboksFromNavigation() {
  const settings = await client.fetch(`*[_type == "siteSettings"][0]{ _id, headerLinks }`)
  if (!settings?._id) {
    console.log('No siteSettings found; skipping navigation update')
    return
  }
  const before = settings.headerLinks || []
  const filtered = before.filter((link: any) => {
    // Keep any non-link or megamenu as-is unless it explicitly points to ladeboks
    if (link?._type === 'link') {
      const title = (link.title || '').toString().toLowerCase()
      const slug = link?.internalLink?.slug || link?.internalLink?.current || ''
      const isLadeboks = title.includes('ladeboks') || slug === 'ladeboks'
      return !isLadeboks
    }
    if (link?._type === 'megaMenu') {
      // Remove items inside mega menu that point to ladeboks
      const content = Array.isArray(link.content) ? link.content.map((col: any) => {
        const items = Array.isArray(col.items) ? col.items.filter((it: any) => {
          const title = (it?.title || '').toString().toLowerCase()
          const slug = it?.link?.internalLink?.slug || it?.link?.internalLink?.current || ''
          const isLadeboks = title.includes('ladeboks') || slug === 'ladeboks'
          return !isLadeboks
        }) : []
        return { ...col, items }
      }) : []
      return { ...link, content }
    }
    return true
  })

  // If megamenu items were transformed, filtered will have objects not strictly equal
  const changed = JSON.stringify(before) !== JSON.stringify(filtered)
  if (!changed) {
    console.log('Navigation already without ladeboks')
    return
  }
  await client.patch(settings._id).set({ headerLinks: filtered }).commit()
  console.log('✅ Removed ladeboks from navigation headerLinks')
}

async function removeLadeboksFromHomepage() {
  const page = await client.fetch(`*[_type == "page" && isHomepage == true][0]{ _id, contentBlocks }`)
  if (!page?._id) {
    console.log('No homepage found; skipping content update')
    return
  }
  const before = page.contentBlocks || []
  const filtered = before.filter((b: any) => b?._type !== 'chargingBoxShowcase')
  const changed = JSON.stringify(before.map((b: any) => b?._type)) !== JSON.stringify(filtered.map((b: any) => b?._type))
  if (!changed) {
    console.log('Homepage already without chargingBoxShowcase')
    return
  }
  await client.patch(page._id).set({ contentBlocks: filtered }).commit()
  console.log('✅ Removed chargingBoxShowcase from homepage contentBlocks')
}

async function main() {
  try {
    await removeLadeboksFromNavigation()
    await removeLadeboksFromHomepage()
    console.log('Done.')
  } catch (e) {
    console.error('Mutation failed:', e)
    process.exit(1)
  }
}

main()

