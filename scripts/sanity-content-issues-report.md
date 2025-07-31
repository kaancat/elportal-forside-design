# Sanity Content Issues Report

## Summary
After analyzing the 'prognoser' and 'elprisberegner' pages, I've identified several structural issues with how content is stored in Sanity vs. how the React components expect it.

## Key Issues Found

### 1. InfoCardsSection Component Mismatch

**Problem**: The InfoCardsSection component expects different field names and structures than what Sanity provides.

**Current Sanity Structure**:
```json
{
  "_type": "infoCardsSection",
  "cards": [
    {
      "heading": null,  // Field name is 'heading', not 'title'
      "description": [  // Array of Portable Text blocks, not string
        {
          "_type": "block",
          "children": [{ "text": "..." }]
        }
      ],
      "icon": {  // Complex icon object from icon.manager
        "_type": "iconPicker",
        "name": "Clock",
        "provider": "lucide",
        "svg": "<svg>...</svg>",
        "metadata": null
      }
    }
  ]
}
```

**Component Expects**:
```typescript
{
  cards: {
    title: string,  // Expects 'title', not 'heading'
    description?: BlockContent[],
    icon?: string,  // Expects simple string like 'clock', not complex object
    bgColor?: string,
    iconColor?: string
  }[]
}
```

**Issues**:
- Field name mismatch: `heading` vs `title`
- Icon structure mismatch: complex icon object vs simple string
- Missing bgColor and iconColor fields
- Component uses hardcoded icon mapping instead of dynamic SVG from Sanity

### 2. ValueProposition Missing Icons

**Problem**: In the 'elprisberegner' page, all valueItems are missing icons.

**Current Data**:
```
Value Item 1:
  Heading: Gennemsnitlig elpris 2025
  Description: Present
  Icon: Missing

Value Item 2:
  Heading: Mulig besparelse
  Description: Present
  Icon: Missing
```

### 3. Missing Query Support in sanityService.ts

**Problem**: The `getPageBySlug` query doesn't include `infoCardsSection` expansion, which means the component won't receive proper data when fetched through the service.

**Missing in Query**:
```typescript
// This block type is missing from getPageBySlug
_type == "infoCardsSection" => {
  _key,
  _type,
  heading,
  cards[]{
    _key,
    heading,
    description,
    icon {
      ...,
      metadata {
        inlineSvg,
        iconName,
        url,
        color
      }
    }
  }
}
```

### 4. Hero Image Missing

Both pages have hero sections without images:
- prognoser: `Image: Missing`
- elprisberegner: `Image: Missing`

## Recommended Fixes

### 1. Update InfoCardsSection Component
The component needs to be updated to:
- Accept `heading` field name (or map it to `title`)
- Handle complex icon objects from Sanity icon.manager
- Render SVG directly from the icon data

### 2. Update Sanity Queries
Add the missing `infoCardsSection` block to both `getPageBySlug` and `getHomePage` queries in sanityService.ts

### 3. Add Missing Icons
Update the Sanity content to add icons to:
- ValueProposition items in elprisberegner page
- Any other components missing icons

### 4. Add Hero Images
Upload and assign appropriate hero images for both pages

## Page Structure Comparison

### Prognoser Page (20 blocks)
1. hero (missing image)
2. livePriceGraph
3. pageSection (education)
4. pageSection (renewable-energy-intro)
5. renewableEnergyForecast
6. priceCalculator
7. pageSection (weekly-trends)
8. pageSection (historical-production-intro)
9. monthlyProductionChart
10. pageSection (co2-explanation)
11. co2EmissionsChart
12. providerList
13. **infoCardsSection** (problematic)
14. valueProposition
15. pageSection (save-money)
16. pageSection (tools-intro)
17. co2EmissionsChart
18. pageSection (faq-intro)
19. faqGroup
20. callToActionSection

### Elprisberegner Page (18 blocks)
1. heroWithCalculator (missing image)
2. realPriceComparisonTable
3. featureList (with working icons)
4. pageSection
5. valueProposition (missing icons)
6. livePriceGraph
7. energyTipsSection
8. applianceCalculator
9. regionalComparison
10. providerList
11. faqGroup
12. **infoCardsSection** (problematic)
13. pageSection (tools)
14. pageSection (understand)
15. callToActionSection
16. pageSection (about)
17. featureList
18. callToActionSection

## Next Steps

1. Fix the InfoCardsSection component to handle Sanity's icon structure
2. Update sanityService.ts queries
3. Add missing icons and images through Sanity Studio
4. Consider creating a migration script to fix field name mismatches