import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function listProviders() {
  const providers = await client.fetch(`*[_type == "provider"] | order(providerName asc){
    _id,
    providerName,
    productName,
    isActive,
    isVindstoedProduct
  }`)
  console.log(`Found ${providers.length} providers`)
  providers.forEach((p) => {
    console.log(`- ${p.providerName} — ${p.productName} | id=${p._id} | active=${p.isActive !== false} | vindstod=${p.isVindstoedProduct ? 'yes' : 'no'}`)
  })
}

listProviders().catch((e) => {
  console.error('Error listing providers:', e)
  process.exit(1)
})


