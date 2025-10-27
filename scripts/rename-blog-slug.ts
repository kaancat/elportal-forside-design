import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID || 'yxesi03x'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.error('Missing SANITY_API_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', token, useCdn: false })

async function run() {
  const sourceSlug = 'tilskud-til-varmepumper-2025-spar-pa-elregningen'
  const targetSlug = 'tilskud-til-varmepumper-2025-hvad-du-skal-vide'
  const doc = await client.fetch("*[_type=='blogPost' && slug.current==$slug][0]{_id}", { slug: sourceSlug })
  if (!doc?._id) {
    console.error('Source slug not found')
    process.exit(1)
  }
  await client.patch(doc._id).set({ slug: { _type: 'slug', current: targetSlug }, title: 'Tilskud til varmepumper 2025: hvad du skal vide', seoMetaTitle: 'Tilskud til varmepumper 2025: hvad du skal vide' }).commit()
  console.log('Slug updated')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
