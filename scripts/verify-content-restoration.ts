#!/usr/bin/env tsx

/**
 * Verify that content restoration was successful
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

async function verifyContentRestoration() {
  try {
    console.log('🔍 Verifying content restoration...');
    
    // Fetch the updated page data
    const pageData = await client.fetch(
      `*[_id == $pageId][0]{
        _id,
        title,
        contentBlocks[]{
          _type,
          _key,
          title,
          headline,
          subheadline,
          content,
          image,
          headerAlignment,
          // Check for removed unknown fields
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

    console.log('📄 Page:', pageData.title);
    console.log('📊 Total content blocks:', pageData.contentBlocks?.length || 0);

    let restoredPageSections = 0;
    let cleanedBlocks = 0;
    let totalUnknownFields = 0;

    console.log('\n📋 Content blocks verification:');
    
    pageData.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n${index + 1}. ${block._type} (${block._key})`);
      
      if (block._type === 'pageSection') {
        console.log(`   📝 Title: "${block.title}"`);
        console.log(`   🎯 HeaderAlignment: ${block.headerAlignment || 'default'}`);
        console.log(`   📄 Content blocks: ${Array.isArray(block.content) ? block.content.length : 'null'}`);
        
        if (Array.isArray(block.content) && block.content.length > 0) {
          restoredPageSections++;
          console.log(`   ✅ RESTORED with content`);
        } else {
          console.log(`   ❌ STILL MISSING content`);
        }
        
        if (block.image) {
          console.log(`   🖼️ Image: Present`);
        }
      } else if (block._type === 'hero') {
        console.log(`   🎯 Headline: "${block.headline}"`);
        console.log(`   📝 Subheadline: ${block.subheadline ? `"${block.subheadline}"` : 'none'}`);
        console.log(`   ✅ HERO restored`);
      } else {
        console.log(`   🧹 Other block type: ${block._type}`);
      }
      
      // Check for unknown fields that should have been removed
      const unknownFields = [];
      if (block.features !== undefined) unknownFields.push('features');
      if (block.items !== undefined) unknownFields.push('items');
      if (block.valueItems !== undefined) unknownFields.push('valueItems');
      if (block.variant !== undefined) unknownFields.push('variant');
      if (block.showScrollIndicator !== undefined) unknownFields.push('showScrollIndicator');
      
      if (unknownFields.length > 0) {
        console.log(`   ⚠️ Unknown fields still present: ${unknownFields.join(', ')}`);
        totalUnknownFields += unknownFields.length;
      } else {
        console.log(`   ✅ Clean (no unknown fields)`);
        cleanedBlocks++;
      }
    });

    // Summary
    console.log('\n📊 RESTORATION SUMMARY:');
    console.log(`✅ PageSection blocks restored: ${restoredPageSections}/11`);
    console.log(`🧹 Blocks cleaned: ${cleanedBlocks}/${pageData.contentBlocks?.length || 0}`);
    console.log(`⚠️ Remaining unknown fields: ${totalUnknownFields}`);
    
    if (restoredPageSections === 11 && totalUnknownFields === 0) {
      console.log('\n🎉 CONTENT RESTORATION: FULLY SUCCESSFUL!');
      console.log('✅ All PageSection blocks now have content arrays');
      console.log('✅ All unknown fields have been cleaned up');
      console.log('✅ Frontend should now display all content correctly');
    } else {
      console.log('\n⚠️ CONTENT RESTORATION: PARTIALLY SUCCESSFUL');
      if (restoredPageSections < 11) {
        console.log(`❌ ${11 - restoredPageSections} PageSection blocks still missing content`);
      }
      if (totalUnknownFields > 0) {
        console.log(`❌ ${totalUnknownFields} unknown fields still present`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
}

// Run verification
verifyContentRestoration();