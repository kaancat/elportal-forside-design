/**
 * Icon Structure Validation Helper (JavaScript version)
 * 
 * Use this script to validate icon structure before saving to Sanity
 * Run: node scripts/validate-icon-structure.js
 */

function validateIconStructure(icon) {
  const errors = [];
  const warnings = [];

  // Check if icon exists
  if (!icon) {
    errors.push('Icon object is null or undefined');
    return { isValid: false, errors, warnings };
  }

  // Check _type
  if (icon._type !== 'icon.manager') {
    errors.push(`Invalid _type: expected 'icon.manager', got '${icon._type}'`);
  }

  // Check metadata
  if (!icon.metadata) {
    errors.push('Missing required metadata object');
    return { isValid: errors.length === 0, errors, warnings };
  }

  // Check critical metadata.size structure
  if (!icon.metadata.size) {
    errors.push('Missing required metadata.size object');
  } else {
    if (typeof icon.metadata.size.width !== 'number') {
      errors.push('metadata.size.width must be a number');
    }
    if (typeof icon.metadata.size.height !== 'number') {
      errors.push('metadata.size.height must be a number');
    }
  }

  // Check for direct width/height (common mistake)
  if ('width' in icon.metadata || 'height' in icon.metadata) {
    errors.push('Found direct width/height in metadata - must use size object instead');
  }

  // Check iconName
  if (!icon.metadata.iconName) {
    errors.push('Missing required metadata.iconName');
  }

  // Check color structure if present
  if (icon.metadata.color) {
    if (!icon.metadata.color.hex) {
      errors.push('metadata.color.hex is required when color is set');
    }
    if (!icon.metadata.color.rgba) {
      errors.push('metadata.color.rgba object is required when color is set');
    } else {
      const rgba = icon.metadata.color.rgba;
      if (typeof rgba.r !== 'number' || typeof rgba.g !== 'number' || 
          typeof rgba.b !== 'number' || typeof rgba.a !== 'number') {
        errors.push('metadata.color.rgba must have numeric r, g, b, a properties');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Test with real-world example
console.log('🔍 Icon Structure Validator\n');

// Example of a broken icon (like what we had)
const brokenIcon = {
  _type: 'icon.manager',
  metadata: {
    color: { hex: '#a5e96d', rgba: { r: 165, g: 233, b: 109, a: 1 } },
    width: 24,  // ❌ Direct property
    height: 24, // ❌ Direct property
    // Missing iconName
    // Missing size object
  }
};

console.log('Testing broken icon structure:');
const result1 = validateIconStructure(brokenIcon);
console.log('Valid:', result1.isValid);
console.log('Errors:', result1.errors);

console.log('\n' + '='.repeat(50) + '\n');

// Example of a correct icon
const correctIcon = {
  _type: 'icon.manager',
  icon: 'lucide:sun',
  metadata: {
    iconName: 'sun',
    provider: 'lucide',
    size: { width: 24, height: 24 }, // ✅ Proper size object
    hFlip: false,
    vFlip: false,
    rotate: 0,
    color: {
      hex: '#a5e96d',
      rgba: { r: 165, g: 233, b: 109, a: 1 }
    }
  }
};

console.log('Testing correct icon structure:');
const result2 = validateIconStructure(correctIcon);
console.log('Valid:', result2.isValid);
console.log('Errors:', result2.errors);

// Export for use in other scripts (ES module)
export { validateIconStructure };