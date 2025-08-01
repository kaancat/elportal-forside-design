#!/usr/bin/env tsx

/**
 * Clean up unknown fields that are causing validation errors
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

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: sanityToken
});

const AFFECTED_PAGE_ID = 'qgCxJyBbKpvhb2oGYqfgkp';

async function cleanupUnknownFields() {
  try {
    console.log('🧹 Starting cleanup of unknown fields...');
    
    // Fetch the current page data
    const pageData = await client.fetch(
      `*[_id == $pageId][0]{
        ...,
        contentBlocks[]
      }`,
      { pageId: AFFECTED_PAGE_ID }
    );

    if (!pageData) {
      console.error('❌ Page not found');
      return;
    }

    console.log('📄 Processing page:', pageData.title);
    console.log('📊 Content blocks found:', pageData.contentBlocks?.length || 0);

    // Clean up each content block
    const cleanedBlocks = pageData.contentBlocks?.map((block: any, index: number) => {
      console.log(`\n🔄 Cleaning block ${index + 1}: ${block._type} (${block._key})`);
      
      // Create a new object with only the fields that should exist
      const cleanedBlock: any = {
        _type: block._type,
        _key: block._key
      };

      // Add fields based on block type
      if (block._type === 'pageSection') {
        if (block.title) cleanedBlock.title = block.title;
        if (block.headerAlignment) cleanedBlock.headerAlignment = block.headerAlignment;
        if (block.content) cleanedBlock.content = block.content;
        if (block.image) cleanedBlock.image = block.image;
        if (block.imagePosition) cleanedBlock.imagePosition = block.imagePosition;
        if (block.cta) cleanedBlock.cta = block.cta;
        if (block.settings) cleanedBlock.settings = block.settings;
        console.log('  ✅ PageSection cleaned');
      } else if (block._type === 'hero') {
        if (block.headline) cleanedBlock.headline = block.headline;
        if (block.subheadline) cleanedBlock.subheadline = block.subheadline;
        if (block.image) cleanedBlock.image = block.image;
        console.log('  ✅ Hero cleaned');
      } else {
        // For other block types, copy all known fields except the problematic ones
        Object.keys(block).forEach(key => {
          if (!['features', 'items', 'valueItems', 'variant', 'showScrollIndicator'].includes(key)) {
            cleanedBlock[key] = block[key];
          }
        });
        console.log(`  ✅ ${block._type} cleaned`);
      }

      return cleanedBlock;
    }) || [];

    // Update the page with cleaned content blocks
    console.log('\n🚀 Updating page in Sanity...');
    
    const result = await client
      .patch(AFFECTED_PAGE_ID)
      .set({ contentBlocks: cleanedBlocks })
      .commit();

    console.log('✅ Unknown fields cleanup completed successfully!');
    console.log('📊 Cleaned blocks:', cleanedBlocks.length);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run cleanup
cleanupUnknownFields()
  .then(() => {
    console.log('\n🎉 Unknown fields cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });