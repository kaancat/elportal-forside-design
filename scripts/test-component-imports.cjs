// Test if component files can be imported
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Component Imports\n');
console.log('='.repeat(60));

const componentsDir = path.join(__dirname, '../src/components');
const componentsToTest = [
  'RegionalComparison.tsx',
  'PricingComparison.tsx', 
  'DailyPriceTimeline.tsx',
  'InfoCardsSection.tsx'
];

console.log('\n📁 Checking component files exist:');
componentsToTest.forEach(comp => {
  const filePath = path.join(componentsDir, comp);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${comp}`);
  
  if (exists) {
    // Check file size
    const stats = fs.statSync(filePath);
    console.log(`      Size: ${stats.size} bytes`);
    
    // Check for export default
    const content = fs.readFileSync(filePath, 'utf8');
    const hasDefaultExport = content.includes('export default');
    console.log(`      Default export: ${hasDefaultExport ? '✅' : '❌'}`);
    
    // Check for syntax errors by looking for common patterns
    const hasReactImport = content.includes("import React") || content.includes("from 'react'");
    console.log(`      React import: ${hasReactImport ? '✅' : '❌'}`);
  }
});

// Check ContentBlocks.tsx
console.log('\n\n📄 Checking ContentBlocks.tsx:');
const contentBlocksPath = path.join(componentsDir, 'ContentBlocks.tsx');
const contentBlocks = fs.readFileSync(contentBlocksPath, 'utf8');

// Check imports
console.log('\n   Component imports:');
componentsToTest.forEach(comp => {
  const componentName = comp.replace('.tsx', '');
  const hasImport = contentBlocks.includes(`import ${componentName}`);
  console.log(`      ${hasImport ? '✅' : '❌'} import ${componentName}`);
});

// Check if statements
console.log('\n   Component conditions:');
const componentTypes = ['regionalComparison', 'pricingComparison', 'dailyPriceTimeline', 'infoCardsSection'];
componentTypes.forEach(type => {
  const hasCondition = contentBlocks.includes(`block._type === '${type}'`);
  console.log(`      ${hasCondition ? '✅' : '❌'} Handles ${type}`);
});

// Check for any obvious issues
console.log('\n\n🔍 Checking for common issues:');

// Check if components are wrapped in error boundaries
componentsToTest.forEach(comp => {
  const filePath = path.join(componentsDir, comp);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for console.log that might help debug
    if (content.includes('console.log') || content.includes('console.error')) {
      console.log(`   ⚠️  ${comp} contains console statements`);
    }
    
    // Check for try-catch
    if (!content.includes('try') && !content.includes('catch')) {
      console.log(`   ⚠️  ${comp} has no error handling`);
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Import test complete!\n');