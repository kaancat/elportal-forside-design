// Test the exact logic from Icon component with known data
function testIconLogic(iconData) {
  const icon = iconData;
  
  console.log('🧪 Testing Icon Component Logic:');
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

  // Fourth check: No icon data
  if (!icon || (!icon.svg && !icon.metadata?.url && !icon.icon)) {
    console.log('✅ Would render: Fallback icon');
    return 'fallback';
  }

  // Fifth check: Inline SVG (this might be causing issues)
  if (icon.metadata?.inlineSvg) {
    console.log('✅ Would render: Inline SVG from metadata');
    return 'inline-svg';
  } else {
    console.log('❌ No inline SVG in metadata');
  }

  // Final fallback: Metadata URL again (unreachable code?)
  console.log('✅ Would render: Final metadata URL fallback (unreachable?)');
  return 'final-metadata-url';
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
  },
  {
    _type: 'icon.manager',
    icon: 'streamline-ultimate:receipt-bold',
    svg: '<svg width="32" height="32" viewBox="0 0 32 32" fill="#3b82f6"><!-- Placeholder SVG --></svg>',
    metadata: {
      url: 'https://api.iconify.design/streamline-ultimate:receipt-bold.svg?width=20&height=20&color=%2384db41',
      iconName: 'receipt-bold',
      inlineSvg: null
    }
  }
];

console.log('Testing Icon Component Logic with Real Data\n');
console.log('='.repeat(60));

testIcons.forEach((icon, index) => {
  console.log(`\n📝 Icon ${index + 1}: ${icon.metadata.iconName}`);
  console.log('-'.repeat(40));
  const result = testIconLogic(icon);
  console.log(`Final result: ${result}\n`);
});

console.log('🔍 Analysis:');
console.log('All icons should follow the "metadata-url" path.');
console.log('If they\'re not showing, there might be an issue with:');
console.log('1. The img tag rendering');
console.log('2. The URL format');
console.log('3. CORS/network issues');
console.log('4. CSS styling hiding the images');