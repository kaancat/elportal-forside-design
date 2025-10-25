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
  const keepSlug = 'tilskud-til-varmepumper-2025-hvad-du-skal-vide'
  const docs = await client.fetch("*[_type == 'blogPost']{ _id, slug }")
  const toDelete = docs.filter((doc: any) => doc.slug?.current !== keepSlug)
  console.log(`Found ${docs.length} blog posts, deleting ${toDelete.length}`)
  if (!toDelete.length) return
  const tx = client.transaction()
  for (const doc of toDelete) tx.delete(doc._id)
  await tx.commit()
  console.log('Deletion complete')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
