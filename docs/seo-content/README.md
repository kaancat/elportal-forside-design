# SEO Content Creation Workflow

## How It Works

1. **Request SEO content**: Ask the `seo-content-creator` sub-agent to create content for a specific topic
2. **Sub-agent researches and writes**: Creates 2000+ word Danish SEO content with keyword research
3. **Review content**: Check the generated content in this folder
4. **Main agent integration**: Ask Claude (main agent) to integrate the content with proper schemas and deploy

## Sub-Agent Capabilities

The SEO content creator:
- ✅ Researches competitors and keywords using Gemini
- ✅ Writes comprehensive Danish SEO content (2000+ words)
- ✅ Suggests appropriate ElPortal components
- ✅ Provides structured output ready for integration
- ✅ Follows Danish language and business positioning guidelines

## Example Usage

```
User: "Create SEO content about electricity prices in DK1 vs DK2"

SEO Sub-Agent: 
- Researches competitors
- Consults Gemini for keywords
- Writes comprehensive content
- Saves to /docs/seo-content/dk1-vs-dk2-priser.md

User: "Claude, integrate this content and deploy as a new page"

Main Agent:
- Reads the SEO content
- Creates proper Sanity schemas
- Handles deployment and validation
- Fixes any technical issues
```

## File Naming Convention

Content files should be named with URL-friendly slugs:
- `elpriser-dk1-vs-dk2.md`
- `vindenergi-fordele.md`
- `spar-penge-el.md`

## Integration Notes

Each content file includes:
- Complete Danish SEO content
- Metadata with keywords and recommendations
- Component suggestions for main agent
- Integration notes for technical implementation