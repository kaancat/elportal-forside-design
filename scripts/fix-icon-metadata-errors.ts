import { createClient } from '@sanity/client';

const token = process.argv[2];
if (!token) {
  console.error('Please provide Sanity API token as first argument');
  process.exit(1);
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: token,
  useCdn: false,
});

async function fixIconMetadataErrors() {
  console.log('🔧 Fixing icon metadata errors...\n');
  
  // Get all pages with potential icon issues
  const pages = await client.fetch(`
    *[_type == "page"]{
      _id,
      title,
      contentBlocks[]{
        _type,
        _key,
        ...select(
          _type == "valueProposition" => {
            valueItems[]{
              _key,
              heading,
              icon
            }
          },
          _type == "featureList" => {
            features[]{
              _key,
              title,
              icon
            }
          }
        )
      }
    }
  `);
  
  let totalFixed = 0;
  
  for (const page of pages) {
    let hasIconIssues = false;
    const updatedBlocks = [...page.contentBlocks];
    
    updatedBlocks.forEach((block: any) => {
      if (block._type === 'valueProposition' && block.valueItems) {
        block.valueItems.forEach((item: any) => {
          if (item.icon && (!item.icon.metadata || !item.icon.icon)) {
            console.log(`❌ Found broken icon in ${page.title} - VPB item: ${item.heading}`);
            // Remove the broken icon - it's better to have no icon than a broken one
            delete item.icon;
            hasIconIssues = true;
            totalFixed++;
          }
        });
      }
      
      if (block._type === 'featureList' && block.features) {
        block.features.forEach((feature: any) => {
          if (feature.icon && (!feature.icon.metadata || !feature.icon.icon)) {
            console.log(`❌ Found broken icon in ${page.title} - Feature: ${feature.title}`);
            // Remove the broken icon
            delete feature.icon;
            hasIconIssues = true;
            totalFixed++;
          }
        });
      }
    });
    
    if (hasIconIssues) {
      try {
        console.log(`   💾 Fixing ${page.title}...`);
        await client
          .patch(page._id)
          .set({ contentBlocks: updatedBlocks })
          .commit();
        console.log(`   ✅ Fixed icon issues\n`);
      } catch (error) {
        console.error(`   ❌ Failed to update ${page.title}: ${error}\n`);
      }
    }
  }
  
  console.log(`\n✅ Fixed ${totalFixed} broken icons`);
  console.log('\n💡 Note: Removed broken icons need to be re-added manually using the icon picker in Sanity Studio');
  
  // Check specifically the leverandoer-sammenligning page
  console.log('\n🔍 Checking leverandoer-sammenligning page specifically...\n');
  
  const leverandoerPage = await client.fetch(`
    *[_id == "dPOYkdZ6jQJpSdo6MLX9d3"][0]{
      title,
      "vpbIcons": contentBlocks[_type == "valueProposition"][0].valueItems[]{
        heading,
        "hasIcon": defined(icon),
        "iconData": icon
      }
    }
  `);
  
  if (leverandoerPage) {
    console.log('Value Proposition items status:');
    leverandoerPage.vpbIcons?.forEach((item: any, i: number) => {
      console.log(`${i + 1}. ${item.heading}`);
      console.log(`   Icon: ${item.hasIcon ? '✅ Present' : '❌ Missing/Removed'}`);
      if (item.hasIcon && item.iconData) {
        console.log(`   Icon type: ${item.iconData._type}`);
        console.log(`   Has metadata: ${item.iconData.metadata ? 'Yes' : 'No'}`);
      }
    });
  }
}

fixIconMetadataErrors();