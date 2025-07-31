# Schema Synchronization Guide

## Overview

This guide ensures perfect synchronization between Sanity CMS schemas and Frontend TypeScript types/components.

## Schema to Component Mapping

### Content Blocks with Frontend Components

| Sanity Schema | Frontend Component | Location | Notes |
|--------------|-------------------|----------|-------|
| hero | HeroSection | components/HeroSection.tsx | Uses headline/subheadline |
| heroWithCalculator | HeroWithCalculator | components/HeroWithCalculator.tsx | Includes PriceCalculatorWidget |
| pageSection | PageSectionComponent | components/PageSectionComponent.tsx | Container for rich content |
| valueProposition | ValueProposition | components/ValueProposition.tsx | Icon grid with heading |
| featureList | FeatureList | components/FeatureList.tsx | Feature items with icons |
| priceCalculator | PriceCalculatorWidget | components/PriceCalculatorWidget.tsx | Standalone calculator |
| providerList | ProviderList | components/ProviderList.tsx | Vindstød-first listing |
| livePriceGraph | LivePriceGraphComponent | components/LivePriceGraphComponent.tsx | Real-time prices |
| renewableEnergyForecast | RenewableEnergyForecast | components/RenewableEnergyForecast.tsx | Green energy data |
| monthlyProductionChart | MonthlyProductionChart | components/MonthlyProductionChart.tsx | Historical data |
| co2EmissionsChart | CO2EmissionsChart | components/CO2EmissionsChart.tsx | CO2 intensity |
| faqGroup | FaqSection | components/FaqSection.tsx | Collapsible Q&A |
| callToActionSection | CallToActionSection | components/CallToActionSection.tsx | CTA blocks |
| videoSection | VideoSection | components/VideoSection.tsx | YouTube embeds |

### Critical Field Mappings

```typescript
// COMMON MISTAKES TO AVOID
const FIELD_MAPPINGS = {
  hero: {
    correct: {
      headline: 'string',      // ✅
      subheadline: 'string',   // ✅
      image: 'image'           // ✅
    },
    wrong: {
      title: 'WRONG - use headline',
      subtitle: 'WRONG - use subheadline'
    }
  },
  
  valueItem: {
    correct: {
      heading: 'string',       // ✅
      description: 'text',     // ✅
      icon: 'icon.manager'     // ✅
    },
    wrong: {
      title: 'WRONG - use heading',
      icon: 'WRONG if string - must be object'
    }
  },
  
  featureItem: {
    correct: {
      title: 'string',         // ✅
      description: 'text',     // ✅
      icon: 'icon.manager'     // ✅
    },
    wrong: {
      name: 'WRONG - use title',
      heading: 'WRONG - use title'
    }
  }
}
```

## Synchronization Process

### 1. When Adding New Schema

```bash
# Step 1: Create schema in Sanity
cd sanityelpriscms
# Create schemaTypes/myNewSchema.ts
# Add to schemaTypes/index.ts

# Step 2: Deploy schema
npm run deploy

# Step 3: Generate types
cd ../elportal-forside-design
npm run generate:types

# Step 4: Create component
# Create src/components/MyNewComponent.tsx

# Step 5: Add to renderers
# Update BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx

# Step 6: Update GROQ
# Add to queries in lib/sanity.ts
```

### 2. When Modifying Existing Schema

```bash
# Step 1: Update schema
cd sanityelpriscms
# Modify schemaTypes/existingSchema.ts

# Step 2: Check for breaking changes
node ../elportal-forside-design/scripts/validate-sanity-content.js

# Step 3: Deploy and sync
npm run deploy
cd ../elportal-forside-design
./scripts/sync-projects.sh

# Step 4: Update component if needed
# Modify corresponding React component

# Step 5: Test thoroughly
npm run dev
```

### 3. Type Generation Details

The type generation process:
1. Reads Sanity schemas
2. Generates Zod schemas
3. Creates TypeScript types
4. Validates at runtime

```typescript
// Generated file: src/lib/sanity-schemas.zod.ts
export const HeroSchema = z.object({
  _type: z.literal('hero'),
  _key: z.string().optional(),
  headline: z.string(),
  subheadline: z.string(),
  image: ImageSchema.optional()
})

export type Hero = z.infer<typeof HeroSchema>
```

## Validation Strategies

### 1. Pre-Save Validation

```javascript
// Use before saving to Sanity
const { validateContent } = require('./scripts/validate-sanity-content')

const content = {
  _type: 'hero',
  headline: 'My Headline',
  subheadline: 'My Subheadline'
}

const { errors, warnings } = validateContent(content)
if (errors.length > 0) {
  console.error('Validation failed:', errors)
  process.exit(1)
}
```

### 2. Runtime Validation

```typescript
// Use Zod schemas for runtime validation
import { HeroSchema } from '@/lib/sanity-schemas.zod'

try {
  const validatedHero = HeroSchema.parse(heroData)
  // Safe to use
} catch (error) {
  console.error('Invalid hero data:', error)
}
```

### 3. Component Props Validation

```typescript
// Define strict props interfaces
interface HeroSectionProps {
  block: {
    _type: 'hero'
    _key?: string
    headline: string
    subheadline: string
    image?: SanityImage
  }
}
```

## Common Sync Issues & Solutions

### Issue 1: "Unknown field" errors
**Cause**: Schema has fields not in component
**Solution**: Regenerate types and update component

### Issue 2: Component not rendering
**Cause**: Missing from ContentBlocks renderer
**Solution**: Add to BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx

### Issue 3: Type mismatch errors
**Cause**: Schema changed but types not regenerated
**Solution**: Run `npm run generate:types`

### Issue 4: Icon display broken
**Cause**: String icon instead of icon.manager object
**Solution**: Use icon picker in Sanity Studio

### Issue 5: Content validation fails
**Cause**: Using wrong field names
**Solution**: Check FIELD_MAPPINGS above

## Automated Sync Tools

### Daily Sync Script
```bash
# Run every morning
./scripts/sync-projects.sh
```

### Validation Script
```bash
# Run before content creation
node scripts/validate-sanity-content.js
```

### Type Generation
```bash
# Run after schema changes
npm run generate:types
```

## Best Practices

1. **Always validate before saving content**
2. **Deploy Sanity before frontend**
3. **Keep both renderers in sync**
4. **Use TypeScript strictly**
5. **Test in development first**
6. **Document schema changes**
7. **Use semantic versioning for major changes**

## Emergency Recovery

### Schema Rollback
```bash
cd sanityelpriscms
git log --oneline schemaTypes/
git checkout <commit-hash> -- schemaTypes/
npm run deploy
```

### Type Regeneration
```bash
cd elportal-forside-design
rm -rf src/lib/sanity-schemas.zod.ts
npm run generate:types
```

### Component Sync Fix
```bash
# Compare renderers
diff src/components/ContentBlocks.tsx src/components/SafeContentBlocks.tsx
# Ensure both have same cases
```