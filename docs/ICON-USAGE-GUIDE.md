# Icon Usage Guide for ElPortal

## Overview
ElPortal uses the `sanity-plugin-icon-manager` for managing icons. The plugin provides a consistent way to handle icons across the platform with proper metadata and URLs.

## Icon Structure
All icons must follow this structure:

```typescript
{
  _type: 'icon.manager',
  icon: 'collection:icon-name',  // e.g., 'lucide:sun'
  metadata: {
    collectionId: 'lucide',      // Icon collection
    collectionName: 'Lucide',    // Human-readable collection name
    icon: 'sun',                 // Icon name within collection
    iconName: 'Sun',             // Human-readable icon name
    url: 'https://api.iconify.design/lucide:sun.svg?color=%2384db41',
    inlineSvg: null,             // Optional inline SVG
    size: {
      width: 24,
      height: 24
    }
  }
}
```

## Available Icon Collections

### 1. Lucide Icons (Recommended)
- Collection ID: `lucide`
- Example icons: `flower`, `sun`, `leaf`, `snowflake`, `zap`, `home`, `check-circle`
- URL format: `https://api.iconify.design/lucide:{icon-name}.svg`

### 2. Material Design Icons
- Collection ID: `mdi`
- Example icons: `home`, `menu`, `close`, `arrow-right`
- URL format: `https://api.iconify.design/mdi:{icon-name}.svg`

### 3. Tabler Icons
- Collection ID: `tabler`
- Example icons: `bolt`, `sun`, `moon`, `star`
- URL format: `https://api.iconify.design/tabler:{icon-name}.svg`

## Color Options
The default color for icons is ElPortal's brand green: `#84db41`

To use different colors, modify the URL:
- Brand green: `?color=%2384db41`
- White: `?color=%23ffffff`
- Dark: `?color=%231f2937`

## Common Icons for ElPortal

### Energy/Electricity
- `lucide:zap` - Lightning bolt (electricity)
- `lucide:battery-charging` - Battery charging
- `lucide:sun` - Solar energy
- `tabler:wind` - Wind energy
- `mdi:transmission-tower` - Power grid

### Money/Pricing
- `lucide:dollar-sign` - Currency
- `lucide:trending-down` - Price decrease
- `lucide:piggy-bank` - Savings
- `lucide:calculator` - Calculator

### Seasonal
- `lucide:flower` - Spring
- `lucide:sun` - Summer
- `lucide:leaf` - Autumn/Fall
- `lucide:snowflake` - Winter

### UI/Navigation
- `lucide:check-circle` - Success/checkmark
- `lucide:info` - Information
- `lucide:arrow-right` - Direction
- `lucide:home` - Home/House

## Adding Icons in Sanity Studio

1. In Sanity Studio, when you see an icon field, click the icon picker
2. Search for your desired icon (e.g., "sun", "electricity")
3. Select the icon from the search results
4. The plugin automatically generates the proper metadata

## Adding Icons Programmatically

```typescript
// Example: Adding a sun icon
const iconData = {
  _type: 'icon.manager',
  icon: 'lucide:sun',
  metadata: {
    collectionId: 'lucide',
    collectionName: 'Lucide',
    icon: 'sun',
    iconName: 'Sun',
    url: 'https://api.iconify.design/lucide:sun.svg?color=%2384db41',
    inlineSvg: null,
    size: { width: 24, height: 24 }
  }
}
```

## Troubleshooting

### "Cannot read properties of undefined" Error
This happens when the icon metadata is incomplete. Ensure all icons have:
- The `metadata` object
- A valid `url` property
- The correct `_type: 'icon.manager'`

### Icons Not Displaying
1. Check browser console for errors
2. Verify the URL is accessible
3. Ensure the icon collection and name are valid
4. Check if the color parameter is properly encoded (`%23` for `#`)

### Finding Icon Names
Browse available icons at:
- Lucide: https://lucide.dev/icons
- Iconify: https://icon-sets.iconify.design/
- Material Design: https://pictogrammers.com/library/mdi/

## Best Practices

1. **Use Lucide icons** as the primary choice for consistency
2. **Always include metadata** - Don't create icons with just the icon string
3. **Use brand colors** - Default to ElPortal green (#84db41)
4. **Test icons** - Verify they display correctly before deploying
5. **Semantic naming** - Choose icons that clearly represent their purpose