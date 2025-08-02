/**
 * Icon Structure Validation Helper
 * 
 * Use this script to validate icon structure before saving to Sanity
 * This prevents "Cannot read properties of undefined" errors in Sanity Studio
 */

interface IconManagerType {
  _type: string;
  icon?: string;
  svg?: string;
  metadata?: {
    iconName?: string;
    provider?: string;
    collectionId?: string;
    size?: {
      width: number;
      height: number;
    };
    hFlip?: boolean;
    vFlip?: boolean;
    rotate?: number;
    color?: {
      hex: string;
      rgba: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    };
    [key: string]: any;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateIconStructure(icon: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  // Check boolean flags
  if (icon.metadata.hFlip !== undefined && typeof icon.metadata.hFlip !== 'boolean') {
    warnings.push('metadata.hFlip should be boolean');
  }
  if (icon.metadata.vFlip !== undefined && typeof icon.metadata.vFlip !== 'boolean') {
    warnings.push('metadata.vFlip should be boolean');
  }

  // Check rotate value
  if (icon.metadata.rotate !== undefined && ![0, 1, 2, 3].includes(icon.metadata.rotate)) {
    warnings.push('metadata.rotate should be 0, 1, 2, or 3');
  }

  // Warnings for best practices
  if (!icon.icon && !icon.svg) {
    warnings.push('Icon should have either icon string or svg content');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Helper to create a safe icon structure
export function createSafeIconStructure(
  provider: string, 
  iconName: string,
  size = { width: 24, height: 24 }
): IconManagerType {
  return {
    _type: 'icon.manager',
    icon: `${provider}:${iconName}`,
    metadata: {
      iconName,
      provider,
      size,
      hFlip: false,
      vFlip: false,
      rotate: 0
    }
  };
}

// Fix common issues in icon structure
export function fixIconStructure(icon: any): IconManagerType | null {
  if (!icon) return null;

  const fixed: IconManagerType = {
    _type: 'icon.manager',
    icon: icon.icon,
    svg: icon.svg,
    metadata: {
      ...icon.metadata
    }
  };

  // Ensure metadata exists
  if (!fixed.metadata) {
    fixed.metadata = {};
  }

  // Fix size structure
  if (icon.metadata?.width && icon.metadata?.height && !icon.metadata?.size) {
    fixed.metadata.size = {
      width: icon.metadata.width,
      height: icon.metadata.height
    };
    // Remove direct properties
    delete fixed.metadata.width;
    delete fixed.metadata.height;
  }

  // Ensure required fields
  if (!fixed.metadata.iconName && icon.icon) {
    // Extract icon name from icon string
    const parts = icon.icon.split(':');
    fixed.metadata.iconName = parts[1] || parts[0];
  }

  // Set defaults for boolean flags
  fixed.metadata.hFlip = fixed.metadata.hFlip ?? false;
  fixed.metadata.vFlip = fixed.metadata.vFlip ?? false;
  fixed.metadata.rotate = fixed.metadata.rotate ?? 0;

  return fixed;
}

// Example usage
if (require.main === module) {
  // Test cases
  const testIcons = [
    // Valid icon
    {
      _type: 'icon.manager',
      icon: 'lucide:sun',
      metadata: {
        iconName: 'sun',
        size: { width: 24, height: 24 },
        hFlip: false,
        vFlip: false,
        rotate: 0
      }
    },
    // Invalid icon with direct width/height
    {
      _type: 'icon.manager',
      metadata: {
        width: 24,
        height: 24
      }
    },
    // Invalid icon with string color
    {
      _type: 'icon.manager',
      metadata: {
        size: { width: 24, height: 24 },
        color: '#84db41'
      }
    }
  ];

  testIcons.forEach((icon, index) => {
    console.log(`\n--- Test Case ${index + 1} ---`);
    const result = validateIconStructure(icon);
    console.log('Valid:', result.isValid);
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings);
    }
    
    if (!result.isValid) {
      const fixed = fixIconStructure(icon);
      console.log('Fixed structure:', JSON.stringify(fixed, null, 2));
    }
  });
}