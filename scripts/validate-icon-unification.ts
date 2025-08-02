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

interface ValidationResult {
  document: string;
  block: string;
  item: string;
  issue: string;
  details?: any;
}

async function validateIconUnification() {
  console.log('🔍 Validating icon unification...\n');
  
  const query = `*[_type in ["page", "siteSettings", "provider"]] {
    _id,
    _type,
    title,
    slug,
    contentBlocks
  }`;
  
  const docs = await client.fetch(query);
  const issues: ValidationResult[] = [];
  let totalIcons = 0;
  let validIcons = 0;
  
  for (const doc of docs) {
    if (!doc.contentBlocks || doc.contentBlocks.length === 0) continue;
    
    doc.contentBlocks.forEach((block: any) => {
      // Check InfoCardsSection
      if (block._type === 'infoCardsSection' && block.cards) {
        block.cards.forEach((card: any) => {
          if (card.icon) {
            totalIcons++;
            const validation = validateIcon(card.icon);
            if (validation.isValid) {
              validIcons++;
            } else {
              issues.push({
                document: doc.title || doc.slug?.current || doc._id,
                block: 'InfoCardsSection',
                item: card.title,
                issue: validation.error!,
                details: card.icon
              });
            }
          }
        });
      }
      
      // Check ValueProposition
      if (block._type === 'valueProposition' && block.valueItems) {
        block.valueItems.forEach((item: any) => {
          if (item.icon) {
            totalIcons++;
            const validation = validateIcon(item.icon);
            if (validation.isValid) {
              validIcons++;
            } else {
              issues.push({
                document: doc.title || doc.slug?.current || doc._id,
                block: 'ValueProposition',
                item: item.heading,
                issue: validation.error!,
                details: item.icon
              });
            }
          }
        });
      }
      
      // Check FeatureList
      if (block._type === 'featureList' && block.features) {
        block.features.forEach((feature: any) => {
          if (feature.icon) {
            totalIcons++;
            const validation = validateIcon(feature.icon);
            if (validation.isValid) {
              validIcons++;
            } else {
              issues.push({
                document: doc.title || doc.slug?.current || doc._id,
                block: 'FeatureList',
                item: feature.title,
                issue: validation.error!,
                details: feature.icon
              });
            }
          }
        });
      }
    });
  }
  
  // Display results
  console.log('📊 Validation Summary:');
  console.log(`   Total icons found: ${totalIcons}`);
  console.log(`   Valid icons: ${validIcons}`);
  console.log(`   Invalid icons: ${issues.length}`);
  console.log(`   Success rate: ${totalIcons > 0 ? ((validIcons / totalIcons) * 100).toFixed(1) : 0}%`);
  
  if (issues.length > 0) {
    console.log('\n❌ Issues found:\n');
    issues.forEach(issue => {
      console.log(`📍 ${issue.document} > ${issue.block} > ${issue.item}`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.details) {
        console.log(`   Details:`, JSON.stringify(issue.details, null, 2));
      }
      console.log('');
    });
  } else {
    console.log('\n✅ All icons are properly unified!');
  }
  
  // Check for any remaining string or iconPicker types
  console.log('\n🔎 Checking for legacy icon types...');
  const legacyQuery = `*[_type in ["page", "siteSettings", "provider"]] {
    "stringIcons": count(contentBlocks[].cards[icon != null && _type == null]),
    "iconPickerTypes": count(contentBlocks[].valueItems[icon._type == "iconPicker"])
  }`;
  
  const legacyStats = await client.fetch(legacyQuery);
  console.log('Legacy icon statistics:', legacyStats);
}

function validateIcon(icon: any): { isValid: boolean; error?: string } {
  // Check if it's an object
  if (typeof icon !== 'object' || icon === null) {
    return { isValid: false, error: 'Icon is not an object' };
  }
  
  // Check _type
  if (icon._type !== 'icon.manager') {
    return { isValid: false, error: `Invalid _type: ${icon._type}` };
  }
  
  // Check icon string
  if (!icon.icon || typeof icon.icon !== 'string') {
    return { isValid: false, error: 'Missing or invalid icon string' };
  }
  
  // Check metadata
  if (!icon.metadata || typeof icon.metadata !== 'object') {
    return { isValid: false, error: 'Missing metadata object' };
  }
  
  // Check required metadata fields
  if (!icon.metadata.iconName) {
    return { isValid: false, error: 'Missing metadata.iconName' };
  }
  
  if (!icon.metadata.collectionId) {
    return { isValid: false, error: 'Missing metadata.collectionId' };
  }
  
  // Check size structure
  if (!icon.metadata.size || typeof icon.metadata.size !== 'object') {
    return { isValid: false, error: 'Missing metadata.size object' };
  }
  
  if (typeof icon.metadata.size.width !== 'number' || typeof icon.metadata.size.height !== 'number') {
    return { isValid: false, error: 'Invalid size dimensions' };
  }
  
  // Check for direct width/height (common error)
  if ('width' in icon.metadata || 'height' in icon.metadata) {
    return { isValid: false, error: 'Direct width/height properties found (should use size object)' };
  }
  
  // Validate color if present
  if (icon.metadata.color) {
    if (!icon.metadata.color.hex || !icon.metadata.color.rgba) {
      return { isValid: false, error: 'Invalid color structure' };
    }
  }
  
  return { isValid: true };
}

// Run validation
validateIconUnification().catch(console.error);