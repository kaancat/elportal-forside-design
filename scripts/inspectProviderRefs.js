import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function run() {
  const page = await client.fetch(`*[_type == "page" && isHomepage == true][0]{
    title,
    contentBlocks[_type == "providerList"][0]{
      _key,
      title,
      providers[]{ _type, _ref }
    }
  }`)
  console.log('Homepage:', page?.title)
  const block = page?.contentBlocks
  if (!block) {
    console.log('No providerList block on homepage')
    return
  }
  console.log('Provider refs:', block.providers)

  // Try dereferencing each id individually to see which one is missing
  if (block.providers) {
    for (const ref of block.providers) {
      const doc = await client.fetch(`*[_id == $id][0]{ _id, _type, providerName, productName, isActive }`, {
        id: ref._ref,
      })
      console.log(`- Ref ${ref._ref} ->`, doc || 'MISSING')
    }
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


