import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function testHeroImage() {
  // Get the full page data as the frontend would
  const page = await client.fetch(
    `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0] {
      _id,
      title,
      slug,
      contentBlocks[] {
        _type,
        _key,
        ...,
        image {
          ...,
          asset-> {
            _id,
            url,
            metadata {
              dimensions
            }
          }
        }
      }
    }`
  );
  
  console.log('=== HERO BLOCK ANALYSIS ===\n');
  
  const heroBlock = page.contentBlocks.find(b => b._type === 'hero');
  
  if (heroBlock) {
    console.log('Hero Block Found:');
    console.log('- Type:', heroBlock._type);
    console.log('- Headline:', heroBlock.headline);
    console.log('- Has Image?:', !!heroBlock.image);
    
    if (heroBlock.image) {
      console.log('\nImage Details:');
      console.log('- Asset ID:', heroBlock.image.asset?._id);
      console.log('- CDN URL:', heroBlock.image.asset?.url);
      console.log('- Alt Text:', heroBlock.image.alt);
      console.log('- Dimensions:', heroBlock.image.asset?.metadata?.dimensions);
      
      console.log('\n✅ Hero image is properly configured in Sanity!');
      console.log('\nIf the image is not showing on the website, the issue is likely:');
      console.log('1. The HeroComponent needs to handle the image object structure');
      console.log('2. There might be a CSS issue hiding the image');
      console.log('3. The component might be using a different field name');
      
      console.log('\nDirect image URL:');
      console.log(heroBlock.image.asset?.url);
    } else {
      console.log('\n❌ No image found in hero block');
    }
  } else {
    console.log('❌ No hero block found in content blocks');
  }
}

testHeroImage();