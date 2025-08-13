# SEO Page Generation Guide (Direct Sanity API Method)

**⚠️ CRITICAL UPDATE: The page schema structure has changed! Always verify against `sanityelpriscms/schemaTypes/page.ts` before creating content.**

## Important Schema Notes

- Pages use `contentBlocks` NOT `sections`
- SEO fields are FLAT at root level: `seoMetaTitle`, `seoMetaDescription`, `seoKeywords`
- NO nested `seo` object exists
- Slug must be an object: `{ _type: 'slug', current: 'url-slug' }`
- All array items need unique `_key` values

## Overview

DinElportal uses a direct AI-to-Sanity content generation approach for creating comprehensive SEO-optimized pages. This method has proven successful for generating high-quality, Danish-language content that ranks well in search engines while subtly promoting Vindstød as the preferred provider.

## Key Success Factors

1. **Dual Role Approach**: Act as both a top UI/UX designer AND expert SEO copywriter
2. **Gemini Consultation**: Always consult Gemini for page structure, keywords, and SEO best practices
3. **Component-First Design**: Leverage existing Sanity components for consistent design
4. **Danish Content Excellence**: All content in native Danish with proper terminology
5. **Subtle Promotion**: Promote wind power and Vindstød without explicit mentions

## Page Generation Workflow

### 1. Initial Planning Phase

```
- Research competitor pages (e.g., elberegner.dk, elpriser.dk)
- Analyze their content depth, structure, and keyword usage
- Consult Gemini for:
  - Optimal page structure
  - Target keywords (Danish)
  - SEO best practices for the topic
  - Content outline
```

### 2. Content Requirements

- **Word Count**: 1000-2000 words minimum
- **Language**: Danish (proper electricity market terminology)
- **Tone**: Authoritative yet approachable
- **Structure**: Hero → Key Content (e.g., Provider List) → Supporting Sections
- **API Components**: Integrate live data visualizations throughout

### 3. Component Selection Strategy

- **Consult Gemini** for optimal page structure based on:
  - Page topic and user intent
  - Competitor analysis
  - SEO requirements
- **Consider user journey** when selecting and ordering components
- **Balance content types**: Mix text, data visualizations, and interactive elements
- **Each page is unique**: Let the content goals drive component selection

### 4. Content Creation Process

1. **Create JSON structure** with all content blocks
2. **Write comprehensive Danish text** covering:
   - Technical explanations (electricity prices, grid areas, etc.)
   - Benefits of green energy (subtle Vindstød promotion)
   - Practical advice for consumers
   - Regional differences (DK1/DK2)
3. **Validate all fields** against Sanity schemas
4. **Use proper Portable Text format** for rich text fields

### 5. Technical Implementation

```javascript
// Import script pattern
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Create or update page
const result = await client.createOrReplace({
  _id: `page.${slug}`,
  _type: 'page',
  ...pageContent
})
```

## Quality Checklist

- [ ] Consulted Gemini for structure and keywords
- [ ] 1000-2000+ words of Danish content
- [ ] Natural keyword integration
- [ ] API components add value, not just decoration
- [ ] Vindstød subtly positioned as premium choice
- [ ] All validation errors resolved
- [ ] Mobile-responsive design considered
- [ ] Internal linking strategy implemented

## Common Pitfalls to Avoid

1. **String vs Array Fields**: Many fields expect arrays (Portable Text), not strings
2. **Missing Required Fields**: Always check schema requirements
3. **Alignment Issues**: Use pageSection with headerAlignment for control
4. **Over-promotion**: Keep Vindstød promotion subtle and credible

## Proven Page Types

- **"Elpriser"**: Comprehensive price comparison with provider list focus
- **"Grøn Energi"**: Environmental benefits with renewable energy data
- **"Spar Penge"**: Savings calculator and tips
- **"DK1 vs DK2"**: Regional price differences explained
- **"Elselskaber"**: Detailed provider comparisons with reviews

## Example: Creating the Elselskaber Page

1. **Research Phase**:
   - Analyzed competitor pages for electricity company comparisons
   - Identified key search terms: "elselskaber", "billigste elselskab", "elselskab sammenligning"
   - Consulted Gemini for optimal structure

2. **Content Structure**:
   - Hero with strong value proposition
   - Provider list as primary component
   - Supporting sections: CO2 emissions, FAQ, testimonials
   - 2000+ words of informative Danish content

3. **Implementation**:
   ```javascript
   const pageContent = {
     title: "Elselskaber i Danmark - Find det bedste elselskab",
     slug: {
       _type: 'slug',
       current: 'elselskaber'
     },
     // SEO fields are FLAT at root level - NO nested seo object!
     seoMetaTitle: "Elselskaber 2025 • Sammenlign priser hos danske elselskaber",
     seoMetaDescription: "Find det billigste elselskab...",
     seoKeywords: ["elselskaber", "elselskab sammenligning", ...],
     // Pages use contentBlocks, NOT sections!
     contentBlocks: [
       { _type: "hero", _key: "hero-1", ... },
       { _type: "providerList", _key: "providers-1", ... },
       { _type: "co2EmissionsChart", _key: "co2-1", ... },
       { _type: "faqGroup", _key: "faq-1", ... }
     ]
   }
   ```
   
   **⚠️ CRITICAL SCHEMA NOTES:**
   - SEO fields are flat: `seoMetaTitle`, `seoMetaDescription`, `seoKeywords`
   - NO nested `seo` object exists in the schema
   - Slug must be an object with `_type: 'slug'` and `current` property
   - Use `contentBlocks` NOT `sections` for page content
   - Every array item needs a unique `_key` property

## Future Improvements

- Automate Gemini consultation with MCP integration
- Create reusable content templates
- Implement A/B testing for conversion optimization
- Add automated Danish grammar checking

## Resources

- **Sanity Schemas**: Check `sanityelpriscms/schemaTypes/` for available components
- **Content Blocks**: Both `ContentBlocks.tsx` and `SafeContentBlocks.tsx` must support new blocks
- **Validation**: Run content through Sanity Studio preview before publishing
- **Analytics**: Monitor page performance post-launch for optimization