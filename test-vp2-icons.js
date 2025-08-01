// Test hasValidIcon function with ValueProposition 2 data
function hasValidIcon(iconData) {
  // This is the exact function from Icon.tsx
  return !!iconData && (!!iconData.svg || !!iconData.icon || (!!iconData.metadata && !!(iconData.metadata.inlineSvg || iconData.metadata.url)));
}

function testIconComponent(iconData) {
  const icon = iconData;
  
  console.log('🧪 Testing Icon Component with VP2 data:');
  console.log('Icon data:', {
    hasIcon: !!icon,
    hasSvg: !!icon?.svg,
    hasIconString: !!icon?.icon,
    hasMetadata: !!icon?.metadata,
    metadataUrl: icon?.metadata?.url,
    hasInlineSvg: !!icon?.metadata?.inlineSvg
  });

  // First check: SVG without placeholder
  if (icon?.svg && !icon.svg.includes('Placeholder SVG')) {
    console.log('✅ Would render: Direct SVG (non-placeholder)');
    return 'direct-svg';
  } else if (icon?.svg) {
    console.log('⚠️  SVG contains placeholder, skipping to next check');
  } else {
    console.log('ℹ️  No SVG field at all');
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

  // Test hasValidIcon
  const isValid = hasValidIcon(icon);
  console.log(`🔍 hasValidIcon result: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

  return 'fallback';
}

// Test with actual ValueProposition 2 data
const vp2Icons = [
  {
    _type: 'icon.manager',
    icon: 'heroicons:check-badge',
    // NO SVG FIELD - this is the key difference!
    metadata: {
      url: 'https://api.iconify.design/heroicons:check-badge.svg?width=20&height=20&color=%2384db41',
      iconName: 'check-badge',
      inlineSvg: null
    }
  },
  {
    _type: 'icon.manager', 
    icon: 'material-symbols-light:refresh',
    // NO SVG FIELD
    metadata: {
      url: 'https://api.iconify.design/material-symbols-light:refresh.svg?width=20&height=20&color=%2384db41',
      iconName: 'refresh',
      inlineSvg: null
    }
  }
];

console.log('Testing ValueProposition 2 Icons (No SVG Field)\n');
console.log('='.repeat(60));

vp2Icons.forEach((icon, index) => {
  console.log(`\n📝 VP2 Icon ${index + 1}: ${icon.metadata.iconName}`);
  console.log('-'.repeat(40));
  const result = testIconComponent(icon);
  console.log(`Final result: ${result}\n`);
});

console.log('🚨 ANALYSIS:');
console.log('The icons have NO svg field, so they should go directly to metadata URL.');
console.log('The hasValidIcon function should return true because:');
console.log('- iconData exists ✅');
console.log('- iconData.icon exists ✅'); 
console.log('- iconData.metadata.url exists ✅');
console.log('');
console.log('If hasValidIcon returns true but icons still don\'t show,');
console.log('the issue is in the Icon component\'s rendering logic.');