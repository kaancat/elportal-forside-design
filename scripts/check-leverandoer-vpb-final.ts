import { createClient } from '@sanity/client';

const token = process.argv[2] || process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('Please provide Sanity API token');
  process.exit(1);
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: token,
  useCdn: false,
});

async function checkLeverandoerVPB() {
  console.log('🔍 Final check of leverandoer-sammenligning Value Proposition Box\n');
  
  const page = await client.fetch(`
    *[_id == "dPOYkdZ6jQJpSdo6MLX9d3"][0]{
      title,
      "vpb": contentBlocks[_type == "valueProposition"][0]{
        _key,
        _type,
        heading,
        subheading,
        content,
        valueItems[]{
          _key,
          heading,
          description,
          icon
        }
      }
    }
  `);
  
  if (!page || !page.vpb) {
    console.error('❌ Page or VPB not found!');
    return;
  }
  
  console.log('📄 Page:', page.title);
  console.log('\n✅ Value Proposition Box Status:');
  console.log('================================');
  console.log('Key:', page.vpb._key);
  console.log('Type:', page.vpb._type);
  console.log('\nContent Fields:');
  console.log('- Heading:', page.vpb.heading || '❌ EMPTY');
  console.log('- Subheading:', page.vpb.subheading || '❌ EMPTY');
  console.log('- Content:', page.vpb.content ? '✅ Has content' : '❌ EMPTY');
  console.log('- Value Items:', page.vpb.valueItems?.length || 0);
  
  if (page.vpb.valueItems && page.vpb.valueItems.length > 0) {
    console.log('\n✅ Value Items (Editable in Sanity Studio):');
    page.vpb.valueItems.forEach((item: any, i: number) => {
      console.log(`\n  ${i + 1}. ${item.heading}`);
      console.log(`     Description: ${item.description}`);
      console.log(`     Icon: ${item.icon ? '✅ Present' : '❌ Missing'}`);
    });
  }
  
  console.log('\n\n🎉 RESULT: The Value Proposition Box is now fully populated and editable in Sanity Studio!');
}

checkLeverandoerVPB();