import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function sync() {
  try {
    const pages = await client.fetch(`*[_type == "page"]{ _id, title }`)
    let updated = 0

    for (const p of pages) {
      const pubId = p._id
      const draftId = `drafts.${pubId}`

      const [published, draft] = await Promise.all([
        client.fetch(`*[_id == $id][0]{ _id, title, contentBlocks }`, { id: pubId }),
        client.fetch(`*[_id == $id][0]{ _id, title, contentBlocks }`, { id: draftId }),
      ])

      if (!draft?.contentBlocks) continue

      // find providerList blocks in draft
      const draftBlocks = (draft.contentBlocks || []).filter((b) => b?._type === 'providerList')
      if (draftBlocks.length === 0) continue

      // For each matching block index, copy providers array to published
      const pubBlocks = (published?.contentBlocks || [])
      let changed = false
      const setOps = {}

      draftBlocks.forEach((db) => {
        const idx = pubBlocks.findIndex((b) => b?._key === db._key && b?._type === 'providerList')
        if (idx >= 0) {
          const pubProviders = pubBlocks[idx]?.providers || []
          const draftProviders = db.providers || []
          const asIds = (arr) => arr.map((r) => r?._ref || r?._id).filter(Boolean)
          if (JSON.stringify(asIds(pubProviders)) !== JSON.stringify(asIds(draftProviders))) {
            setOps[`contentBlocks[${idx}].providers`] = draftProviders.map((r) => ({
              _type: 'reference',
              _ref: r._ref || r._id,
            }))
            changed = true
          }
        }
      })

      if (changed) {
        console.log(`Syncing providerList refs to published: ${p.title}`)
        await client.patch(pubId).set(setOps).commit()
        updated++
      }
    }

    console.log(`\nDone. Updated ${updated} pages.`)
  } catch (e) {
    console.error('Error syncing provider lists:', e)
    process.exit(1)
  }
}

sync()


