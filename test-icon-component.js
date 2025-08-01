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

// Test the exact logic from Icon component
function testIconLogic(icon) {
  console.log('🧪 Testing Icon Component Logic:');
  console.log('Icon data:', {
    hasIcon: !!icon,
    hasSvg: !!icon?.svg,
    svgContent: icon?.svg?.substring(0, 100) + '...',
    hasMetadata: !!icon?.metadata,
    metadataUrl: icon?.metadata?.url,
    hasInlineSvg: !!icon?.metadata?.inlineSvg,
    iconString: icon?.icon
  });

  // First check: SVG without placeholder
  if (icon?.svg && !icon.svg.includes('Placeholder SVG')) {
    console.log('✅ Would render: Direct SVG (non-placeholder)');
    return 'direct-svg';
  }

  // Second check: Metadata URL
  if (icon?.metadata?.url) {
    console.log('✅ Would render: Metadata URL img');
    return 'metadata-url';
  }

  // Third check: Legacy icon string
  if (icon?.icon && !icon.metadata?.url) {
    console.log('✅ Would render: Generated URL from icon string');
    return 'generated-url';
  }

  // Fourth check: No icon data
  if (!icon || (!icon.svg && !icon.metadata?.url && !icon.icon)) {
    console.log('✅ Would render: Fallback icon');
    return 'fallback';
  }

  // Fifth check: Inline SVG (this might be the issue)
  if (icon.metadata.inlineSvg) {
    console.log('✅ Would render: Inline SVG from metadata');
    return 'inline-svg';
  }

  // Final fallback: Metadata URL again (unreachable?)
  console.log('✅ Would render: Final metadata URL fallback');
  return 'final-metadata-url';
}

async function testWithRealData() {
  try {
    console.log('🔍 Fetching real icon data from API...\n');
    
    const query = `*[_type == "page" && slug.current == "elprisberegner"][0] {
      contentBlocks[] {
        _type == "featureList" => {
          features[]{
            title,
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
    const featureList = page?.contentBlocks?.find(block => block._type === 'featureList');
    
    if (featureList?.features) {
      featureList.features.forEach((feature, index) => {
        console.log(`\n📝 Feature ${index + 1}: ${feature.title}`);
        console.log('='.repeat(50));
        const result = testIconLogic(feature.icon);
        console.log(`Final result: ${result}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithRealData();