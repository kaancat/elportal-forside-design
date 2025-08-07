import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function testHeroRendering() {
  // Simulate the exact query used by the frontend
  const query = `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0] {
    _id,
    _type,
    title,
    slug,
    seoMetaTitle,
    seoMetaDescription,
    contentBlocks[] {
      ...
    }
  }`;
  
  const page = await client.fetch(query);
  
  console.log('=== HERO IMAGE DEBUGGING ===\n');
  
  const heroBlock = page.contentBlocks.find(b => b._type === 'hero');
  
  if (heroBlock) {
    console.log('Hero Block Structure:');
    console.log(JSON.stringify(heroBlock, null, 2));
    
    console.log('\n=== ANALYSIS ===');
    console.log('✅ Hero block exists');
    console.log('✅ Image asset reference:', heroBlock.image?.asset?._ref);
    console.log('✅ Image alt text:', heroBlock.image?.alt);
    
    // Generate the CDN URL manually
    if (heroBlock.image?.asset?._ref) {
      const ref = heroBlock.image.asset._ref;
      const [, assetId, dimensions, format] = ref.match(/^image-([a-z0-9]+)-(\d+x\d+)-(\w+)$/) || [];
      const cdnUrl = `https://cdn.sanity.io/images/yxesi03x/production/${assetId}-${dimensions}.${format}`;
      
      console.log('\n=== IMAGE URL ===');
      console.log('Direct CDN URL:', cdnUrl);
      console.log('\nYou can test this URL in your browser to verify the image loads.');
      
      console.log('\n=== TROUBLESHOOTING ===');
      console.log('If the image is not showing on the website:');
      console.log('1. Check browser console for errors');
      console.log('2. Verify HeroComponent is receiving the image prop');
      console.log('3. Check if OptimizedImage component is rendering');
      console.log('4. Inspect CSS for any display:none or opacity:0 rules');
      console.log('5. Check z-index layering issues');
    }
  } else {
    console.log('❌ No hero block found');
  }
}

testHeroRendering();