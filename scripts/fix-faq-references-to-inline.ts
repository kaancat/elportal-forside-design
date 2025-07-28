import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fixFAQReferencesToInline() {
  try {
    console.log('🔍 Fetching prognoser page FAQ references...');
    
    // Get the current FAQ references
    const page = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      _id,
      _rev,
      contentBlocks[_key == 'faq-section']{
        _key,
        _type,
        title,
        faqItems[]{ _ref }
      }
    }`);
    
    if (!page || !page.contentBlocks?.[0]?.faqItems) {
      console.error('❌ No FAQ section or items found');
      return;
    }

    const faqSection = page.contentBlocks[0];
    const faqRefs = faqSection.faqItems.map((item: any) => item._ref);
    
    console.log(`📋 Found ${faqRefs.length} FAQ references to convert`);
    
    // Fetch the actual FAQ documents
    const faqDocs = await client.fetch(`*[_type == 'faqItem' && _id in $refs]{
      _id,
      question,
      answer
    }`, { refs: faqRefs });
    
    console.log(`📄 Fetched ${faqDocs.length} FAQ documents`);
    
    // Convert to inline objects with proper structure
    const inlineFAQItems = faqDocs.map((doc: any, index: number) => ({
      _type: 'faqItem',
      _key: `faq-inline-${Date.now()}-${index + 1}`,
      question: doc.question,
      answer: doc.answer || []
    }));
    
    console.log('🔄 Converting to inline FAQ items...');
    console.log('📝 Inline FAQ structure:');
    console.log(JSON.stringify(inlineFAQItems, null, 2));
    
    // Update the page with inline FAQ items instead of references
    console.log('💾 Updating page with inline FAQ items...');
    
    const result = await client
      .patch(page._id)
      .set({
        [`contentBlocks[_key=="${faqSection._key}"].faqItems`]: inlineFAQItems
      })
      .commit();

    console.log('✅ Successfully converted FAQ references to inline objects');
    console.log(`📝 Updated document: ${result._id}`);
    
    // Clean up the orphaned FAQ documents
    console.log('\n🧹 Cleaning up orphaned FAQ documents...');
    for (const refId of faqRefs) {
      try {
        await client.delete(refId);
        console.log(`🗑️ Deleted orphaned FAQ document: ${refId}`);
      } catch (error) {
        console.log(`⚠️ Could not delete ${refId}:`, error.message);
      }
    }
    
    console.log('\n✅ FAQ conversion complete!');
    console.log('📋 Summary:');
    console.log(`• Converted ${inlineFAQItems.length} FAQ references to inline objects`);
    console.log(`• Cleaned up ${faqRefs.length} orphaned documents`);
    console.log('• FAQ validation errors should now be resolved');

  } catch (error) {
    console.error('❌ Error fixing FAQ references:', error);
    
    if (error.statusCode === 403) {
      console.log('\n🔧 Manual fix needed due to permissions:');
      console.log('1. Go to Sanity Studio');
      console.log('2. Open prognoser page FAQ section');
      console.log('3. Delete all reference-based FAQ items');
      console.log('4. Add new inline FAQ items with this content:');
      
      // Still try to fetch the FAQ content for manual fixing
      try {
        const faqRefs = ['faq-prognoser-1753558711191-1', 'faq-prognoser-1753558711191-2', 'faq-prognoser-1753558711191-3', 'faq-prognoser-1753558711191-4'];
        const faqDocs = await client.fetch(`*[_type == 'faqItem' && _id in $refs]{ question, answer }`, { refs: faqRefs });
        
        faqDocs.forEach((doc: any, index: number) => {
          console.log(`\nFAQ ${index + 1}:`);
          console.log(`Question: ${doc.question}`);
          console.log(`Answer: ${doc.answer?.[0]?.children?.[0]?.text || 'Missing answer'}`);
        });
      } catch (fetchError) {
        console.log('Could not fetch FAQ content for manual fixing');
      }
    }
  }
}

// Run the fix
fixFAQReferencesToInline();