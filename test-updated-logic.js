// Test the UPDATED logic from Icon component
function testUpdatedIconLogic(iconData) {
  const icon = iconData;
  
  console.log('🧪 Testing UPDATED Icon Component Logic:');
  console.log('Icon data:', {
    hasIcon: !!icon,
    hasSvg: !!icon?.svg,
    svgContainsPlaceholder: icon?.svg?.includes('Placeholder SVG'),
    hasMetadata: !!icon?.metadata,
    metadataUrl: icon?.metadata?.url,
    hasInlineSvg: !!icon?.metadata?.inlineSvg,
    iconString: icon?.icon
  });

  // First check: SVG without placeholder
  if (icon?.svg && !icon.svg.includes('Placeholder SVG')) {
    console.log('✅ Would render: Direct SVG (non-placeholder)');
    return 'direct-svg';
  } else if (icon?.svg) {
    console.log('⚠️  SVG contains placeholder, skipping to next check');
  }

  // Second check: Metadata URL
  if (icon?.metadata?.url) {
    console.log('✅ Would render: Metadata URL img');
    console.log('   URL:', icon.metadata.url);
    return 'metadata-url';
  } else {
    console.log('❌ No metadata URL found');
  }

  // Third check: Legacy icon string
  if (icon?.icon && !icon.metadata?.url) {
    console.log('✅ Would render: Generated URL from icon string');
    return 'generated-url';
  }

  // Fourth check: Inline SVG (moved up)
  if (icon?.metadata?.inlineSvg) {
    console.log('✅ Would render: Inline SVG from metadata');
    return 'inline-svg';
  } else {
    console.log('❌ No inline SVG in metadata');
  }

  // Fifth check: No icon data
  if (!icon || (!icon.svg && !icon.metadata?.url && !icon.icon)) {
    console.log('✅ Would render: Fallback icon');
    return 'fallback';
  }

  // Final fallback
  console.log('✅ Would render: Final fallback');
  return 'final-fallback';
}

// Test with actual data from our API test
const testIcons = [
  {
    _type: 'icon.manager',
    icon: 'solar:chart-bold',
    svg: '<svg width="32" height="32" viewBox="0 0 32 32" fill="#10b981"><!-- Placeholder SVG --></svg>',
    metadata: {
      url: 'https://api.iconify.design/solar:chart-bold.svg?width=20&height=20&color=%2384db41',
      iconName: 'chart-bold',
      inlineSvg: null // Missing according to our test
    }
  }
];

console.log('Testing UPDATED Icon Component Logic\n');
console.log('='.repeat(60));

testIcons.forEach((icon, index) => {
  console.log(`\n📝 Icon ${index + 1}: ${icon.metadata.iconName}`);
  console.log('-'.repeat(40));
  const result = testUpdatedIconLogic(icon);
  console.log(`Final result: ${result}\n`);
});

console.log('🚨 CRITICAL ANALYSIS:');
console.log('The icon should follow "metadata-url" path and render as <img> tag.');
console.log('If it\'s still not working, the issue is likely:');
console.log('1. React dev vs prod build differences');
console.log('2. Browser caching issues');
console.log('3. Network policy blocking external images');
console.log('4. CSS issues hiding the images');
console.log('');
console.log('Next step: Check browser dev tools on the live site for:');
console.log('- Console errors');
console.log('- Network tab to see if images are loading');
console.log('- Elements tab to see if img tags are present');