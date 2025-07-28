import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function checkMissingBlocks() {
  try {
    console.log('🔍 Checking potentially problematic content blocks...');
    
    // Check CTA section
    const ctaBlock = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      contentBlocks[_key == 'cta-final']{
        _key,
        _type,
        ...
      }
    }`);
    
    console.log('📋 CTA Section:');
    console.log(JSON.stringify(ctaBlock.contentBlocks[0], null, 2));
    
    // Check value proposition
    const valuePropBlock = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      contentBlocks[_key == 'value-prop-1']{
        _key,
        _type,
        ...
      }
    }`);
    
    console.log('\n📋 Value Proposition Section:');
    console.log(JSON.stringify(valuePropBlock.contentBlocks[0], null, 2));
    
    // Check pricing comparison
    const pricingBlock = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      contentBlocks[_key == 'fixed-vs-variable']{
        _key,
        _type,
        ...
      }
    }`);
    
    console.log('\n📋 Pricing Comparison Section:');
    console.log(JSON.stringify(pricingBlock.contentBlocks[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMissingBlocks();