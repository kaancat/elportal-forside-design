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

interface IconManagerType {
  _type: 'icon.manager';
  icon: string;
  metadata: {
    iconName: string;
    collectionId: string;
    collectionName: string;
    size: {
      width: number;
      height: number;
    };
    hFlip: boolean;
    vFlip: boolean;
    rotate: 0 | 1 | 2 | 3;
    color?: {
      hex: string;
      rgba: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    };
  };
}

// Mapping of common icon names to Lucide equivalents
const iconMapping: Record<string, string> = {
  // Direct mappings
  'shield': 'shield',
  'clock': 'clock',
  'trending-up': 'trending-up',
  'zap': 'zap',
  'users': 'users',
  'euro': 'euro',
  'shield-check': 'shield-check',
  'wind': 'wind',
  
  // IconPicker mappings
  'Wind': 'wind',
  'Leaf': 'leaf',
  'TrendingUp': 'trending-up',
  'Clock': 'clock',
  'Shield': 'shield',
  'Zap': 'zap'
};

function createProperIconStructure(iconName: string, collectionId = 'lucide'): IconManagerType {
  // Clean up icon name
  const cleanIconName = iconMapping[iconName] || iconName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return {
    _type: 'icon.manager',
    icon: `${collectionId}:${cleanIconName}`,
    metadata: {
      iconName: cleanIconName,
      collectionId: collectionId,
      collectionName: 'Lucide',
      size: {
        width: 24,
        height: 24
      },
      hFlip: false,
      vFlip: false,
      rotate: 0
    }
  };
}

function convertIconToProperStructure(icon: any): IconManagerType | null {
  // Handle string icons
  if (typeof icon === 'string') {
    console.log(`  Converting string icon: "${icon}"`);
    return createProperIconStructure(icon);
  }
  
  // Handle iconPicker type
  if (icon?._type === 'iconPicker') {
    console.log(`  Converting iconPicker: "${icon.name}"`);
    return createProperIconStructure(icon.name);
  }
  
  // Handle malformed icon.manager objects
  if (icon?._type === 'icon.manager') {
    const fixed: IconManagerType = {
      _type: 'icon.manager',
      icon: icon.icon || 'lucide:help-circle',
      metadata: {
        iconName: icon.metadata?.iconName || 'help-circle',
        collectionId: icon.metadata?.collectionId || icon.metadata?.provider || 'lucide',
        collectionName: icon.metadata?.collectionName || 'Lucide',
        size: {
          width: 24,
          height: 24
        },
        hFlip: icon.metadata?.hFlip ?? false,
        vFlip: icon.metadata?.vFlip ?? false,
        rotate: icon.metadata?.rotate ?? 0
      }
    };
    
    // Fix size structure if needed
    if (icon.metadata?.size) {
      fixed.metadata.size = icon.metadata.size;
    } else if (icon.metadata?.width && icon.metadata?.height) {
      console.log(`  Fixing malformed size structure`);
      fixed.metadata.size = {
        width: icon.metadata.width,
        height: icon.metadata.height
      };
    }
    
    // Preserve color if valid
    if (icon.metadata?.color && icon.metadata.color.hex && icon.metadata.color.rgba) {
      fixed.metadata.color = icon.metadata.color;
    }
    
    return fixed;
  }
  
  return null;
}

async function unifyAllIcons() {
  console.log('🔄 Starting comprehensive icon unification...\n');
  
  // Query all documents with potential icon fields
  const query = `*[_type in ["page", "siteSettings", "provider"]] {
    _id,
    _type,
    title,
    slug,
    contentBlocks
  }`;
  
  const docs = await client.fetch(query);
  let totalUpdated = 0;
  let totalFixed = 0;
  
  for (const doc of docs) {
    if (!doc.contentBlocks || doc.contentBlocks.length === 0) continue;
    
    let documentUpdated = false;
    const updatedContentBlocks = [...doc.contentBlocks];
    
    for (let blockIndex = 0; blockIndex < updatedContentBlocks.length; blockIndex++) {
      const block = updatedContentBlocks[blockIndex];
      
      // Handle InfoCardsSection
      if (block._type === 'infoCardsSection' && block.cards) {
        console.log(`\n📋 Processing InfoCardsSection in ${doc.title || doc.slug?.current || doc._id}`);
        
        for (let cardIndex = 0; cardIndex < block.cards.length; cardIndex++) {
          const card = block.cards[cardIndex];
          
          if (card.icon && (typeof card.icon === 'string' || card.icon._type !== 'icon.manager')) {
            const converted = convertIconToProperStructure(card.icon);
            if (converted) {
              updatedContentBlocks[blockIndex].cards[cardIndex].icon = converted;
              documentUpdated = true;
              totalFixed++;
              console.log(`  ✅ Fixed icon for card: ${card.title}`);
            }
          }
        }
      }
      
      // Handle ValueProposition
      if (block._type === 'valueProposition' && block.valueItems) {
        console.log(`\n💡 Processing ValueProposition in ${doc.title || doc.slug?.current || doc._id}`);
        
        for (let itemIndex = 0; itemIndex < block.valueItems.length; itemIndex++) {
          const item = block.valueItems[itemIndex];
          
          if (item.icon) {
            const converted = convertIconToProperStructure(item.icon);
            if (converted) {
              updatedContentBlocks[blockIndex].valueItems[itemIndex].icon = converted;
              documentUpdated = true;
              totalFixed++;
              console.log(`  ✅ Fixed icon for item: ${item.heading}`);
            }
          }
        }
      }
      
      // Handle FeatureList
      if (block._type === 'featureList' && block.features) {
        console.log(`\n🎯 Processing FeatureList in ${doc.title || doc.slug?.current || doc._id}`);
        
        for (let featureIndex = 0; featureIndex < block.features.length; featureIndex++) {
          const feature = block.features[featureIndex];
          
          if (feature.icon) {
            const converted = convertIconToProperStructure(feature.icon);
            if (converted) {
              updatedContentBlocks[blockIndex].features[featureIndex].icon = converted;
              documentUpdated = true;
              totalFixed++;
              console.log(`  ✅ Fixed icon for feature: ${feature.title}`);
            }
          }
        }
      }
    }
    
    // Update document if any changes were made
    if (documentUpdated) {
      try {
        await client.patch(doc._id)
          .set({ contentBlocks: updatedContentBlocks })
          .commit();
        
        totalUpdated++;
        console.log(`\n✅ Updated document: ${doc.title || doc.slug?.current || doc._id}`);
      } catch (error) {
        console.error(`\n❌ Failed to update document ${doc._id}:`, error);
      }
    }
  }
  
  console.log('\n\n🎉 Icon unification complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Documents updated: ${totalUpdated}`);
  console.log(`   - Icons fixed: ${totalFixed}`);
  console.log('\n📝 Next steps:');
  console.log('1. Open Sanity Studio and verify the icons display correctly');
  console.log('2. Use the icon picker to customize colors if needed');
  console.log('3. Test the frontend to ensure all icons render properly');
}

// Run the migration
unifyAllIcons().catch(console.error);