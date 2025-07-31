import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fetchPageContent() {
  const query = `*[_type == "page" && slug.current == "hvordan-vaelger-du-elleverandoer"][0]{
    _id,
    _type,
    title,
    slug,
    contentBlocks[]{
      _key,
      _type,
      ...,
      features[]{
        _key,
        _type,
        title,
        description,
        icon{
          _type,
          icon,
          metadata
        }
      },
      valueItems[]{
        _key,
        _type,
        heading,
        description,
        icon{
          _type,
          icon,
          metadata
        }
      },
      items[]{
        _key,
        _type,
        heading,
        description,
        icon{
          _type,
          icon,
          metadata
        }
      }
    }
  }`;

  return await client.fetch(query);
}

async function fixPageContent() {
  console.log('🔍 Fetching current page content...');
  const page = await fetchPageContent();
  
  if (!page) {
    console.error('❌ Page not found!');
    return;
  }

  console.log('📄 Current page structure:', JSON.stringify(page, null, 2));

  // Fix the content blocks
  const fixedContentBlocks = page.contentBlocks.map((block: any) => {
    if (block._type === 'featureList') {
      console.log('🔧 Fixing featureList block...');
      // Remove invalid fields and rename items to features
      const { headerAlignment, items, ...validFields } = block;
      
      // The schema expects 'features' not 'items'
      if (items && !validFields.features) {
        validFields.features = items.map((item: any) => ({
          ...item,
          // Ensure icons have proper size in metadata
          icon: item.icon ? {
            ...item.icon,
            metadata: item.icon.metadata ? {
              ...item.icon.metadata,
              // Add explicit size to metadata if missing
              size: item.icon.metadata.size || { width: 48, height: 48 }
            } : item.icon.metadata
          } : undefined
        }));
      }
      
      return validFields;
    }
    
    if (block._type === 'valueProposition') {
      console.log('🔧 Fixing valueProposition block...');
      
      // Ensure we have the correct fields
      const fixedBlock: any = {
        _key: block._key,
        _type: block._type,
        heading: block.heading || block.title || 'Fordele ved at vælge den rigtige elleverandør',
        subheading: block.subheading || block.subtitle || 'Her er de vigtigste fordele du får ved at vælge den rigtige elleverandør',
      };

      // Add value items if they don't exist
      if (!block.valueItems || block.valueItems.length === 0) {
        fixedBlock.valueItems = [
          {
            _key: 'value-1',
            _type: 'valueItem',
            heading: 'Spar op til 500 kr om måneden',
            description: 'Ved at vælge den rigtige elleverandør kan du spare betydelige beløb på din elregning hver måned.',
            icon: {
              _type: 'icon.manager',
              icon: 'mdi:piggy-bank',
              metadata: {
                iconName: 'piggy-bank',
                collectionId: 'mdi',
                collectionName: 'Material Design Icons',
                url: 'https://api.iconify.design/mdi:piggy-bank.svg?color=%2384db41',
                inlineSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 6V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2h3.29A5 5 0 0 1 19 6.76a5 5 0 0 1 1.21 2.03c.39.12.68.49.68.9v1.62c0 .55-.45 1-1 1c-.3 0-.56-.13-.73-.33c-.17.62-.46 1.2-.85 1.72v4.05c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5V19h-2.62v.75c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5v-4.05c-.95-1.26-1.57-2.85-1.69-4.58a3.43 3.43 0 0 1 3.14-3.56A4.95 4.95 0 0 1 11 6zm3-3H8v1h2zm5.5 8a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"/></svg>',
                downloadUrl: 'https://api.iconify.design/mdi:piggy-bank.svg?download=true',
                size: { width: 48, height: 48 }
              }
            }
          },
          {
            _key: 'value-2',
            _type: 'valueItem',
            heading: 'Gennemsigtige priser',
            description: 'Få fuld transparens i prissætningen uden skjulte gebyrer eller overraskelser på regningen.',
            icon: {
              _type: 'icon.manager',
              icon: 'mdi:eye-outline',
              metadata: {
                iconName: 'eye-outline',
                collectionId: 'mdi',
                collectionName: 'Material Design Icons',
                url: 'https://api.iconify.design/mdi:eye-outline.svg?color=%2384db41',
                inlineSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12c1.56 2.94 4.66 5 8.82 5s7.26-2.06 8.82-5c-1.56-2.94-4.66-5-8.82-5s-7.26 2.06-8.82 5"/></svg>',
                downloadUrl: 'https://api.iconify.design/mdi:eye-outline.svg?download=true',
                size: { width: 48, height: 48 }
              }
            }
          },
          {
            _key: 'value-3',
            _type: 'valueItem',
            heading: 'Grøn strøm',
            description: 'Vælg leverandører der tilbyder certificeret grøn strøm fra vedvarende energikilder.',
            icon: {
              _type: 'icon.manager',
              icon: 'mdi:leaf',
              metadata: {
                iconName: 'leaf',
                collectionId: 'mdi',
                collectionName: 'Material Design Icons',
                url: 'https://api.iconify.design/mdi:leaf.svg?color=%2384db41',
                inlineSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8"/></svg>',
                downloadUrl: 'https://api.iconify.design/mdi:leaf.svg?download=true',
                size: { width: 48, height: 48 }
              }
            }
          },
          {
            _key: 'value-4',
            _type: 'valueItem',
            heading: 'Nem skift af leverandør',
            description: 'Det er hurtigt og nemt at skifte elleverandør - processen tager typisk kun 5 minutter.',
            icon: {
              _type: 'icon.manager',
              icon: 'mdi:swap-horizontal',
              metadata: {
                iconName: 'swap-horizontal',
                collectionId: 'mdi',
                collectionName: 'Material Design Icons',
                url: 'https://api.iconify.design/mdi:swap-horizontal.svg?color=%2384db41',
                inlineSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21 9l-4-4v3h-7v2h7v3M7 11l-4 4l4 4v-3h7v-2H7v-3"/></svg>',
                downloadUrl: 'https://api.iconify.design/mdi:swap-horizontal.svg?download=true',
                size: { width: 48, height: 48 }
              }
            }
          }
        ];
      } else {
        // Ensure existing valueItems have proper structure
        fixedBlock.valueItems = block.valueItems;
      }

      return fixedBlock;
    }

    // Return other blocks unchanged
    return block;
  });

  // Update the page
  const updatePayload = {
    _id: page._id,
    _type: page._type,
    title: page.title,
    slug: page.slug,
    contentBlocks: fixedContentBlocks
  };

  console.log('💾 Updating page with fixed content...');
  console.log('Update payload:', JSON.stringify(updatePayload, null, 2));

  try {
    const result = await client.createOrReplace(updatePayload);
    console.log('✅ Page updated successfully!');
    console.log('Result:', result);

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const updatedPage = await fetchPageContent();
    console.log('Updated page structure:', JSON.stringify(updatedPage, null, 2));
  } catch (error) {
    console.error('❌ Error updating page:', error);
  }
}

// Also create a CSS fix for icon sizes
async function createIconSizeFix() {
  const cssContent = `/* Fix for tiny icons in FeatureList and ValueProposition components */

/* Feature List Icons */
.feature-list-icon img,
.feature-list-icon svg {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
}

/* Value Proposition Icons */
.value-proposition-icon img,
.value-proposition-icon svg {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
}

/* Ensure icon containers don't constrain the icons */
[class*="icon-container"] {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fix for icon manager icons specifically */
img[src*="api.iconify.design"] {
  object-fit: contain !important;
  max-width: none !important;
}
`;

  console.log('\n📝 CSS fixes to add to your styles:');
  console.log(cssContent);
  
  console.log('\n🔧 Component updates needed:');
  console.log('1. In FeatureListComponent.tsx, add className="feature-list-icon" to the Icon wrapper');
  console.log('2. In ValuePropositionComponent.tsx, add className="value-proposition-icon" to the Icon wrapper');
}

// Run the fix
async function main() {
  console.log('🚀 Starting comprehensive fix for hvordan-vaelger-du-elleverandoer page...\n');
  
  await fixPageContent();
  await createIconSizeFix();
  
  console.log('\n✅ Fix process completed!');
  console.log('\n📌 Remember to set SANITY_API_TOKEN in your .env file');
}

main().catch(console.error);