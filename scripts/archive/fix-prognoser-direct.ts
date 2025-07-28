import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fixPrognoserDirect() {
  try {
    console.log('🔍 Applying direct fixes...');
    
    // Apply specific fixes for the validation errors identified
    const fixes = [
      // Fix info cards section icons
      {
        id: 'info-cards-fix',
        mutations: [
          {
            patch: {
              id: 'qgCxJyBbKpvhb2oGYkdQx3',
              set: {
                'contentBlocks[_key=="info-cards"].cards[0].icon': 'clock',
                'contentBlocks[_key=="info-cards"].cards[1].icon': 'clock',
                'contentBlocks[_key=="info-cards"].cards[2].icon': 'info'
              }
            }
          }
        ]
      }
    ];

    // Try a simple approach - just fix the icon fields manually
    console.log('🔧 Fixing info cards icons...');
    
    // Fetch current page to get exact structure
    const page = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]{
      _id,
      _rev,
      contentBlocks[_key == 'info-cards']{
        _key,
        _type,
        cards[]{
          _key,
          title,
          icon
        }
      }
    }`);
    
    if (!page || !page.contentBlocks || page.contentBlocks.length === 0) {
      console.error('❌ No info cards section found');
      return;
    }

    const infoCardsBlock = page.contentBlocks[0];
    console.log('📱 Current info cards structure:', JSON.stringify(infoCardsBlock, null, 2));

    // Try to update just the problematic fields
    const result = await client
      .patch(page._id)
      .setIfMissing({ 'contentBlocks': [] })
      .set({
        [`contentBlocks[_key=="${infoCardsBlock._key}"].cards[0].icon`]: 'clock',
        [`contentBlocks[_key=="${infoCardsBlock._key}"].cards[1].icon`]: 'clock', 
        [`contentBlocks[_key=="${infoCardsBlock._key}"].cards[2].icon`]: 'info'
      })
      .commit();

    console.log('✅ Successfully applied fixes');
    console.log('📝 Result:', result._id);

  } catch (error) {
    console.error('❌ Error applying direct fixes:', error);
    
    // If direct patch fails, let's just log what needs to be fixed manually
    console.log('\n📋 Manual fixes needed:');
    console.log('');
    console.log('1. Info Cards Section (key: info-cards):');
    console.log('   - Card 1: Change icon from iconPicker object to "clock"');
    console.log('   - Card 2: Change icon from iconPicker object to "clock"'); 
    console.log('   - Card 3: Change icon from iconPicker object to "info"');
    console.log('');
    console.log('2. FAQ Section (key: faq-section):');
    console.log('   - Ensure all FAQ items have _type: "faqItem"');
    console.log('   - Ensure all questions and answers are properly filled');
    console.log('');
    console.log('3. Call to Action sections:');
    console.log('   - Add missing button text and URLs');
    console.log('');
    console.log('4. Page Sections:');
    console.log('   - Ensure all have headerAlignment field set to "left"');
    console.log('   - Fix any title/heading field conflicts');
  }
}

// Run the direct fix
fixPrognoserDirect();