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

// Helper function to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to ensure blocks have proper structure
function ensureBlockStructure(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  
  return blocks.map(block => {
    if (block._type === 'block') {
      // Ensure block has _key
      if (!block._key) {
        block._key = generateKey();
      }
      
      // Ensure children array exists and has proper structure
      if (!block.children || !Array.isArray(block.children)) {
        block.children = [{
          _type: 'span',
          _key: generateKey(),
          text: '',
          marks: []
        }];
      } else {
        // Ensure each child has _key and marks
        block.children = block.children.map(child => {
          if (!child._key) child._key = generateKey();
          if (!child.marks) child.marks = [];
          if (!child._type) child._type = 'span';
          return child;
        });
      }
      
      // Ensure markDefs exists
      if (!block.markDefs) {
        block.markDefs = [];
      }
      
      // Ensure style exists
      if (!block.style) {
        block.style = 'normal';
      }
    }
    
    return block;
  });
}

// Helper function to fix content arrays (convert strings to proper block format)
function fixContentArray(content) {
  if (typeof content === 'string') {
    return [{
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [{
        _type: 'span',
        _key: generateKey(),
        text: content,
        marks: []
      }],
      markDefs: []
    }];
  }
  
  if (Array.isArray(content)) {
    return ensureBlockStructure(content);
  }
  
  return content;
}

// Helper function to convert legacy 'sections' to proper 'contentBlocks'
function convertSectionsToContentBlocks(sections) {
  if (!Array.isArray(sections)) return [];
  
  return sections.map(section => {
    // Ensure each section has a _key
    if (!section._key) {
      section._key = generateKey();
    }
    
    // Map section types to content block types if needed
    switch (section._type) {
      case 'pageSection':
        // PageSection can remain as is, just ensure content is properly formatted
        if (section.content) {
          section.content = fixContentArray(section.content);
        }
        return section;
        
      case 'regionalComparison':
        // Fix regionalComparison fields to match schema
        const fixedRegional = {
          _key: section._key,
          _type: 'regionalComparison',
          title: section.title,
          subtitle: section.subtitle || 'Danmark er opdelt i to elprisområder',
          headerAlignment: section.headerAlignment || 'center',
          dk1Title: section.dk1Title || 'DK1 - Vestdanmark',
          dk1Description: fixContentArray(section.dk1Description || 'Jylland og Fyn'),
          dk1PriceIndicator: section.dk1PriceIndicator || 'lower',
          dk1Features: section.dk1Points || ['Jylland', 'Fyn'],
          dk2Title: section.dk2Title || 'DK2 - Østdanmark',
          dk2Description: fixContentArray(section.dk2Description || 'Sjælland og Bornholm'),
          dk2PriceIndicator: section.dk2PriceIndicator || 'higher',
          dk2Features: section.dk2Points || ['Sjælland', 'Bornholm'],
          showMap: section.showMap !== false
        };
        
        // Add leadingText if description exists
        if (section.description) {
          fixedRegional.leadingText = fixContentArray(section.description);
        }
        
        return fixedRegional;
        
      case 'pricingComparison':
        // Ensure all arrays are present and properly formatted
        return {
          _key: section._key,
          _type: 'pricingComparison',
          title: section.title,
          description: section.description ? fixContentArray(section.description) : undefined,
          headerAlignment: section.headerAlignment || 'center',
          fixedPriceTitle: section.fixedPriceTitle || 'Fast Pris',
          fixedPriceDescription: section.fixedPriceDescription || 'Stabil og forudsigelig',
          fixedPriceAdvantages: section.fixedPriceAdvantages || [],
          fixedPriceDisadvantages: section.fixedPriceDisadvantages || [],
          variablePriceTitle: section.variablePriceTitle || 'Variabel Pris',
          variablePriceDescription: section.variablePriceDescription || 'Følger markedsprisen',
          variablePriceAdvantages: section.variablePriceAdvantages || [],
          variablePriceDisadvantages: section.variablePriceDisadvantages || [],
          showCalculator: section.showCalculator !== false,
          showHistoricalComparison: section.showHistoricalComparison !== false
        };
        
      case 'dailyPriceTimeline':
        // Fix timeSlots array
        return {
          _key: section._key,
          _type: 'dailyPriceTimeline',
          title: section.title,
          description: section.description ? fixContentArray(section.description) : undefined,
          headerAlignment: section.headerAlignment || 'center',
          showLivePrice: section.showLivePrice !== false,
          showHistoricalPattern: section.showHistoricalPattern !== false,
          timeSlots: Array.isArray(section.timeSlots) ? section.timeSlots.map(slot => ({
            _key: slot._key || generateKey(),
            _type: 'timeSlot',
            period: slot.period || '',
            description: slot.description || '',
            priceLevel: slot.priceLevel || 'medium',
            tips: Array.isArray(slot.tips) ? slot.tips : []
          })) : []
        };
        
      case 'infoCardsSection':
        // Fix cards array
        return {
          _key: section._key,
          _type: 'infoCardsSection',
          title: section.title,
          description: section.description ? fixContentArray(section.description) : undefined,
          headerAlignment: section.headerAlignment || 'center',
          columns: section.columns || 3,
          colorScheme: section.colorScheme || 'primary',
          cards: Array.isArray(section.cards) ? section.cards.map(card => ({
            _key: card._key || generateKey(),
            _type: 'infoCard',
            title: card.title || '',
            content: card.content ? fixContentArray(card.content) : [],
            icon: card.icon || 'info',
            highlight: card.highlight || false
          })) : []
        };
        
      default:
        // For other types, just ensure arrays have keys
        if (section.content) {
          section.content = fixContentArray(section.content);
        }
        if (section.leadingText) {
          section.leadingText = fixContentArray(section.leadingText);
        }
        return section;
    }
  });
}

async function fixHistoriskePriserPage() {
  try {
    console.log('Fetching page content...');
    const page = await client.getDocument('qgCxJyBbKpvhb2oGYjlhjr');
    
    console.log('Creating fixed version...');
    
    // Create a clean page object with only valid fields
    const fixedPage = {
      _id: page._id,
      _type: 'page',
      title: page.title,
      slug: page.slug,
      // Extended SEO fields
      seoMetaTitle: page.seoMetaTitle || page.title,
      seoMetaDescription: page.seoMetaDescription || '',
      seoKeywords: page.seoKeywords || [],
      noIndex: page.noIndex || false,
      // Content blocks - merge contentBlocks and sections
      contentBlocks: []
    };
    
    // First, add existing contentBlocks
    if (Array.isArray(page.contentBlocks)) {
      page.contentBlocks.forEach(block => {
        if (!block._key) block._key = generateKey();
        
        // Fix specific content block types
        if (block._type === 'pageSection' && block.content) {
          block.content = fixContentArray(block.content);
        }
        if (block._type === 'featureList' && block.features) {
          block.features = block.features.map(feature => {
            if (!feature._key) feature._key = generateKey();
            return feature;
          });
        }
        if (block._type === 'providerList' && block.providers) {
          block.providers = block.providers.map(provider => {
            if (!provider._key) provider._key = generateKey();
            return provider;
          });
        }
        if (block._type === 'co2EmissionsChart' && block.leadingText) {
          block.leadingText = fixContentArray(block.leadingText);
        }
        
        fixedPage.contentBlocks.push(block);
      });
    }
    
    // Then, convert sections to contentBlocks and add them
    if (Array.isArray(page.sections)) {
      const convertedSections = convertSectionsToContentBlocks(page.sections);
      fixedPage.contentBlocks.push(...convertedSections);
    }
    
    // Ensure all content blocks have unique keys
    const keySet = new Set();
    fixedPage.contentBlocks = fixedPage.contentBlocks.map(block => {
      while (keySet.has(block._key)) {
        block._key = generateKey();
      }
      keySet.add(block._key);
      return block;
    });
    
    console.log(`Fixed page has ${fixedPage.contentBlocks.length} content blocks`);
    
    // Update the document
    console.log('Updating page in Sanity...');
    const result = await client
      .patch(page._id)
      .set(fixedPage)
      .unset(['sections', 'lastUpdated']) // Remove invalid fields
      .commit();
    
    console.log('✅ Page successfully updated!');
    console.log(`Document ID: ${result._id}`);
    console.log(`Revision: ${result._rev}`);
    
    // Save the fixed content for verification
    const fs = await import('fs');
    fs.writeFileSync('historiske-priser-fixed.json', JSON.stringify(fixedPage, null, 2));
    console.log('Fixed content saved to historiske-priser-fixed.json');
    
  } catch (error) {
    console.error('❌ Error fixing page:', error);
    if (error.response) {
      console.error('API Response:', error.response.body);
    }
  }
}

// Run the fix
fixHistoriskePriserPage();