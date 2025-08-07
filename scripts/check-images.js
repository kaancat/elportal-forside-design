import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function checkImages() {
  const page = await client.fetch(
    `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0] {
      title,
      contentBlocks[] {
        _type,
        _key,
        title,
        headline,
        "hasImage": defined(image),
        "imageUrl": image.asset->url
      }
    }`
  );
  
  console.log('Page:', page.title);
  console.log('\nContent blocks with images:');
  
  let imageCount = 0;
  page.contentBlocks.forEach((block, i) => {
    if (block.hasImage) {
      imageCount++;
      const blockNum = i + 1;
      console.log(`✓ Block ${blockNum}: ${block._type} - ${block.title || block.headline || 'No title'}`);
      console.log(`  Image URL: ${block.imageUrl}`);
    }
  });
  
  console.log(`\nTotal blocks with images: ${imageCount} out of ${page.contentBlocks.length}`);
}

checkImages();