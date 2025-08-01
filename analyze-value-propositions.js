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

async function analyzeValuePropositions() {
  try {
    console.log('🔍 Analyzing ValueProposition blocks on elprisberegner page...\n');
    
    const query = `*[_type == "page" && slug.current == "elprisberegner"][0] {
      _id,
      title,
      contentBlocks[] {
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{ 
            _key,
            _type,
            heading,
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
          },
          // Legacy fields for backward compatibility
          title,
          propositions,
          items[]{ 
            _key,
            _type,
            text,
            heading,
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
    
    const page = await client.fetch(query);
    
    if (!page) {
      console.log('❌ No page found');
      return;
    }
    
    console.log(`✅ Page found: ${page.title}`);
    
    // Find all valueProposition blocks
    const valuePropositions = page.contentBlocks?.filter(block => block._type === 'valueProposition') || [];
    console.log(`🎯 ValueProposition blocks found: ${valuePropositions.length}\n`);
    
    valuePropositions.forEach((vp, index) => {
      console.log(`📝 ValueProposition ${index + 1}:`);
      console.log(`   Heading: ${vp.heading || vp.title || 'No heading'}`);
      console.log(`   Subheading: ${vp.subheading || 'No subheading'}`);
      console.log(`   Has content: ${!!vp.content}`);
      console.log(`   valueItems count: ${vp.valueItems?.length || 0}`);
      console.log(`   Legacy items count: ${vp.items?.length || 0}`);
      
      // Check current valueItems
      if (vp.valueItems && vp.valueItems.length > 0) {
        console.log(`\n   🔍 Current valueItems:`);
        vp.valueItems.forEach((item, itemIndex) => {
          console.log(`     ${itemIndex + 1}. ${item.heading}`);
          console.log(`        Description: ${item.description?.substring(0, 50) || 'No description'}...`);
          console.log(`        Has icon: ${!!item.icon}`);
          if (item.icon) {
            console.log(`        Icon type: ${item.icon._type || 'No type'}`);
            console.log(`        Icon string: ${item.icon.icon || 'No icon string'}`);
            console.log(`        Metadata URL: ${item.icon.metadata?.url || 'No URL'}`);
            console.log(`        SVG contains placeholder: ${item.icon.svg?.includes('Placeholder SVG') ? 'Yes' : 'No'}`);
          }
          console.log('');
        });
      }
      
      // Check legacy items  
      if (vp.items && vp.items.length > 0) {
        console.log(`\n   🔍 Legacy items:`);
        vp.items.forEach((item, itemIndex) => {
          console.log(`     ${itemIndex + 1}. ${item.heading || item.text}`);
          console.log(`        Description: ${item.description?.substring(0, 50) || 'No description'}...`);
          console.log(`        Has icon: ${!!item.icon}`);
          if (item.icon) {
            console.log(`        Icon type: ${item.icon._type || 'No type'}`);
            console.log(`        Icon string: ${item.icon.icon || 'No icon string'}`);
            console.log(`        Metadata URL: ${item.icon.metadata?.url || 'No URL'}`);
          }
          console.log('');
        });
      }
      
      console.log('='.repeat(80));
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeValuePropositions();