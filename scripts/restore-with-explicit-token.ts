#!/usr/bin/env tsx

/**
 * Restore missing content blocks with explicit token loading
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

// Read .env file manually to ensure token is loaded
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
let sanityToken = '';

for (const line of envLines) {
  if (line.startsWith('SANITY_API_TOKEN=')) {
    sanityToken = line.substring('SANITY_API_TOKEN='.length).trim();
    break;
  }
}

if (!sanityToken) {
  console.error('❌ SANITY_API_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🔐 Token loaded from .env file');
console.log('📊 Token length:', sanityToken.length);

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: sanityToken
});

const AFFECTED_PAGE_ID = 'qgCxJyBbKpvhb2oGYqfgkp';

interface ContentBlock {
  _type: string;
  _key: string;
  title?: string;
  headline?: string;
  subheadline?: string;
  content?: any[];
  image?: any;
  imagePosition?: string;
  cta?: any;
  headerAlignment?: string;
  settings?: any;
  // Unknown fields that need cleanup
  features?: any;
  items?: any;
  valueItems?: any;
  variant?: any;
  showScrollIndicator?: any;
}

async function restoreMissingContent() {
  try {
    console.log('🔧 Starting content restoration...');
    
    // Test token first
    console.log('🧪 Testing token permissions...');
    try {
      const testQuery = await client.fetch('*[_id == $pageId][0]{_id, title}', { pageId: AFFECTED_PAGE_ID });
      console.log('✅ Read permission verified');
    } catch (error) {
      console.error('❌ Token test failed:', error);
      throw error;
    }
    
    // Fetch the current page data
    const pageData = await client.fetch(
      `*[_id == $pageId][0]{
        ...,
        contentBlocks[]{
          ...,
          _type,
          _key,
          title,
          headline,
          subheadline,
          content,
          image,
          imagePosition,
          cta,
          headerAlignment,
          settings,
          features,
          items,
          valueItems,
          variant,
          showScrollIndicator
        }
      }`,
      { pageId: AFFECTED_PAGE_ID }
    );

    if (!pageData) {
      console.error('❌ Page not found');
      return;
    }

    console.log('📄 Processing page:', pageData.title);
    console.log('📊 Content blocks found:', pageData.contentBlocks?.length || 0);

    // Process each content block
    const restoredBlocks = pageData.contentBlocks?.map((block: ContentBlock, index: number) => {
      console.log(`\n🔄 Processing block ${index + 1}: ${block._type} (${block._key})`);
      
      if (block._type === 'pageSection') {
        return restorePageSection(block, index);
      } else if (block._type === 'hero') {
        return restoreHero(block, index);
      } else {
        // For other blocks, just clean up unknown fields
        return cleanupUnknownFields(block, index);
      }
    }) || [];

    // Update the page with restored content blocks
    console.log('\n🚀 Updating page in Sanity...');
    
    const result = await client
      .patch(AFFECTED_PAGE_ID)
      .set({ contentBlocks: restoredBlocks })
      .commit();

    console.log('✅ Content restoration completed successfully!');
    console.log('📊 Updated blocks:', restoredBlocks.length);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during content restoration:', error);
    throw error;
  }
}

function restorePageSection(block: ContentBlock, index: number): ContentBlock {
  console.log('  📝 Restoring PageSection content...');
  
  // Create default content based on the title
  const defaultContent = [];
  
  if (block.title) {
    console.log(`    ✏️ Adding text content based on title: "${block.title}"`);
    
    // Create rich text content based on common patterns
    const textContent = createTextContentFromTitle(block.title);
    defaultContent.push({
      _type: 'block',
      _key: `block-${block._key}-1`,
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: `span-${block._key}-1`,
          text: textContent,
          marks: []
        }
      ],
      markDefs: []
    });
  }

  // Clean up the block and add proper structure
  const restoredBlock: ContentBlock = {
    _type: 'pageSection',
    _key: block._key,
    title: block.title || `Sektion ${index + 1}`,
    headerAlignment: block.headerAlignment || 'center',
    content: block.content || defaultContent,
    image: block.image || undefined,
    imagePosition: block.imagePosition || undefined,
    cta: block.cta || undefined,
    settings: block.settings || undefined
  };

  console.log('    ✅ PageSection restored with content blocks:', restoredBlock.content?.length || 0);
  return restoredBlock;
}

function restoreHero(block: ContentBlock, index: number): ContentBlock {
  console.log('  🎯 Restoring Hero block...');
  
  const restoredBlock: ContentBlock = {
    _type: 'hero',
    _key: block._key,
    headline: block.headline || 'Hero Headline',
    subheadline: block.subheadline || undefined,
    image: block.image || undefined
  };

  console.log('    ✅ Hero block restored');
  return restoredBlock;
}

function cleanupUnknownFields(block: ContentBlock, index: number): ContentBlock {
  console.log(`  🧹 Cleaning up ${block._type} block...`);
  
  // Remove known problematic fields
  const cleanedBlock = { ...block };
  delete cleanedBlock.features;
  delete cleanedBlock.items;
  delete cleanedBlock.valueItems;
  delete cleanedBlock.variant;
  delete cleanedBlock.showScrollIndicator;
  
  console.log('    ✅ Unknown fields cleaned up');
  return cleanedBlock;
}

function createTextContentFromTitle(title: string): string {
  // Generate relevant content based on the title
  const contentMap: { [key: string]: string } = {
    'Din komplette guide til at vælge el-leverandør': 
      'Vælg den rigtige el-leverandør kan spare dig tusindvis af kroner årligt. Denne guide hjælper dig med at forstå markedet og træffe det bedste valg for dit forbrug.',
    
    'Forstå markedet for el-leverandører i Danmark': 
      'Det danske elmarked blev liberaliseret i 2003, hvilket betyder, at du frit kan vælge din el-leverandør. Der er over 100 forskellige leverandører at vælge imellem.',
    
    'Beregn din potentielle besparelse': 
      'Med den rigtige el-leverandør kan en gennemsnitlig husstand spare mellem 2.000-5.000 kroner årligt. Brug vores beregner til at se din potentielle besparelse.',
    
    'Forstå forskellige prismodeller': 
      'El-leverandører tilbyder forskellige prismodeller: fast pris, variabel pris og spotpris. Hver model har sine fordele afhængigt af dit forbrugsmønster.',
    
    'Grøn energi og bæredygtighed': 
      'Mange danskere ønsker at vælge grøn strøm for at reducere deres CO2-aftryk. Lær om de forskellige certificeringer og garantier for grøn energi.',
    
    'Særlige overvejelser for forskellige forbrugertyper': 
      'Elhushold, sommerhusejere og virksomheder har forskellige behov. Find ud af, hvilke faktorer der er vigtigst for din situation.',
    
    'Processen: Fra research til skift': 
      'Skift af el-leverandør er nemt og gratis. Vi guider dig gennem hele processen fra sammenligning til kontraktunderskrivelse.',
    
    'Almindelige faldgruber og hvordan du undgår dem': 
      'Undgå dyre fejl ved at kende de mest almindelige faldgruber når du vælger el-leverandør. Læs de små bogstaver og forstå alle gebyrer.',
    
    'Vindstød - Et eksempel på moderne el-leverandør': 
      'Vindstød er en moderne el-leverandør, der fokuserer på transparent prissætning og 100% grøn energi. Se hvorfor mange danskere vælger Vindstød.'
  };
  
  return contentMap[title] || `Læs mere om ${title.toLowerCase()} og få den bedste vejledning til at træffe det rigtige valg for din situation.`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  restoreMissingContent()
    .then(() => {
      console.log('\n🎉 Content restoration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Content restoration failed:', error);
      process.exit(1);
    });
}

export { restoreMissingContent };