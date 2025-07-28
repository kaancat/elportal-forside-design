# SEO Page Creator with Agent Actions Validation

## Overview

The enhanced SEO Page Creator now uses Sanity Agent Actions to automatically validate and fix schema errors before creating pages. This eliminates the hours spent debugging field name validation errors.

## Key Features

### 🔍 Automatic Validation
- Detects wrong field names (e.g., `hero.title` → `hero.headline`)
- Validates content structure against Sanity schemas
- Provides detailed error reports

### ✨ AI-Powered Correction
- Automatically fixes field name errors
- Preserves all content values
- Returns corrected structure ready to use

### 📊 SEO Analysis
- Post-creation SEO recommendations
- Content quality analysis
- Keyword optimization suggestions

## Usage

### 1. Simple Page Creation with Validation

```typescript
import { createPageWithValidation } from './scripts/create-seo-page-with-validation'

const pageContent = {
  _type: 'page',
  title: 'Your Page Title',
  slug: { current: 'your-page-slug' },
  contentBlocks: [
    {
      _type: 'hero',
      _key: 'hero1',
      title: 'Hero Title', // Wrong field - will be auto-corrected to 'headline'
      subtitle: 'Hero Subtitle' // Wrong field - will be auto-corrected to 'subheadline'
    }
  ]
}

const result = await createPageWithValidation(pageContent)
```

### 2. Full SEO Agent Workflow

```bash
npm run seo:agent "Varmepumper og Elpriser" "varmepumper-elpriser" "varmepumpe,elpriser,spare"
```

Or programmatically:

```typescript
import SEOPageCreatorAgent from './scripts/seo-page-creator-agent'

const agent = new SEOPageCreatorAgent()

const result = await agent.createSEOPage(
  'Varmepumper og Elpriser - Komplet Guide',
  'varmepumper-elpriser-guide',
  ['varmepumpe', 'elpriser', 'spare el', 'grøn energi'],
  {
    research: true,    // Research topic first
    analyze: true      // Analyze after creation
  }
)
```

## NPM Scripts

```bash
# Create a page with validation
npm run seo:create

# Run the full SEO agent
npm run seo:agent <topic> <slug> [keywords]

# Test validation capabilities
npm run seo:validate
```

## How It Works

1. **Content Generation**: Your SEO agent generates content (might have wrong field names)
2. **Validation**: Agent Actions PROMPT validates against schema rules
3. **Auto-Correction**: AI fixes any field name errors
4. **Creation**: Page is created with correct structure
5. **Analysis**: Optional SEO analysis and recommendations

## Common Field Corrections

| Wrong Field | Correct Field | Block Type |
|------------|---------------|------------|
| hero.title | hero.headline | hero |
| hero.subtitle | hero.subheadline | hero |
| valueItem.title | valueItem.heading | valueProposition |
| featureItem.name | featureItem.title | featureList |

## Benefits

✅ **No More Debugging**: Validation errors are caught and fixed automatically
✅ **Faster Development**: From hours of debugging to seconds of automatic correction
✅ **Consistent Quality**: Every page follows the exact schema requirements
✅ **SEO Optimized**: Built-in SEO analysis and recommendations

## Example Output

```
🚀 Creating SEO Page with Agent Actions Validation

📝 Page Title: Smart Opladning af Elbil
🔗 Slug: smart-opladning-elbil

🔍 Validating content structure with Agent Actions...

📊 Validation Results:
   Valid: ❌
   Errors Found: 2

🔧 Errors detected:
   - contentBlocks[0]: title → headline
   - contentBlocks[0]: subtitle → subheadline

✨ Using AI-corrected content structure

📤 Creating page in Sanity...
✅ Page created successfully!
   ID: page.smart-opladning-elbil
   Title: Smart Opladning af Elbil
   Slug: /smart-opladning-elbil

🎯 Analyzing for SEO improvements...

💡 SEO Recommendations:
   Title Length: Consider adding location (e.g., "i Danmark")
   Keywords: Add more long-tail keywords
   Meta Description: Include call-to-action
```

## Integration with Existing Workflows

Your existing SEO agents can continue generating content as before. Simply wrap the final creation step with `createPageWithValidation()` to add automatic error correction:

```typescript
// Before (with validation errors)
const page = await client.createOrReplace(seoContent)

// After (with automatic correction)
const result = await createPageWithValidation(seoContent)
```

## Troubleshooting

### Schema ID Not Found
Make sure your Sanity schemas are deployed:
```bash
cd /path/to/sanityelpriscms
npx sanity schema deploy
```

### Agent Actions Not Available
Ensure you're using:
- Sanity client v7.1.0+
- API version 'vX'
- Valid authentication token

## Conclusion

With Agent Actions validation, your SEO content creation is now:
- **Error-free**: No more field name validation errors
- **Efficient**: Automatic correction saves hours
- **Intelligent**: AI understands your schema requirements
- **"Full-hitter"**: Pages work correctly the first time!

Your main goal achieved: *"have the structure... be a full-hitter the first time rather than spending 1 hour debugging validation errors"* ✅