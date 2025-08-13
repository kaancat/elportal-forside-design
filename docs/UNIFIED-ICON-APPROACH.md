# Unified Icon Approach for DinElportal

## Overview

DinElportal has standardized on using `sanity-plugin-icon-manager` v1.5.2 for all icon management across the platform. This document outlines the unified approach, migration details, and best practices.

## Icon Data Structure

All icons in DinElportal must follow this exact structure:

```typescript
{
  _type: 'icon.manager',
  icon: 'provider:icon-name',    // e.g., 'lucide:shield'
  metadata: {
    iconName: string,            // e.g., 'shield' (REQUIRED)
    collectionId: string,        // e.g., 'lucide' (REQUIRED)
    collectionName: string,      // e.g., 'Lucide' (REQUIRED)
    size: {                      // REQUIRED OBJECT
      width: number,             // e.g., 24
      height: number             // e.g., 24
    },
    hFlip: boolean,              // Default: false
    vFlip: boolean,              // Default: false
    rotate: 0 | 1 | 2 | 3,       // Default: 0
    color?: {                    // Optional color customization
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

## Migration History

### Previous Icon Implementations
1. **String Icons**: Simple strings like "shield", "clock", "trending-up"
2. **IconPicker Plugin**: Used `_type: "iconPicker"` with different structure
3. **Malformed icon.manager**: Missing required fields or incorrect structure

### Migration Completed (August 2025)
- ✅ 68 icons successfully migrated to unified format
- ✅ All string icons converted to proper icon.manager objects
- ✅ All iconPicker types converted
- ✅ All malformed structures fixed

## Component-Specific Implementations

### InfoCardsSection
InfoCardsSection uses additional styling fields that work alongside the icon:

```typescript
{
  icon: IconManagerType,        // Standard icon.manager object
  iconColor: string,            // Tailwind text color class (e.g., 'text-green-600')
  bgColor: string               // Tailwind bg color class (e.g., 'bg-green-50')
}
```

**Important**: These fields control the card's visual design, not the icon's internal color. They create the colored container box and apply text color classes.

### ValueProposition & FeatureList
These components use only the standard icon.manager structure. Colors should be customized through the icon picker's built-in color selection.

## Best Practices

### ✅ DO:
1. **Always use the icon picker UI** in Sanity Studio
2. **Select from Lucide icons** for consistency
3. **Use the color picker** for icon color customization
4. **Let the plugin generate metadata** automatically
5. **Test in Sanity Studio first** - if it works there, it works everywhere

### ❌ DON'T:
1. **Never create icon objects manually** in code
2. **Never modify icon metadata via API** (except migrations)
3. **Never use direct width/height** properties
4. **Never add colors programmatically**
5. **Never store icons as strings**

## Color Management

### Icon Colors (via Icon Manager)
- Use the plugin's color picker
- Custom palette available:
  - DinElportal Green (#84db41)
  - DinElportal Light Green (#a5e96d)
  - DinElportal Dark Green (#6bc52d)
  - DinElportal Dark (#001a12)
  - DinElportal Dark Light (#002a1f)

### Container Styling (InfoCardsSection only)
- `iconColor`: Controls the CSS text color class
- `bgColor`: Controls the background color of the icon container
- These are Tailwind classes, not icon properties

## Frontend Implementation

All frontend components should use the unified `Icon` component:

```typescript
import { Icon } from '@/components/Icon'

<Icon 
  icon={iconData}
  size={24}
  className="optional-classes"
/>
```

The Icon component handles:
- Multiple fallback strategies
- Development warnings for malformed icons
- Proper rendering of all icon.manager structures

## Validation

Use the validation script to ensure icons are properly formatted:

```bash
npm run icon:validate
```

Or check specific icons programmatically:

```typescript
import { validateIconStructure } from '@/scripts/validate-icon-structure'

const result = validateIconStructure(iconData)
if (!result.isValid) {
  console.error('Icon validation failed:', result.errors)
}
```

## Common Issues & Solutions

### "Cannot read properties of undefined (reading 'width')"
**Cause**: Missing `metadata.size` object
**Solution**: Icons must have `metadata.size.width` and `metadata.size.height`

### Icons work in frontend but not in Sanity Studio
**Cause**: Frontend has fallbacks, Studio has strict validation
**Solution**: Ensure icons follow the exact structure above

### Color changes not applying
**Cause**: Manual color manipulation or missing rgba structure
**Solution**: Use the icon picker's color selection UI

## Migration Scripts

### Unify All Icons
Located at: `scripts/unify-all-icons.ts`
- Converts string icons to icon.manager
- Fixes iconPicker types
- Repairs malformed structures

### Validate Icons
Located at: `scripts/validate-icon-structure.ts`
- Checks all icons for proper structure
- Reports validation errors
- Can fix common issues

## Future Considerations

1. **Consistency**: All new components must use icon.manager
2. **No Legacy Support**: Don't add fallbacks for old formats
3. **Documentation**: Update when adding new icon-using components
4. **Testing**: Always validate after bulk operations