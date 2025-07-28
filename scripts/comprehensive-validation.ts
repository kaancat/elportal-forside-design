import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

interface ValidationIssue {
  pageId: string;
  pageTitle: string;
  sectionKey: string;
  sectionType: string;
  issue: string;
  severity: 'error' | 'warning';
  fix: string;
}

async function comprehensiveValidation() {
  console.log('🔍 Running comprehensive validation for ElPortal pages...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const issues: ValidationIssue[] = [];
  
  try {
    // Get all pages
    const pages = await client.fetch(`*[_type == 'page']{
      _id,
      title,
      slug,
      contentBlocks[]{
        _key,
        _type,
        ...
      }
    }`);
    
    console.log(`📄 Scanning ${pages.length} pages...\n`);
    
    for (const page of pages) {
      console.log(`📖 Checking: ${page.title}`);
      
      for (const block of page.contentBlocks || []) {
        // Check FAQ Groups
        if (block._type === 'faqGroup') {
          console.log(`  📋 FAQ Section: ${block.title || 'Untitled'}`);
          
          if (!block.title) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'faqGroup',
              issue: 'Missing required title field',
              severity: 'error',
              fix: 'Add a title to the FAQ section'
            });
          }
          
          if (!block.faqItems || !Array.isArray(block.faqItems)) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'faqGroup',
              issue: 'Missing or invalid faqItems array',
              severity: 'error',
              fix: 'Add FAQ items as inline objects'
            });
          } else if (block.faqItems.length === 0) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'faqGroup',
              issue: 'faqItems array is empty (minimum 1 required)',
              severity: 'error',
              fix: 'Add at least one FAQ item'
            });
          } else {
            // Check each FAQ item
            block.faqItems.forEach((item: any, index: number) => {
              if (item._type === 'reference') {
                issues.push({
                  pageId: page._id,
                  pageTitle: page.title,
                  sectionKey: block._key,
                  sectionType: 'faqGroup',
                  issue: `FAQ item ${index + 1} is a REFERENCE instead of inline object`,
                  severity: 'error',
                  fix: 'Delete reference and add as inline FAQ item'
                });
              }
              
              if (!item.question) {
                issues.push({
                  pageId: page._id,
                  pageTitle: page.title,
                  sectionKey: block._key,
                  sectionType: 'faqGroup',
                  issue: `FAQ item ${index + 1} missing question`,
                  severity: 'error',
                  fix: 'Add question text'
                });
              }
              
              if (!item.answer || !Array.isArray(item.answer)) {
                issues.push({
                  pageId: page._id,
                  pageTitle: page.title,
                  sectionKey: block._key,
                  sectionType: 'faqGroup',
                  issue: `FAQ item ${index + 1} missing or invalid answer`,
                  severity: 'error',
                  fix: 'Add answer as rich text blocks'
                });
              }
            });
          }
        }
        
        // Check Info Cards Section
        if (block._type === 'infoCardsSection') {
          console.log(`  📱 Info Cards: ${block.title || 'Untitled'}`);
          
          if (block.cards) {
            block.cards.forEach((card: any, index: number) => {
              if (card.icon && typeof card.icon === 'object' && card.icon._type === 'iconPicker') {
                issues.push({
                  pageId: page._id,
                  pageTitle: page.title,
                  sectionKey: block._key,
                  sectionType: 'infoCardsSection',
                  issue: `Card ${index + 1} uses iconPicker object instead of simple string`,
                  severity: 'error',
                  fix: `Change icon to simple string like "clock", "info", etc.`
                });
              }
            });
          }
        }
        
        // Check Value Proposition
        if (block._type === 'valueProposition') {
          console.log(`  💎 Value Prop: ${block.title || 'Untitled'}`);
          
          if (block.items) {
            block.items.forEach((item: any, index: number) => {
              if (item.icon && typeof item.icon === 'object' && item.icon._type === 'iconPicker') {
                issues.push({
                  pageId: page._id,
                  pageTitle: page.title,
                  sectionKey: block._key,
                  sectionType: 'valueProposition',
                  issue: `Value item ${index + 1} uses iconPicker but schema expects icon.manager`,
                  severity: 'error',
                  fix: 'Convert to proper icon.manager format or update schema'
                });
              }
            });
          }
        }
        
        // Check Call to Action
        if (block._type === 'callToActionSection') {
          console.log(`  🎯 CTA: ${block.title || 'Untitled'}`);
          
          if (!block.title) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'callToActionSection',
              issue: 'Missing required title field',
              severity: 'error',
              fix: 'Add CTA title'
            });
          }
          
          if (!block.buttonText) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'callToActionSection',
              issue: 'Missing required buttonText field',
              severity: 'error',
              fix: 'Add button text'
            });
          }
          
          if (!block.buttonUrl) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'callToActionSection',
              issue: 'Missing required buttonUrl field',
              severity: 'error',
              fix: 'Add button URL'
            });
          }
        }
        
        // Check Page Sections
        if (block._type === 'pageSection') {
          if (!block.headerAlignment) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: block._key,
              sectionType: 'pageSection',
              issue: 'Missing headerAlignment field',
              severity: 'warning',
              fix: 'Set headerAlignment to "left", "center", or "right"'
            });
          }
        }
      }
    }
    
    // Report results
    console.log('\n📊 Validation Results');
    console.log('═══════════════════════');
    
    if (issues.length === 0) {
      console.log('✅ No validation issues found! All pages are properly configured.');
      return;
    }
    
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    
    console.log(`❌ Found ${errors.length} errors and ${warnings.length} warnings\n`);
    
    // Group by page and severity
    const criticalIssues = issues.filter(i => 
      i.issue.includes('REFERENCE') || 
      i.issue.includes('iconPicker') ||
      i.issue.includes('Missing required')
    );
    
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Fix immediately):');
      console.log('═══════════════════════════════════════');
      
      const criticalByPage = criticalIssues.reduce((acc, issue) => {
        if (!acc[issue.pageTitle]) acc[issue.pageTitle] = [];
        acc[issue.pageTitle].push(issue);
        return acc;
      }, {} as Record<string, ValidationIssue[]>);
      
      Object.entries(criticalByPage).forEach(([pageTitle, pageIssues]) => {
        console.log(`\n📄 ${pageTitle}:`);
        pageIssues.forEach(issue => {
          console.log(`  ❌ ${issue.issue}`);
          console.log(`     🔧 Fix: ${issue.fix}`);
        });
      });
    }
    
    // All issues by page
    console.log('\n📋 All Issues by Page:');
    console.log('═══════════════════════');
    
    const issuesByPage = issues.reduce((acc, issue) => {
      if (!acc[issue.pageTitle]) acc[issue.pageTitle] = [];
      acc[issue.pageTitle].push(issue);
      return acc;
    }, {} as Record<string, ValidationIssue[]>);
    
    Object.entries(issuesByPage).forEach(([pageTitle, pageIssues]) => {
      console.log(`\n📄 ${pageTitle}:`);
      pageIssues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} [${issue.sectionType}] ${issue.issue}`);
      });
    });
    
    console.log('\n🛠️ Next Steps:');
    console.log('1. Fix critical issues first (references, icon formats, required fields)');
    console.log('2. Go to Sanity Studio and make the suggested fixes');
    console.log('3. Run this validation again to confirm fixes');
    console.log('4. For FAQ reference issues, see docs/FAQ-VALIDATION-PREVENTION.md');
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

comprehensiveValidation();