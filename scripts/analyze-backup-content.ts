#!/usr/bin/env tsx

/**
 * Analyze backup content from three days ago and compare with current state
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
  _createdAt?: string;
  _updatedAt?: string;
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function extractTextFromPortableText(content: any[]): string {
  if (!Array.isArray(content)) return '';
  
  let text = '';
  for (const block of content) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child.text) {
          text += child.text + ' ';
        }
      }
    }
  }
  return text.trim();
}

function analyzeContentBlock(block: ContentBlock): any {
  const analysis = {
    type: block._type,
    key: block._key,
    hasTitle: !!block.title,
    hasHeadline: !!block.headline,
    hasSubheadline: !!block.subheadline,
    hasContent: !!block.content,
    contentBlocks: 0,
    wordCount: 0,
    contentType: 'empty'
  };

  // Analyze title/headline
  if (block.title) {
    analysis.wordCount += countWords(block.title);
  }
  if (block.headline) {
    analysis.wordCount += countWords(block.headline);
  }
  if (block.subheadline) {
    analysis.wordCount += countWords(block.subheadline);
  }

  // Analyze content array
  if (Array.isArray(block.content)) {
    analysis.contentBlocks = block.content.length;
    if (block.content.length > 0) {
      analysis.contentType = 'populated';
      const contentText = extractTextFromPortableText(block.content);
      analysis.wordCount += countWords(contentText);
    }
  } else if (block.content === null) {
    analysis.contentType = 'null';
  }

  return analysis;
}

async function analyzeBackupContent() {
  console.log('📁 Analyzing backup content from three days ago...');
  console.log('📅 Backup date: July 29, 2025 at 03:49:25');
  
  // Read backup data
  const backupJson = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
  const backupData = backupJson.result || backupJson; // Handle both wrapped and unwrapped formats
  console.log('📊 Total pages in backup:', backupData.length);
  
  // Find affected page
  const affectedPageBackup = backupData.find((page: PageData) => page._id === AFFECTED_PAGE_ID);
  
  if (!affectedPageBackup) {
    console.error('❌ Affected page not found in backup');
    return null;
  }

  console.log('\n🎯 BACKUP ANALYSIS - Three Days Ago');
  console.log('=====================================');
  console.log('📄 Page:', affectedPageBackup.title);
  console.log('🔑 Page ID:', affectedPageBackup._id);
  console.log('📅 Created:', affectedPageBackup._createdAt);
  console.log('📅 Updated:', affectedPageBackup._updatedAt);
  console.log('📊 Content blocks:', affectedPageBackup.contentBlocks?.length || 0);

  const backupAnalysis = {
    pageTitle: affectedPageBackup.title,
    totalBlocks: affectedPageBackup.contentBlocks?.length || 0,
    pageSections: 0,
    populatedPageSections: 0,
    nullPageSections: 0,
    totalWordCount: 0,
    blockAnalysis: [] as any[]
  };

  if (affectedPageBackup.contentBlocks) {
    console.log('\n📋 Content blocks analysis:');
    
    affectedPageBackup.contentBlocks.forEach((block: ContentBlock, index: number) => {
      const analysis = analyzeContentBlock(block);
      backupAnalysis.blockAnalysis.push(analysis);
      backupAnalysis.totalWordCount += analysis.wordCount;
      
      console.log(`\n${index + 1}. ${block._type} (${block._key})`);
      
      if (block._type === 'pageSection') {
        backupAnalysis.pageSections++;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        console.log(`   📄 Content: ${analysis.contentType}`);
        console.log(`   📊 Content blocks: ${analysis.contentBlocks}`);
        console.log(`   💬 Word count: ${analysis.wordCount}`);
        
        if (analysis.contentType === 'populated') {
          backupAnalysis.populatedPageSections++;
          console.log(`   ✅ Had content`);
        } else if (analysis.contentType === 'null') {
          backupAnalysis.nullPageSections++;
          console.log(`   ❌ Content was null`);
        }
      } else if (block._type === 'hero') {
        console.log(`   🎯 Headline: "${block.headline || 'No headline'}"`);
        console.log(`   📝 Subheadline: "${block.subheadline || 'No subheadline'}"`);
        console.log(`   💬 Word count: ${analysis.wordCount}`);
      } else {
        console.log(`   🧱 Block type: ${block._type}`);
        console.log(`   💬 Word count: ${analysis.wordCount}`);
      }
    });
  }

  console.log('\n📊 BACKUP SUMMARY:');
  console.log(`📄 Total content blocks: ${backupAnalysis.totalBlocks}`);
  console.log(`📝 PageSection blocks: ${backupAnalysis.pageSections}`);
  console.log(`✅ PageSections with content: ${backupAnalysis.populatedPageSections}`);
  console.log(`❌ PageSections with null content: ${backupAnalysis.nullPageSections}`);
  console.log(`💬 Total word count: ${backupAnalysis.totalWordCount}`);

  return backupAnalysis;
}

async function analyzeCurrentContent() {
  console.log('\n📁 Analyzing current content state...');
  
  // Fetch current page data
  const currentPageData = await client.fetch(
    `*[_id == $pageId][0]{
      _id,
      title,
      _createdAt,
      _updatedAt,
      contentBlocks[]{
        _type,
        _key,
        title,
        headline,
        subheadline,
        content,
        image,
        headerAlignment
      }
    }`,
    { pageId: AFFECTED_PAGE_ID }
  );

  if (!currentPageData) {
    console.error('❌ Current page not found');
    return null;
  }

  console.log('\n🎯 CURRENT ANALYSIS - After Restoration');
  console.log('======================================');
  console.log('📄 Page:', currentPageData.title);
  console.log('🔑 Page ID:', currentPageData._id);
  console.log('📅 Created:', currentPageData._createdAt);
  console.log('📅 Updated:', currentPageData._updatedAt);
  console.log('📊 Content blocks:', currentPageData.contentBlocks?.length || 0);

  const currentAnalysis = {
    pageTitle: currentPageData.title,
    totalBlocks: currentPageData.contentBlocks?.length || 0,
    pageSections: 0,
    populatedPageSections: 0,
    nullPageSections: 0,
    totalWordCount: 0,
    blockAnalysis: [] as any[]
  };

  if (currentPageData.contentBlocks) {
    console.log('\n📋 Content blocks analysis:');
    
    currentPageData.contentBlocks.forEach((block: ContentBlock, index: number) => {
      const analysis = analyzeContentBlock(block);
      currentAnalysis.blockAnalysis.push(analysis);
      currentAnalysis.totalWordCount += analysis.wordCount;
      
      console.log(`\n${index + 1}. ${block._type} (${block._key})`);
      
      if (block._type === 'pageSection') {
        currentAnalysis.pageSections++;
        
        console.log(`   📝 Title: "${block.title || 'No title'}"`);
        console.log(`   📄 Content: ${analysis.contentType}`);
        console.log(`   📊 Content blocks: ${analysis.contentBlocks}`);
        console.log(`   💬 Word count: ${analysis.wordCount}`);
        
        if (analysis.contentType === 'populated') {
          currentAnalysis.populatedPageSections++;
          console.log(`   ✅ Has content`);
        } else if (analysis.contentType === 'null') {
          currentAnalysis.nullPageSections++;
          console.log(`   ❌ Content is null`);
        }
      } else if (block._type === 'hero') {
        console.log(`   🎯 Headline: "${block.headline || 'No headline'}"`);
        console.log(`   📝 Subheadline: "${block.subheadline || 'No subheadline'}"`);
        console.log(`   💬 Word count: ${analysis.wordCount}`);
      } else {
        console.log(`   🧱 Block type: ${block._type}`);
        console.log(`   💬 Word count: ${analysis.wordCount}`);
      }
    });
  }

  console.log('\n📊 CURRENT SUMMARY:');
  console.log(`📄 Total content blocks: ${currentAnalysis.totalBlocks}`);
  console.log(`📝 PageSection blocks: ${currentAnalysis.pageSections}`);
  console.log(`✅ PageSections with content: ${currentAnalysis.populatedPageSections}`);
  console.log(`❌ PageSections with null content: ${currentAnalysis.nullPageSections}`);
  console.log(`💬 Total word count: ${currentAnalysis.totalWordCount}`);

  return currentAnalysis;
}

function generateComparativeReport(backupAnalysis: any, currentAnalysis: any) {
  console.log('\n📊 COMPARATIVE ANALYSIS REPORT');
  console.log('===============================');
  
  const wordCountDiff = currentAnalysis.totalWordCount - backupAnalysis.totalWordCount;
  const contentBlocksDiff = currentAnalysis.totalBlocks - backupAnalysis.totalBlocks;
  const populatedSectionsDiff = currentAnalysis.populatedPageSections - backupAnalysis.populatedPageSections;
  
  console.log('\n📈 QUANTITATIVE CHANGES:');
  console.log(`📄 Total content blocks: ${backupAnalysis.totalBlocks} → ${currentAnalysis.totalBlocks} (${contentBlocksDiff >= 0 ? '+' : ''}${contentBlocksDiff})`);
  console.log(`📝 PageSection blocks: ${backupAnalysis.pageSections} → ${currentAnalysis.pageSections}`);
  console.log(`✅ Populated PageSections: ${backupAnalysis.populatedPageSections} → ${currentAnalysis.populatedPageSections} (${populatedSectionsDiff >= 0 ? '+' : ''}${populatedSectionsDiff})`);
  console.log(`❌ Null PageSections: ${backupAnalysis.nullPageSections} → ${currentAnalysis.nullPageSections}`);
  console.log(`💬 Total word count: ${backupAnalysis.totalWordCount} → ${currentAnalysis.totalWordCount} (${wordCountDiff >= 0 ? '+' : ''}${wordCountDiff})`);
  
  console.log('\n📋 CONTENT RESTORATION IMPACT:');
  
  if (populatedSectionsDiff > 0) {
    console.log(`🎉 SUCCESS: Restored content to ${populatedSectionsDiff} PageSection blocks`);
  }
  
  if (wordCountDiff > 0) {
    console.log(`📝 CONTENT ADDED: ${wordCountDiff} words of new content created`);
  } else if (wordCountDiff < 0) {
    console.log(`📉 CONTENT REDUCED: ${Math.abs(wordCountDiff)} words lost`);
  } else {
    console.log(`📊 NO CHANGE: Word count remained the same`);
  }
  
  if (currentAnalysis.nullPageSections === 0 && backupAnalysis.nullPageSections > 0) {
    console.log(`✅ FULLY RESTORED: All null PageSections now have content`);
  } else if (currentAnalysis.nullPageSections > 0) {
    console.log(`⚠️ PARTIALLY RESTORED: ${currentAnalysis.nullPageSections} PageSections still have null content`);
  }
  
  console.log('\n🎯 RESTORATION ASSESSMENT:');
  
  const restorationSuccess = (currentAnalysis.populatedPageSections / Math.max(currentAnalysis.pageSections, 1)) * 100;
  console.log(`📊 PageSection Content Rate: ${restorationSuccess.toFixed(1)}%`);
  
  if (restorationSuccess >= 90) {
    console.log('🎉 EXCELLENT: Restoration was highly successful');
  } else if (restorationSuccess >= 70) {
    console.log('✅ GOOD: Restoration was mostly successful');
  } else if (restorationSuccess >= 50) {
    console.log('⚠️ PARTIAL: Restoration had moderate success');
  } else {
    console.log('❌ POOR: Restoration needs more work');
  }
  
  return {
    backup: backupAnalysis,
    current: currentAnalysis,
    differences: {
      wordCount: wordCountDiff,
      contentBlocks: contentBlocksDiff,
      populatedSections: populatedSectionsDiff
    },
    restorationSuccess: restorationSuccess
  };
}

async function main() {
  try {
    console.log('🔍 BACKUP CONTENT ANALYSIS');
    console.log('===========================');
    console.log('📅 Comparing content from three days ago with current state');
    console.log('🎯 Target page: "Sådan vælger du den rigtige el-leverandør - Komplet guide 2025"');
    
    const backupAnalysis = await analyzeBackupContent();
    if (!backupAnalysis) return;
    
    const currentAnalysis = await analyzeCurrentContent();
    if (!currentAnalysis) return;
    
    const report = generateComparativeReport(backupAnalysis, currentAnalysis);
    
    // Save report to file
    const reportPath = './backup-analysis/content-comparison-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };