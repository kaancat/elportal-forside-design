#!/usr/bin/env tsx

/**
 * Backup the affected page with missing content blocks
 * Page ID extracted from Sanity Studio URL: qgCxJyBbKpvhb2oGYqfgkp
 */

import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

const AFFECTED_PAGE_ID = 'qgCxJyBbKpvhb2oGYqfgkp';

async function backupAffectedPage() {
  try {
    console.log('🔍 Fetching affected page data...');
    
    // Fetch the complete page document
    const pageData = await client.fetch(
      `*[_id == $pageId][0]{
        ...,
        contentBlocks[]{
          ...,
          _type,
          _key,
          // Get all possible fields to capture the current state
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
      console.error('❌ Page not found with ID:', AFFECTED_PAGE_ID);
      return;
    }

    console.log('📄 Page found:', pageData.title || 'Untitled');
    console.log('📊 Content blocks:', pageData.contentBlocks?.length || 0);

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `page-backup-${AFFECTED_PAGE_ID}-${timestamp}.json`;
    const backupPath = join(process.cwd(), 'sanity-backups', backupFilename);

    // Create backup directory if it doesn't exist
    const fs = await import('fs');
    const backupDir = join(process.cwd(), 'sanity-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write backup file
    writeFileSync(backupPath, JSON.stringify(pageData, null, 2));
    
    console.log('✅ Backup created:', backupPath);
    
    // Analyze content blocks with issues
    console.log('\n📋 Content blocks analysis:');
    pageData.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`  ${index + 1}. ${block._type} (${block._key})`);
      
      if (block._type === 'pageSection') {
        console.log('    📝 PageSection fields:');
        console.log('      - title:', block.title || 'null');
        console.log('      - content:', block.content ? 'array' : 'null');
        console.log('      - image:', block.image ? 'present' : 'null');
        console.log('      - unknown fields:', {
          features: block.features,
          items: block.items,
          valueItems: block.valueItems
        });
      }
      
      if (block._type === 'hero') {
        console.log('    🎯 Hero fields:');
        console.log('      - headline:', block.headline || 'null');
        console.log('      - subheadline:', block.subheadline || 'null');
        console.log('      - unknown fields:', {
          content: block.content,
          features: block.features,
          items: block.items,
          valueItems: block.valueItems
        });
      }
    });

    return backupPath;
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backupAffectedPage()
    .then((backupPath) => {
      console.log(`\n🎉 Backup completed: ${backupPath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Backup failed:', error);
      process.exit(1);
    });
}

export { backupAffectedPage };