import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function listProviderDrafts() {
  const docs = await client.fetch(`[
    ...*[_type == "provider" && !(_id in path("drafts.**"))]{
      _id, providerName, productName, isActive, isVindstoedProduct, _updatedAt
    },
    ...*[_type == "provider" && _id in path("drafts.**")] {
      _id, providerName, productName, isActive, isVindstoedProduct, _updatedAt
    }
  ] | order(_id asc)`)

  console.log('Providers (published and drafts):')
  docs.forEach((d) => {
    const isDraft = d._id.startsWith('drafts.')
    console.log(`- ${isDraft ? '[DRAFT] ' : ''}${d.providerName} — ${d.productName} | id=${d._id} | active=${d.isActive !== false} | vindstod=${d.isVindstoedProduct ? 'yes' : 'no'}`)
  })
}

listProviderDrafts().catch((e) => {
  console.error('Error listing provider drafts:', e)
  process.exit(1)
})


