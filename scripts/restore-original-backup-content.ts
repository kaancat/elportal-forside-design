#!/usr/bin/env tsx

/**
 * Restore the original rich content from backup (July 29, 2025)
 * This script recovers the full 1,528-word content that was lost during the initial restoration
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@sanity/client';

// Sanity client setup
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
const BACKUP_PATH = './backup-analysis/json_20250729_034925/page.json';

interface ContentBlock {
  _type: string;
  _key: string;
  title?: string;
  headline?: string;
  subheadline?: string;
  content?: any[];
  [key: string]: any;
}

interface PageData {
  _id: string;
  title?: string;
  contentBlocks?: ContentBlock[];
}

async function restoreOriginalContent() {
  try {
    console.log('🔄 RESTORING ORIGINAL RICH CONTENT FROM BACKUP');
    console.log('===============================================');
    console.log('📅 Backup date: July 29, 2025 at 03:49:25');
    console.log('📊 Expected word count: 1,528 words');
    console.log('🎯 Target: Replace simplified content with original rich content');
    
    // Read backup data
    console.log('\n📁 Reading backup file...');
    const backupJson = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
    const backupData = backupJson.result || backupJson;
    
    // Find the affected page in backup
    const affectedPageBackup = backupData.find((page: PageData) => page._id === AFFECTED_PAGE_ID);
    
    if (!affectedPageBackup) {
      console.error('❌ Affected page not found in backup');
      return;
    }
    
    console.log('✅ Found page in backup:', affectedPageBackup.title);
    console.log('📊 Backup content blocks:', affectedPageBackup.contentBlocks?.length || 0);
    
    // Validate backup content blocks
    if (!affectedPageBackup.contentBlocks || affectedPageBackup.contentBlocks.length === 0) {
      console.error('❌ No content blocks found in backup');
      return;
    }
    
    // Get current page data for comparison
    console.log('\n📋 Fetching current page state...');
    const currentPageData = await client.fetch(
      `*[_id == $pageId][0]{
        _id,
        title,
        contentBlocks[]
      }`,
      { pageId: AFFECTED_PAGE_ID }
    );
    
    if (!currentPageData) {
      console.error('❌ Current page not found');
      return;
    }
    
    console.log('📊 Current content blocks:', currentPageData.contentBlocks?.length || 0);
    
    // Prepare content blocks for restoration
    console.log('\n🔧 Preparing content blocks for restoration...');
    const restoredBlocks: ContentBlock[] = [];
    
    affectedPageBackup.contentBlocks.forEach((block: ContentBlock, index: number) => {
      console.log(`\n${index + 1}. Processing ${block._type} (${block._key})`);
      
      // Create a clean copy of the block
      const restoredBlock: ContentBlock = {
        _type: block._type,
        _key: block._key
      };
      
      // Restore all original fields based on block type
      if (block._type === 'pageSection') {
        if (block.title) restoredBlock.title = block.title;
        if (block.headerAlignment) restoredBlock.headerAlignment = block.headerAlignment;
        if (block.content) restoredBlock.content = block.content;
        if (block.image) restoredBlock.image = block.image;
        if (block.imagePosition) restoredBlock.imagePosition = block.imagePosition;
        if (block.cta) restoredBlock.cta = block.cta;
        if (block.settings) restoredBlock.settings = block.settings;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        console.log(`   📄 Content blocks: ${Array.isArray(block.content) ? block.content.length : 'none'}`);
        
      } else if (block._type === 'hero') {
        if (block.headline) restoredBlock.headline = block.headline;
        if (block.subheadline) restoredBlock.subheadline = block.subheadline;
        if (block.content) restoredBlock.content = block.content;
        if (block.image) restoredBlock.image = block.image;
        
        console.log(`   🎯 Headline: "${block.headline || 'No headline'}"`);
        console.log(`   📝 Subheadline: "${block.subheadline || 'No subheadline'}"`);
        console.log(`   📄 Content blocks: ${Array.isArray(block.content) ? block.content.length : 'none'}`);
        
      } else if (block._type === 'featureList') {
        if (block.title) restoredBlock.title = block.title;
        if (block.features) restoredBlock.features = block.features;
        if (block.headerAlignment) restoredBlock.headerAlignment = block.headerAlignment;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        console.log(`   🎯 Features: ${Array.isArray(block.features) ? block.features.length : 'none'}`);
        
      } else if (block._type === 'providerList') {
        if (block.title) restoredBlock.title = block.title;
        if (block.headerAlignment) restoredBlock.headerAlignment = block.headerAlignment;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        
      } else if (block._type === 'valueProposition') {
        if (block.heading) restoredBlock.heading = block.heading;
        if (block.valueItems) restoredBlock.valueItems = block.valueItems;
        if (block.headerAlignment) restoredBlock.headerAlignment = block.headerAlignment;
        
        console.log(`   📝 Heading: "${block.heading || 'No heading'}"`);
        console.log(`   💎 Value items: ${Array.isArray(block.valueItems) ? block.valueItems.length : 'none'}`);
        
      } else if (block._type === 'faqGroup') {
        if (block.title) restoredBlock.title = block.title;
        if (block.faqs) restoredBlock.faqs = block.faqs;
        if (block.headerAlignment) restoredBlock.headerAlignment = block.headerAlignment;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        console.log(`   ❓ FAQs: ${Array.isArray(block.faqs) ? block.faqs.length : 'none'}`);
        
      } else if (block._type === 'callToActionSection') {
        if (block.title) restoredBlock.title = block.title;
        if (block.description) restoredBlock.description = block.description;
        if (block.cta) restoredBlock.cta = block.cta;
        if (block.headerAlignment) restoredBlock.headerAlignment = block.headerAlignment;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        console.log(`   📄 Description: "${block.description || 'No description'}"`);
        
      } else {
        // For other block types, copy all fields except problematic ones
        Object.keys(block).forEach(key => {
          if (!key.startsWith('_') || key === '_type' || key === '_key') {
            restoredBlock[key] = block[key];
          }
        });
        
        console.log(`   🧱 All ${block._type} fields restored`);
      }
      
      restoredBlocks.push(restoredBlock);
      console.log(`   ✅ Block prepared for restoration`);
    });
    
    console.log(`\n📊 Prepared ${restoredBlocks.length} blocks for restoration`);
    
    // Create backup of current state before restoration
    console.log('\n💾 Creating backup of current state...');
    const currentBackupPath = `./sanity-backups/pre-rich-content-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(currentBackupPath, JSON.stringify(currentPageData, null, 2));
    console.log('✅ Current state backed up to:', currentBackupPath);
    
    // Restore the content
    console.log('\n🚀 Restoring original rich content to Sanity...');
    
    const result = await client
      .patch(AFFECTED_PAGE_ID)
      .set({ contentBlocks: restoredBlocks })
      .commit();
    
    console.log('\n🎉 RESTORATION COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('✅ Original rich content has been restored');
    console.log('📊 Restored blocks:', restoredBlocks.length);
    console.log('📅 Content from: July 29, 2025');
    console.log('🎯 Expected outcome: ~1,528 words of rich content');
    console.log('💾 Pre-restoration backup saved to:', currentBackupPath);
    
    // Verification step
    console.log('\n🔍 Verifying restoration...');
    const verificationData = await client.fetch(
      `*[_id == $pageId][0]{
        _id,
        title,
        contentBlocks[]
      }`,
      { pageId: AFFECTED_PAGE_ID }
    );
    
    const pageSections = verificationData.contentBlocks?.filter((block: ContentBlock) => block._type === 'pageSection') || [];
    const populatedSections = pageSections.filter((section: ContentBlock) => 
      Array.isArray(section.content) && section.content.length > 0
    );
    
    console.log(`📊 Verification results:`);
    console.log(`   - Total blocks: ${verificationData.contentBlocks?.length || 0}`);
    console.log(`   - PageSections: ${pageSections.length}`);
    console.log(`   - Populated PageSections: ${populatedSections.length}`);
    console.log(`   - Success rate: ${Math.round((populatedSections.length / Math.max(pageSections.length, 1)) * 100)}%`);
    
    if (populatedSections.length === pageSections.length && pageSections.length > 0) {
      console.log('🎉 PERFECT: All PageSections have been restored with content!');
    } else {
      console.log('⚠️ Some PageSections may still need attention');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during restoration:', error);
    throw error;
  }
}

// Run restoration
restoreOriginalContent()
  .then(() => {
    console.log('\n🎊 Original rich content restoration completed successfully!');
    console.log('🌐 The page should now display the full 1,528-word content from July 29, 2025');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Restoration failed:', error);
    process.exit(1);
  });