import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function checkHero() {
  const page = await client.fetch(
    `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0] {
      contentBlocks[_type == "hero"][0] {
        _type,
        _key,
        headline,
        subheadline,
        image
      }
    }`
  );
  
  console.log('Full page query result:');
  console.log(JSON.stringify(page, null, 2));
  
  // Also get first block directly
  const firstBlock = await client.fetch(
    `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0].contentBlocks[0]`
  );
  
  console.log('\nFirst content block:');
  console.log(JSON.stringify(firstBlock, null, 2));
}

checkHero();
