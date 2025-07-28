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
  issue: string;
  severity: 'error' | 'warning';
}

async function validateFAQStructure() {
  try {
    console.log('🔍 Scanning all pages for FAQ validation issues...');
    
    const pages = await client.fetch(`*[_type == 'page' && defined(contentBlocks[_type == 'faqGroup'])]{
      _id,
      title,
      slug,
      contentBlocks[_type == 'faqGroup']{
        _key,
        _type,
        title,
        faqItems
      }
    }`);
    
    console.log(`📄 Found ${pages.length} pages with FAQ sections`);
    
    const issues: ValidationIssue[] = [];
    
    for (const page of pages) {
      console.log(`\n📖 Checking page: ${page.title}`);
      
      for (const faqSection of page.contentBlocks) {
        console.log(`  📋 FAQ Section: ${faqSection.title}`);
        
        // Check if title is missing
        if (!faqSection.title) {
          issues.push({
            pageId: page._id,
            pageTitle: page.title,
            sectionKey: faqSection._key,
            issue: 'Missing required title field',
            severity: 'error'
          });
        }
        
        // Check if faqItems is missing or empty
        if (!faqSection.faqItems || !Array.isArray(faqSection.faqItems)) {
          issues.push({
            pageId: page._id,
            pageTitle: page.title,
            sectionKey: faqSection._key,
            issue: 'Missing or invalid faqItems array',
            severity: 'error'
          });
          continue;
        }
        
        if (faqSection.faqItems.length === 0) {
          issues.push({
            pageId: page._id,
            pageTitle: page.title,
            sectionKey: faqSection._key,
            issue: 'faqItems array is empty (minimum 1 required)',
            severity: 'error'
          });
          continue;
        }
        
        // Check each FAQ item
        faqSection.faqItems.forEach((item: any, index: number) => {
          const itemNum = index + 1;
          
          // Critical: Check if item is a reference instead of inline object
          if (item._type === 'reference') {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: faqSection._key,
              issue: `FAQ item ${itemNum} is a REFERENCE instead of inline object - this causes validation errors`,
              severity: 'error'
            });
          }
          
          // Check if item has proper _type
          if (!item._type || item._type !== 'faqItem') {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: faqSection._key,
              issue: `FAQ item ${itemNum} missing or incorrect _type (should be 'faqItem')`,
              severity: 'error'
            });
          }
          
          // Check if item has _key
          if (!item._key) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: faqSection._key,
              issue: `FAQ item ${itemNum} missing _key field`,
              severity: 'warning'
            });
          }
          
          // Check if question is missing
          if (!item.question) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: faqSection._key,
              issue: `FAQ item ${itemNum} missing required question field`,
              severity: 'error'
            });
          }
          
          // Check if answer is missing or invalid
          if (!item.answer) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: faqSection._key,
              issue: `FAQ item ${itemNum} missing required answer field`,
              severity: 'error'
            });
          } else if (!Array.isArray(item.answer)) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title,
              sectionKey: faqSection._key,
              issue: `FAQ item ${itemNum} answer should be an array of blocks`,
              severity: 'error'
            });
          }
        });
        
        console.log(`    ✅ Checked ${faqSection.faqItems.length} FAQ items`);
      }
    }
    
    // Report results
    console.log('\n📊 Validation Results');
    console.log('═══════════════════════');
    
    if (issues.length === 0) {
      console.log('✅ No validation issues found!');
      return;
    }
    
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    
    console.log(`❌ Found ${errors.length} errors and ${warnings.length} warnings`);
    
    // Group by page
    const issuesByPage = issues.reduce((acc, issue) => {
      if (!acc[issue.pageTitle]) {
        acc[issue.pageTitle] = [];
      }
      acc[issue.pageTitle].push(issue);
      return acc;
    }, {} as Record<string, ValidationIssue[]>);
    
    Object.entries(issuesByPage).forEach(([pageTitle, pageIssues]) => {
      console.log(`\n📄 ${pageTitle}:`);
      pageIssues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${issue.issue}`);
      });
    });
    
    // Provide specific fix instructions for reference issues
    const referenceIssues = errors.filter(i => i.issue.includes('REFERENCE'));
    if (referenceIssues.length > 0) {
      console.log('\n🛠️ CRITICAL: Reference Issues Found');
      console.log('════════════════════════════════════');
      console.log('The following pages have FAQ items as references instead of inline objects:');
      
      referenceIssues.forEach(issue => {
        console.log(`\n📄 ${issue.pageTitle}:`);
        console.log('  1. Go to Sanity Studio');
        console.log('  2. Open this page');
        console.log('  3. Find the FAQ section');
        console.log('  4. DELETE all reference-based FAQ items');
        console.log('  5. ADD new inline FAQ items (not references)');
        console.log('  6. Copy content from the referenced documents');
      });
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

// Export for use in other scripts
export { validateFAQStructure };

// Run the validation
validateFAQStructure();