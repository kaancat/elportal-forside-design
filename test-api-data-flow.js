import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function testApiDataFlow() {
  try {
    console.log('🔍 Testing API data flow for elprisberegner page...\n');
    
    // Use the exact same query as SanityService.getPageBySlug
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      contentBlocks[] {
        ...,
        _type == "featureList" => {
          _key,
          _type,
          title,
          features[]{
            _key,
            _type,
            title,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          }
        }
      }
    }`;
    
    const page = await client.fetch(query, { slug: 'elprisberegner' });
    
    if (!page) {
      console.log('❌ No page found with slug "elprisberegner"');
      return;
    }
    
    console.log(`✅ Page found: ${page.title}`);
    console.log(`📋 Total content blocks: ${page.contentBlocks?.length || 0}`);
    
    // Find featureList blocks
    const featureLists = page.contentBlocks?.filter(block => block._type === 'featureList') || [];
    console.log(`🎯 FeatureList blocks found: ${featureLists.length}\n`);
    
    featureLists.forEach((fl, index) => {
      console.log(`📝 FeatureList ${index + 1}:`);
      console.log(`   Title: ${fl.title || 'No title'}`);
      console.log(`   Features: ${fl.features?.length || 0}`);
      
      if (fl.features) {
        fl.features.forEach((feature, fIndex) => {
          console.log(`\n   🔹 Feature ${fIndex + 1}: ${feature.title}`);
          console.log(`      Description: ${feature.description?.substring(0, 50) || 'No description'}...`);
          console.log(`      Has icon: ${!!feature.icon}`);
          
          if (feature.icon) {
            console.log(`      Icon details:`);
            console.log(`        Type: ${feature.icon._type || 'No type'}`);
            console.log(`        Icon string: ${feature.icon.icon || 'No icon string'}`);
            console.log(`        SVG: ${feature.icon.svg ? 'Present' : 'Missing'}`);
            console.log(`        SVG preview: ${feature.icon.svg?.substring(0, 80) || 'N/A'}...`);
            
            if (feature.icon.metadata) {
              console.log(`        Metadata:`);
              console.log(`          URL: ${feature.icon.metadata.url || 'No URL'}`);
              console.log(`          Icon name: ${feature.icon.metadata.iconName || 'No name'}`);
              console.log(`          Inline SVG: ${feature.icon.metadata.inlineSvg ? 'Present' : 'Missing'}`);
            } else {
              console.log(`        Metadata: Missing`);
            }
          }
        });
      }
      console.log('');
    });
    
    // Test the hasValidIcon logic with actual data
    console.log('🧪 Testing hasValidIcon logic on API data:');
    featureLists.forEach((fl, flIndex) => {
      if (fl.features) {
        fl.features.forEach((feature, fIndex) => {
          const icon = feature.icon;
          
          // Replicate the hasValidIcon function
          const hasValidIcon = !!icon && (
            !!icon.svg || 
            !!icon.icon || 
            (!!icon.metadata && !!(icon.metadata.inlineSvg || icon.metadata.url))
          );
          
          const isPlaceholder = icon?.svg?.includes('Placeholder SVG');
          
          console.log(`   Feature "${feature.title}": ${hasValidIcon ? '✅ Valid' : '❌ Invalid'} ${isPlaceholder ? '(Placeholder SVG)' : ''}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

testApiDataFlow();