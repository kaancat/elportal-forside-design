import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function run() {
  try {
    // 1) Load the current Vindstød doc by manual id
    const current = await client.fetch(
      `*[_type == "provider" && _id == "provider.vindstod-danskvind"][0]`
    )
    if (!current) {
      console.error('Vindstød doc not found by _id=provider.vindstod-danskvind')
      process.exit(1)
    }

    // 2) Create a UUID clone with the same fields but no manual _id
    const { _id: _omit, _rev, _createdAt, _updatedAt, ...rest } = current
    const payload = {
      ...rest,
      _type: 'provider',
      isActive: rest.isActive !== false, // ensure active
    }
    const created = await client.create(payload)
    console.log('Created UUID Vindstød doc:', created._id)

    // 3) Replace references in all published pages' providerList blocks
    const pages = await client.fetch(`*[_type == "page"]{ _id, title, contentBlocks }`)
    let changedPages = 0
    for (const page of pages) {
      const blocks = (page.contentBlocks || []).map((b) => ({ ...b }))
      let mutated = false
      blocks.forEach((b, idx) => {
        if (b?._type !== 'providerList' || !Array.isArray(b.providers)) return
        const newRefs = b.providers.map((r) => {
          const id = r?._ref || r?._id
          if (id === 'provider.vindstod-danskvind') {
            mutated = true
            return { _type: 'reference', _ref: created._id }
          }
          return { _type: 'reference', _ref: id }
        })
        if (mutated) {
          b.providers = newRefs
        }
      })
      if (mutated) {
        await client.patch(page._id).set({ contentBlocks: blocks }).commit()
        changedPages++
        console.log('Updated page refs:', page.title)
      }
    }

    // 4) Optionally deactivate the manual-id doc to avoid accidental use
    await client.patch('provider.vindstod-danskvind').set({ isActive: false }).commit()
    console.log('Deactivated legacy manual-id Vindstød doc.')

    console.log(`\nDone. Updated ${changedPages} pages.`)
  } catch (e) {
    console.error('Error cloning Vindstød to UUID:', e)
    process.exit(1)
  }
}

run()


