// Test the FINAL Icon component logic
function testFinalIconLogic(iconData) {
  const icon = iconData;
  
  console.log('🧪 Testing FINAL Icon Component Logic:');
  console.log('Icon data:', {
    hasIcon: !!icon,
    hasSvg: !!icon?.svg,
    svgContainsPlaceholder: icon?.svg?.includes('Placeholder SVG'),
    hasMetadata: !!icon?.metadata,
    metadataUrl: icon?.metadata?.url,
    hasInlineSvg: !!icon?.metadata?.inlineSvg,
    iconString: icon?.icon
  });

  // Early return for no icon data
  if (!icon) {
    console.log('✅ Would render: Fallback (no icon data)');
    return 'fallback-no-icon';
  }

  // Priority 1: Non-placeholder SVG (highest quality)
  if (icon.svg && !icon.svg.includes('Placeholder SVG')) {
    console.log('✅ Would render: Direct SVG (non-placeholder)');
    return 'direct-svg';
  } else if (icon.svg) {
    console.log('⚠️  SVG contains placeholder, checking next priority');
  } else {
    console.log('ℹ️  No SVG field');
  }

  // Priority 2: Metadata URL (works for both VP1 and VP2)
  if (icon.metadata?.url) {
    console.log('✅ Would render: Metadata URL img');
    console.log('   URL:', icon.metadata.url);
    return 'metadata-url';
  } else {
    console.log('❌ No metadata URL');
  }

  // Priority 3: Inline SVG from metadata
  if (icon.metadata?.inlineSvg) {
    console.log('✅ Would render: Inline SVG from metadata');
    return 'inline-svg';
  } else {
    console.log('❌ No inline SVG');
  }

  // Priority 4: Generate URL from icon string (legacy fallback)
  if (icon.icon) {
    console.log('✅ Would render: Generated URL from icon string');
    return 'generated-url';
  } else {
    console.log('❌ No icon string');
  }

  // Final fallback
  console.log('✅ Would render: Final fallback');
  return 'final-fallback';
}

// Test with both VP1 and VP2 data
const testCases = [
  {
    name: 'VP1 Icon (with placeholder SVG)',
    data: {
      _type: 'icon.manager',
      icon: 'material-symbols:bolt-outline',
      svg: '<svg width="32" height="32" viewBox="0 0 32 32" fill="#10b981"><!-- Placeholder SVG --></svg>',
      metadata: {
        url: 'https://api.iconify.design/material-symbols:bolt-outline.svg?width=20&height=20&color=%2384db41',
        iconName: 'bolt-outline'
      }
    }
  },
  {
    name: 'VP2 Icon (no SVG field)',
    data: {
      _type: 'icon.manager',
      icon: 'heroicons:check-badge',
      // NO SVG FIELD
      metadata: {
        url: 'https://api.iconify.design/heroicons:check-badge.svg?width=20&height=20&color=%2384db41',
        iconName: 'check-badge'
      }
    }
  }
];

console.log('Testing FINAL Icon Component Logic\n');
console.log('='.repeat(80));

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test Case ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(50));
  const result = testFinalIconLogic(testCase.data);
  console.log(`Final result: ${result}\n`);
});

console.log('🎯 EXPECTED RESULTS:');
console.log('- VP1 Icon: Should render via "metadata-url" (placeholder SVG skipped)');
console.log('- VP2 Icon: Should render via "metadata-url" (no SVG field, direct to metadata)');
console.log('');
console.log('Both should now work correctly! 🚀');