import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fixPrognoserValidationErrors() {
  try {
    console.log('🔍 Fetching prognoser page...');
    
    // Fetch the current page
    const page = await client.fetch(`*[_type == 'page' && slug.current == 'prognoser'][0]`);
    
    if (!page) {
      console.error('❌ Page not found');
      return;
    }

    console.log('📄 Found page:', page.title);
    console.log('🔧 Fixing validation errors...');

    // Create updated content blocks with fixes
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      // Fix info cards section - convert iconPicker to simple icon strings
      if (block._type === 'infoCardsSection' && block.cards) {
        console.log('🔧 Fixing infoCardsSection icons...');
        return {
          ...block,
          cards: block.cards.map((card: any) => {
            if (card.icon && typeof card.icon === 'object' && card.icon.name) {
              // Convert iconPicker object to simple string
              const iconName = card.icon.name.toLowerCase();
              const iconMap: { [key: string]: string } = {
                'clock': 'clock',
                'calendar': 'clock', // Map calendar to available clock option
                'cloud': 'info', // Map cloud to info as fallback
                'trending-up': 'trending-up',
                'shield': 'shield',
                'calculator': 'calculator',
                'zap': 'zap',
                'info': 'info'
              };
              
              return {
                ...card,
                icon: iconMap[iconName] || 'info' // Default to 'info' if not found
              };
            }
            return card;
          })
        };
      }

      // Fix FAQ section - ensure all required fields are present
      if (block._type === 'faqGroup' && block.faqItems) {
        console.log('🔧 Fixing faqGroup structure...');
        return {
          ...block,
          faqItems: block.faqItems.map((item: any) => ({
            _type: 'faqItem',
            _key: item._key || `faq-${Math.random().toString(36).substr(2, 9)}`,
            question: item.question || '',
            answer: item.answer || []
          }))
        };
      }

      // Fix pageSection blocks - ensure required fields
      if (block._type === 'pageSection') {
        console.log(`🔧 Fixing pageSection: ${block.title}`);
        
        // Some sections have 'heading' field but schema expects 'title'
        const fixedBlock = { ...block };
        
        if (block.heading && !block.title) {
          fixedBlock.title = block.heading;
          delete fixedBlock.heading;
        }
        
        // Ensure headerAlignment is set
        if (!fixedBlock.headerAlignment) {
          fixedBlock.headerAlignment = 'left';
        }
        
        return fixedBlock;
      }

      // Fix renewable energy forecast - ensure required fields
      if (block._type === 'renewableEnergyForecast') {
        console.log('🔧 Fixing renewableEnergyForecast...');
        return {
          ...block,
          showPercentages: block.showPercentages !== undefined ? block.showPercentages : true,
          showTrend: block.showTrend !== undefined ? block.showTrend : true,
          headerAlignment: block.headerAlignment || 'left'
        };
      }

      // Fix regional comparison - ensure required fields
      if (block._type === 'regionalComparison') {
        console.log('🔧 Fixing regionalComparison...');
        return {
          ...block,
          showHistoricalTrend: block.showHistoricalTrend !== undefined ? block.showHistoricalTrend : true,
          showPriceDifference: block.showPriceDifference !== undefined ? block.showPriceDifference : true,
          headerAlignment: block.headerAlignment || 'left'
        };
      }

      // Fix CO2 emissions chart
      if (block._type === 'co2EmissionsChart') {
        console.log('🔧 Fixing co2EmissionsChart...');
        return {
          ...block,
          region: block.region || 'DK',
          showForecast: block.showForecast !== undefined ? block.showForecast : true,
          headerAlignment: block.headerAlignment || 'left'
        };
      }

      // Fix monthly production chart
      if (block._type === 'monthlyProductionChart') {
        console.log('🔧 Fixing monthlyProductionChart...');
        return {
          ...block,
          comparisonType: block.comparisonType || 'lastYear',
          showComparison: block.showComparison !== undefined ? block.showComparison : true,
          headerAlignment: block.headerAlignment || 'left'
        };
      }

      return block;
    });

    // Add missing required fields to the page
    const updatedPage = {
      ...page,
      contentBlocks: updatedContentBlocks,
      // Ensure SEO fields if missing
      seo: page.seo || {
        metaTitle: page.title,
        metaDescription: 'Se elpris prognoser for i morgen time for time. Spar penge på din elregning ved at planlægge dit forbrug smart med vores gratis prognoser.',
        focusKeyword: 'elpris prognose'
      }
    };

    console.log('💾 Updating page in Sanity...');
    
    const result = await client
      .patch(page._id)
      .set(updatedPage)
      .commit();

    console.log('✅ Successfully fixed validation errors for prognoser page');
    console.log(`📝 Updated document ID: ${result._id}`);
    
    // Log specific fixes made
    console.log('\n📋 Fixes applied:');
    console.log('• Fixed info cards icons (converted iconPicker to simple strings)');
    console.log('• Fixed FAQ items structure');
    console.log('• Fixed pageSection title/heading field conflicts');
    console.log('• Added missing headerAlignment fields');
    console.log('• Added default values for boolean fields');
    console.log('• Added basic SEO fields if missing');

  } catch (error) {
    console.error('❌ Error fixing validation errors:', error);
  }
}

// Run the fix
fixPrognoserValidationErrors();