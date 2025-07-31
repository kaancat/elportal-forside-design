# Comprehensive Sanity Content Analysis Report

## Executive Summary

After analyzing both the 'prognoser' and 'elprisberegner' pages, I've identified several structural inconsistencies between the Sanity content and React components. The main issues are:

1. **Icon Structure Inconsistency**: Different content blocks use different icon structures
2. **InfoCardsSection Component Mismatch**: The component expects different data than Sanity provides
3. **Missing Icons**: ValueProposition items in elprisberegner have no icons
4. **Query Coverage**: Some content blocks aren't included in the service queries

## Detailed Findings

### 1. Icon Structure Analysis

There are THREE different icon structures being used across the content:

#### Type A: Simple Icon Picker (used in InfoCardsSection from prognoser)
```json
{
  "_type": "iconPicker",
  "name": "Clock",
  "provider": "lucide",
  "svg": "<svg>...</svg>"
}
```

#### Type B: Full Icon Manager (used in FeatureList - WORKING)
```json
{
  "_type": "icon.manager",
  "icon": "streamline-freehand:trading-graph",
  "metadata": {
    "iconName": "trading-graph",
    "url": "https://api.iconify.design/...",
    "color": { "hex": "#84db41" },
    // ... extensive metadata
  },
  "name": "TrendingUp",
  "provider": "lucide",
  "svg": "<svg>...</svg>"
}
```

#### Type C: Simple String (expected by InfoCardsSection component)
```json
{
  "icon": "clock"  // Just a string identifier
}
```

### 2. InfoCardsSection Issues

#### Data Structure Mismatch

**Prognoser Page InfoCardsSection:**
- Has proper `title` field on cards ✓
- Uses Type A icon structure (iconPicker)
- No bgColor or iconColor fields

**Elprisberegner Page InfoCardsSection:**
- Has proper `title` field on cards ✓
- Uses simple string icons (Type C) ✓
- Has bgColor and iconColor fields ✓
- **This one actually matches the component expectations!**

**Component Expectations:**
```typescript
{
  title: string,          // ✓ Both pages have this
  description?: BlockContent[],  // ✓ Both pages have this
  icon?: string,          // ✗ Only elprisberegner matches
  bgColor?: string,       // ✗ Only elprisberegner has this
  iconColor?: string      // ✗ Only elprisberegner has this
}
```

### 3. ValueProposition Issues

The elprisberegner page has valueItems with NO icons at all:
```json
{
  "heading": "Gennemsnitlig elpris 2025",
  "description": "2,10-2,80 kr/kWh inkl. alt"
  // No icon field!
}
```

While the prognoser page has proper icons using Type A structure.

### 4. Component Implementation Analysis

The **InfoCardsSection** component:
- Uses a hardcoded `iconMap` with string keys
- Cannot render SVG directly from Sanity
- Expects simple string icon identifiers

The **FeatureList** component (which works properly):
- Likely handles the full icon.manager structure
- Can render SVG directly

### 5. Query Coverage

The `getPageBySlug` query in sanityService.ts is missing:
- `infoCardsSection` block expansion
- `regionalComparison` block expansion
- Several other newer block types

## Root Cause Analysis

The issues stem from:

1. **Evolution of Icon System**: The project started with simple string icons, then moved to iconPicker, and finally to icon.manager, but not all components were updated
2. **Inconsistent Content Creation**: Different pages were created at different times with different icon systems
3. **Component-Schema Mismatch**: The InfoCardsSection component wasn't updated when the schema changed to use icon objects

## Recommendations

### Immediate Fixes

1. **Update InfoCardsSection Component** to handle all icon types:
   - Check icon type and render accordingly
   - Support direct SVG rendering from iconPicker/icon.manager
   - Maintain backward compatibility with string icons

2. **Add Missing Query Expansions** in sanityService.ts

3. **Add Icons to ValueProposition** items in elprisberegner

### Long-term Solutions

1. **Standardize Icon System**: Choose one icon approach (preferably icon.manager) and migrate all content
2. **Create Icon Rendering Utility**: A shared component that handles all icon types
3. **Schema Validation**: Add validation to ensure all required fields are present
4. **Documentation**: Document the expected structure for each content block

## Content Comparison

### Prognoser Page Structure
- Uses iconPicker for InfoCardsSection (Type A)
- Has proper icons in ValueProposition
- 20 total content blocks
- Missing hero image

### Elprisberegner Page Structure
- Uses string icons for InfoCardsSection (Type C) - matches component!
- Missing icons in ValueProposition
- 18 total content blocks
- Missing hero image
- Has working FeatureList with icon.manager (Type B)

## Conclusion

The main issue is that the InfoCardsSection component on the prognoser page receives iconPicker objects but expects strings. The elprisberegner page actually has the correct structure for InfoCardsSection but is missing icons in its ValueProposition section.

The solution is to update the InfoCardsSection component to handle multiple icon types, similar to how FeatureList already does.