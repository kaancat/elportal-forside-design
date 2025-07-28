import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function checkPrognoserFAQDetailed() {
  try {
    console.log('🔍 Checking prognoser FAQ in raw detail...');
    
    // Get the exact raw structure
    const result = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      _id,
      title,
      "faqSection": contentBlocks[_key == 'faq-section'][0],
      "allContentBlocks": contentBlocks[]{ _type, _key }
    }`);
    
    console.log('📄 Page info:');
    console.log('- Title:', result.title);
    console.log('- FAQ Section found:', !!result.faqSection);
    
    if (result.faqSection) {
      console.log('\n📋 FAQ Section raw structure:');
      console.log(JSON.stringify(result.faqSection, null, 2));
      
      console.log('\n🔍 Analysis:');
      console.log('- Section type:', result.faqSection._type);
      console.log('- Has title:', !!result.faqSection.title);
      console.log('- Has faqItems:', !!result.faqSection.faqItems);
      console.log('- faqItems length:', result.faqSection.faqItems?.length || 0);
      
      if (result.faqSection.faqItems) {
        result.faqSection.faqItems.forEach((item: any, index: number) => {
          console.log(`\nFAQ Item ${index + 1}:`);
          console.log('- _type:', item._type);
          console.log('- _key:', item._key);
          console.log('- _ref:', item._ref || 'not present');
          console.log('- Has question:', !!item.question);
          console.log('- Has answer:', !!item.answer);
          
          if (item._type === 'reference') {
            console.log('🚨 FOUND REFERENCE ISSUE!');
          }
        });
      }
    }
    
    console.log('\n📋 All content blocks:');
    result.allContentBlocks.forEach((block: any, index: number) => {
      console.log(`${index + 1}. ${block._type} (${block._key})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPrognoserFAQDetailed();