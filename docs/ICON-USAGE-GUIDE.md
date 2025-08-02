# Icon Usage Guide for ElPortal

## Overview
ElPortal uses the `sanity-plugin-icon-manager` for managing icons with a sophisticated fallback system to ensure icons always display correctly.

## Icon Structure
All icons must follow this structure:

```typescript
{
  _type: 'icon.manager',
  icon: 'collection:icon-name',  // e.g., 'lucide:sun'
  svg?: string,                  // Optional direct SVG content
  metadata?: {
    collectionId: string,        // e.g., 'lucide'
    collectionName: string,      // e.g., 'Lucide'
    icon: string,                // e.g., 'sun'
    iconName: string,            // e.g., 'Sun'
    url: string,                 // Pre-generated URL with color
    inlineSvg?: string,          // Optional inline SVG
    size?: {
      width: number,
      height: number
    }
  }
}
```

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
- Default color: ElPortal green `#84db41`
- Colors are encoded in URLs: `?color=%2384db41`
- Component accepts optional `color` prop for overrides

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

## Adding Icons in Sanity Studio
1. Click the icon picker in any icon field
2. Search for your desired icon
3. Select from results - metadata is auto-generated
4. The plugin handles URL generation with proper colors

## Troubleshooting

### Icons Not Displaying
1. Check browser console for errors
2. Verify the icon has either:
   - Valid `metadata.url`
   - Valid `svg` content
   - Valid `icon` string for legacy fallback
3. Ensure color encoding is correct (`%23` for `#`)

### VP2 Icon Issues
Some icons (ValueProposition v2) have broken SVG but valid metadata URLs. The component automatically handles this by prioritizing metadata URL over direct SVG when both exist.

### Finding Icon Names
- Lucide: https://lucide.dev/icons
- Iconify: https://icon-sets.iconify.design/
- Material Design: https://pictogrammers.com/library/mdi/

## Best Practices
1. **Let Sanity generate metadata** - Don't manually create icon objects
2. **Use Lucide icons** for consistency
3. **Test icon display** before deploying
4. **Preload critical icons** for better performance
5. **Always include `_type: 'icon.manager'`** in icon objects