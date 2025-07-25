# Sanity Schema Reference - CRITICAL FOR AGENTS

**⚠️ AGENTS: This is the ACTUAL schema structure from sanityelpriscms. DO NOT GUESS FIELD NAMES!**

## Component Field Mappings

### hero
```javascript
{
  _type: 'hero',
  _key: 'unique-key',
  headline: 'string',        // NOT heading
  subheadline: 'string',     // NOT subheading  
  image: { ... }             // NO ctaText or ctaLink fields!
}
```

### pageSection
```javascript
{
  _type: 'pageSection',
  _key: 'unique-key',
  title: 'string',           // NOT heading
  headerAlignment: 'left|center|right',
  content: [...],            // Array of blocks
  image: { ... },
  imagePosition: 'left|right',
  cta: {
    text: 'string',
    url: 'string'
  },
  settings: { ... }
}
```

### valueProposition
```javascript
{
  _type: 'valueProposition',
  _key: 'unique-key',
  title: 'string',           // NOT heading
  items: [                   // NOT values
    {
      _type: 'valueItem',
      _key: 'unique-key',
      icon: 'string',        // Icon name
      heading: 'string',     // Individual item heading
      description: 'string'
    }
  ]
  // NO headerAlignment field!
}
```

### livePriceGraph
```javascript
{
  _type: 'livePriceGraph',
  _key: 'unique-key',
  title: 'string',           // NOT heading
  subtitle: 'string',        // NOT description
  apiRegion: 'DK1|DK2',      // NOT priceArea
  headerAlignment: 'left|center|right'
  // NO showPriceBreakdown, showRegionSelector, defaultView fields!
}
```

### faqGroup
```javascript
{
  _type: 'faqGroup',
  _key: 'unique-key',
  title: 'string',           // NOT heading
  faqItems: [                // NOT faqs
    {
      _type: 'faqItem',
      _key: 'unique-key',
      question: 'string',
      answer: [...]          // Portable Text array
    }
  ]
  // NO headerAlignment field!
}
```

### callToActionSection
```javascript
{
  _type: 'callToActionSection',
  _key: 'unique-key',
  title: 'string',           // NOT heading
  buttonText: 'string',
  buttonUrl: 'string'
  // NO description, primaryCta, secondaryCta, variant fields!
}
```

### chargingBoxShowcase
```javascript
{
  _type: 'chargingBoxShowcase',
  _key: 'unique-key',
  heading: 'string',         // This one IS heading!
  headerAlignment: 'left|center|right',
  description: [...],        // Portable Text
  products: [                // Array of references
    {
      _type: 'reference',
      _ref: 'chargingBoxProduct-id',
      _key: 'unique-key'
    }
  ]
}
```

### co2EmissionsChart
```javascript
{
  _type: 'co2EmissionsChart',
  _key: 'unique-key',
  heading: 'string',         // This one IS heading!
  headerAlignment: 'left|center|right',
  description: [...],        // Portable Text
  showForecast: boolean,
  defaultView: 'historical|forecast|both'
}
```

### providerList
```javascript
{
  _type: 'providerList',
  _key: 'unique-key',
  heading: 'string',
  headerAlignment: 'left|center|right',
  description: [...],        // Portable Text
  variant: 'primary|compact'
}
```

### monthlyProductionChart
```javascript
{
  _type: 'monthlyProductionChart',
  _key: 'unique-key',
  heading: 'string',
  headerAlignment: 'left|center|right',
  description: [...],        // Portable Text
  region: 'DK1|DK2'
}
```

### renewableEnergyForecast
```javascript
{
  _type: 'renewableEnergyForecast',
  _key: 'unique-key',
  heading: 'string',
  headerAlignment: 'left|center|right',
  description: [...],        // Portable Text
  region: 'DK1|DK2',
  showLegend: boolean
}
```

## Common Patterns

1. **Title vs Heading**: 
   - Most basic components use `title`
   - Chart/data components often use `heading`
   - Hero uses `headline`

2. **Header Alignment**:
   - Only some components have `headerAlignment`
   - Usually chart/data visualization components

3. **Description Fields**:
   - Usually array of Portable Text blocks
   - LivePriceGraph uses `subtitle` instead

4. **Missing Features**:
   - Many "expected" fields don't exist
   - Components are simpler than agents assume

## Critical Rules for Agents

1. **NEVER GUESS FIELD NAMES** - Use this reference
2. **Check if fields exist** - Don't add fields that aren't in the schema
3. **Portable Text arrays** - Description fields are arrays, not strings
4. **Unique keys** - Every array item needs `_key`
5. **Reference format** - Use proper reference objects for relations

## How to Add Missing Fields

If a component needs additional fields (like hero CTA):
1. Update the schema in `sanityelpriscms/schemaTypes/[component].ts`
2. Deploy the schema changes to Sanity
3. Update the frontend component to handle new fields
4. Update this reference document