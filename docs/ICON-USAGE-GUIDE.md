# Icon Usage Guide for ElPortal

> **📌 Important**: For the complete unified icon approach including migration details and component-specific implementations, see [UNIFIED-ICON-APPROACH.md](./UNIFIED-ICON-APPROACH.md)

## Overview
ElPortal uses the `sanity-plugin-icon-manager` v1.5.2 for managing icons. This guide provides accurate information about the plugin's requirements and best practices to prevent validation errors.

## ⚠️ Critical Requirements

The icon manager plugin has strict validation requirements. Failure to follow these will result in "Cannot read properties of undefined" errors in Sanity Studio.

## Icon Structure

### Required Structure (As per Plugin v1.5.2)
```typescript
{
  _type: 'icon.manager',
  icon: 'provider:icon-name',    // e.g., 'lucide:sun'
  svg?: string,                  // SVG content (optional)
  metadata: {
    iconName: string,            // e.g., 'sun' (REQUIRED)
    provider?: string,           // e.g., 'lucide'
    collectionId?: string,       // e.g., 'lucide'
    collectionName?: string,     // e.g., 'Lucide'
    url?: string,                // Generated URL
    downloadUrl?: string,        // Download URL
    inlineSvg?: string,          // Inline SVG
    size: {                      // REQUIRED OBJECT
      width: number,             // e.g., 24
      height: number             // e.g., 24
    },
    hFlip: boolean,              // Default: false
    vFlip: boolean,              // Default: false
    rotate: 0 | 1 | 2 | 3,       // Default: 0
    color?: {                    // Optional color object
      hex: string,               // e.g., '#84db41'
      rgba: {
        r: number,
        g: number,
        b: number,
        a: number
      }
    }
  }
}
```

### ❌ Common Mistakes That Break Validation
1. **Missing size object**: Having `metadata.width` instead of `metadata.size.width`
2. **Manual color manipulation**: Adding color without proper rgba structure
3. **Missing required fields**: iconName is required
4. **Direct property access**: The plugin expects nested structure

## Icon Display Priority System

The Icon component uses a sophisticated fallback system to ensure reliability:

1. **Priority 1: Direct SVG** (if not placeholder and no metadata URL)
   - Uses the `svg` field directly
   - Skipped if metadata URL exists (VP2 icon fix)

2. **Priority 2: Metadata URL** (most reliable)
   - Uses pre-generated URL from `metadata.url`
   - Works for both VP1 and VP2 icon formats

3. **Priority 3: Inline SVG from metadata**
   - Uses `metadata.inlineSvg` if available

4. **Priority 4: Generated URL** (legacy fallback)
   - Constructs URL from `icon` string: `https://api.iconify.design/${icon}.svg`
   - Applies default color if not specified

5. **Final Fallback**
   - Shows HelpCircle icon or custom fallback

## Available Icon Collections

### Lucide Icons (Recommended)
- Collection ID: `lucide`
- Examples: `flower`, `sun`, `leaf`, `snowflake`, `zap`, `home`, `check-circle`

### Material Design Icons
- Collection ID: `mdi`
- Examples: `home`, `menu`, `close`, `arrow-right`

### Tabler Icons
- Collection ID: `tabler`
- Examples: `bolt`, `sun`, `moon`, `star`

## Color Handling

### ✅ Correct Way: Use Icon Manager's Color Picker
1. In Sanity Studio, click on the icon field
2. Select your icon from the picker
3. Use the built-in color picker to select from:
   - ElPortal Green (#84db41)
   - ElPortal Light Green (#a5e96d)
   - ElPortal Dark Green (#6bc52d)
   - Other custom palette colors
4. The plugin generates proper URLs with color parameters

### ❌ Never Do This:
```javascript
// DON'T manually add color to metadata
icon.metadata.color = '#a5e96d'  // This breaks validation!

// DON'T modify color without rgba structure
icon.metadata.color = { hex: '#a5e96d' }  // Missing rgba!
```

## Common ElPortal Icons

### Energy/Electricity
- `lucide:zap` - Lightning bolt
- `lucide:battery-charging` - Battery charging
- `lucide:sun` - Solar energy
- `tabler:wind` - Wind energy

### Money/Pricing
- `lucide:dollar-sign` - Currency
- `lucide:trending-down` - Price decrease
- `lucide:piggy-bank` - Savings
- `lucide:calculator` - Calculator

### Seasonal
- `lucide:flower` - Spring
- `lucide:sun` - Summer
- `lucide:leaf` - Autumn
- `lucide:snowflake` - Winter

## Usage in Components

```typescript
import { Icon } from '@/components/Icon'

// Basic usage
<Icon icon={iconData} size={24} />

// With custom color
<Icon icon={iconData} color="#ffffff" />

// With fallback
<Icon icon={iconData} fallbackIcon={<CustomIcon />} />

// Preload icons for performance
import { preloadIcons } from '@/components/Icon'
preloadIcons([icon1, icon2, icon3])
```

## Proper Icon Management Workflow

### Adding New Icons
1. **Always use Sanity Studio's UI** - Never create icon objects manually
2. Click the icon picker button in the icon field
3. Search for your desired icon (prefer Lucide for consistency)
4. Select the icon - the plugin auto-generates all required metadata
5. Use the color picker to select brand colors if needed
6. Save your changes

### Updating Icon Colors
1. **Never modify color via API or scripts**
2. In Sanity Studio, click the existing icon
3. Use the color picker to select a new color
4. The plugin updates all necessary fields correctly

### Programmatic Updates (When Absolutely Necessary)
If you must update icons via API:
```javascript
// Minimal structure that won't break validation
const safeIcon = {
  _type: 'icon.manager',
  icon: 'lucide:sun',
  metadata: {
    iconName: 'sun',
    size: { width: 24, height: 24 },
    hFlip: false,
    vFlip: false,
    rotate: 0
  }
}
// Then use Sanity Studio to properly configure
```

## Troubleshooting

### "Cannot read properties of undefined (reading 'width')" Error
**Cause**: The plugin expects `metadata.size.width` but finds `metadata.width` or missing size object
**Solution**: 
1. Icons must have `metadata.size` object, not direct width/height
2. Re-select icons through Sanity Studio UI to fix structure
3. Never manually modify metadata structure

### Icons Work in Frontend but Break in Sanity Studio
**Cause**: Frontend has fallbacks, but Sanity Studio has strict validation
**Solution**: Ensure icons follow the exact structure shown above

### Color Changes Not Working
**Cause**: Manual color manipulation breaks the plugin's expectations
**Solution**: Only use the plugin's color picker in Sanity Studio

### Icons Not Displaying
1. Check browser console for errors
2. Verify the icon has proper metadata structure
3. Ensure all required fields are present
4. Re-select the icon through Sanity Studio if needed

### Finding Icon Names
- Lucide (Recommended): https://lucide.dev/icons
- Iconify: https://icon-sets.iconify.design/
- Material Design: https://pictogrammers.com/library/mdi/

## Best Practices
1. **Let Sanity generate metadata** - Don't manually create icon objects
2. **Use Lucide icons** for consistency
3. **Test in Sanity Studio first** - If it works there, it will work everywhere
4. **Never modify metadata manually** - Always use the UI
5. **Keep the structure intact** - The plugin is very strict about validation

## Summary

The `sanity-plugin-icon-manager` requires:
- ✅ `metadata.size` object with width/height (NOT direct properties)
- ✅ `metadata.iconName` field
- ✅ Proper color structure with hex AND rgba when using colors
- ✅ All changes made through Sanity Studio UI

Never:
- ❌ Manually create or modify icon metadata
- ❌ Add colors via API/scripts
- ❌ Use direct width/height properties
- ❌ Skip required fields

This will prevent all "Cannot read properties of undefined" errors and ensure icons work correctly in both Sanity Studio and the frontend.