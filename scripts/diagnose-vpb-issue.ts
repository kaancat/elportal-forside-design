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

async function diagnoseVPBIssue() {
  console.log('🔍 Diagnosing Value Proposition Box issue...\n');
  
  // Fetch the leverandoer-sammenligning page
  const page = await client.fetch(`
    *[_id == "dPOYkdZ6jQJpSdo6MLX9d3"][0] {
      _id,
      title,
      "vpBlocks": contentBlocks[_type == "valueProposition"]{
        _key,
        _type,
        heading,
        title,
        subheading,
        content,
        valueItems[]{
          _key,
          heading,
          description,
          icon
        },
        items[]{
          _key,
          text,
          heading,
          description,
          icon
        },
        propositions
      }
    }
  `);
  
  if (!page) {
    console.error('❌ Page not found!');
    return;
  }
  
  console.log('📄 Page:', page.title);
  console.log('\n🔍 Value Proposition Blocks Analysis:\n');
  
  page.vpBlocks?.forEach((block: any, idx: number) => {
    console.log(`Block ${idx + 1} (key: ${block._key}):`);
    console.log('----------------------------------------');
    
    // Check new fields
    console.log('New fields:');
    console.log(`  heading: ${block.heading || '❌ EMPTY'}`);
    console.log(`  subheading: ${block.subheading || '❌ EMPTY'}`);
    console.log(`  content: ${block.content ? '✅ Has content' : '❌ EMPTY'}`);
    console.log(`  valueItems: ${block.valueItems?.length || 0} items`);
    
    // Check deprecated fields
    console.log('\nDeprecated fields:');
    console.log(`  title: ${block.title || '❌ EMPTY'}`);
    console.log(`  items: ${block.items?.length || 0} items`);
    console.log(`  propositions: ${block.propositions?.length || 0} items`);
    
    // Show where the data actually is
    if (block.items?.length > 0) {
      console.log('\n⚠️  DATA IS IN DEPRECATED "items" FIELD:');
      block.items.forEach((item: any, i: number) => {
        console.log(`    ${i + 1}. ${item.heading || item.text}`);
      });
    }
    
    if (block.valueItems?.length > 0) {
      console.log('\n✅ DATA IS IN CORRECT "valueItems" FIELD:');
      block.valueItems.forEach((item: any, i: number) => {
        console.log(`    ${i + 1}. ${item.heading}`);
      });
    }
    
    console.log('\n');
  });
  
  // Check other pages too
  console.log('🔍 Checking other pages for similar issues...\n');
  
  const pagesWithVPB = await client.fetch(`
    *[_type == "page" && defined(contentBlocks[_type == "valueProposition"])]{
      _id,
      title,
      slug,
      "vpbInfo": contentBlocks[_type == "valueProposition"]{
        _key,
        "hasHeading": defined(heading),
        "hasTitle": defined(title),
        "hasValueItems": count(valueItems) > 0,
        "hasItems": count(items) > 0,
        "valueItemsCount": count(valueItems),
        "itemsCount": count(items)
      }
    }
  `);
  
  console.log('Pages with Value Proposition Boxes:');
  console.log('----------------------------------');
  
  pagesWithVPB.forEach((page: any) => {
    console.log(`\n${page.title} (${page.slug?.current})`);
    page.vpbInfo.forEach((vpb: any, idx: number) => {
      const status = vpb.hasValueItems ? '✅' : (vpb.hasItems ? '⚠️  Data in deprecated field' : '❌ Empty');
      console.log(`  VPB ${idx + 1}: ${status}`);
      console.log(`    - New field (valueItems): ${vpb.valueItemsCount} items`);
      console.log(`    - Old field (items): ${vpb.itemsCount} items`);
    });
  });
}

diagnoseVPBIssue();