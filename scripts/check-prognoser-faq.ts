import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function checkPrognoserFAQ() {
  try {
    console.log('🔍 Checking prognoser FAQ structure in detail...');
    
    const page = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      _id,
      title,
      contentBlocks[_key == 'faq-section']{
        _key,
        _type,
        title,
        faqItems
      }
    }`);
    
    if (!page || !page.contentBlocks || page.contentBlocks.length === 0) {
      console.error('❌ No FAQ section found');
      return;
    }

    const faqSection = page.contentBlocks[0];
    console.log('📋 FAQ Section Structure:');
    console.log(JSON.stringify(faqSection, null, 2));
    
    // Analyze validation requirements
    console.log('\n🔍 Validation Analysis:');
    
    // Check if title is missing (required field)
    if (!faqSection.title) {
      console.log('❌ ISSUE: Missing required title field');
    } else {
      console.log('✅ Title present:', faqSection.title);
    }
    
    // Check faqItems array
    if (!faqSection.faqItems || !Array.isArray(faqSection.faqItems)) {
      console.log('❌ ISSUE: Missing or invalid faqItems array');
    } else if (faqSection.faqItems.length === 0) {
      console.log('❌ ISSUE: faqItems array is empty (min 1 required)');
    } else {
      console.log(`✅ faqItems array present with ${faqSection.faqItems.length} items`);
      
      faqSection.faqItems.forEach((item: any, index: number) => {
        console.log(`\n📝 FAQ Item ${index + 1}:`);
        console.log(`  _type: ${item._type || '❌ MISSING'}`);
        console.log(`  _key: ${item._key || '❌ MISSING'}`);
        console.log(`  question: ${item.question ? '✅ Present' : '❌ MISSING (required)'}`);
        console.log(`  answer: ${item.answer ? '✅ Present (' + item.answer.length + ' blocks)' : '❌ MISSING (required)'}`);
        
        // Check if answer is properly formatted
        if (item.answer && Array.isArray(item.answer)) {
          console.log(`  answer format: ✅ Array with ${item.answer.length} blocks`);
        } else if (item.answer) {
          console.log(`  answer format: ❌ Not an array (should be array of blocks)`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPrognoserFAQ();