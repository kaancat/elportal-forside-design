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
      contentBlocks[0] {
        _type,
        _key,
        headline,
        subheadline,
        image {
          asset-> {
            _id,
            url
          }
        }
      }
    }`
  );
  
  console.log('Hero block details:');
  console.log(JSON.stringify(page.contentBlocks[0], null, 2));
}

checkHero();
