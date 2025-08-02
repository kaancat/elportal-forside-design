# ElPortal Documentation

Essential technical documentation for the ElPortal electricity price comparison platform.

## Quick Start

- **Project Overview**: See [/CLAUDE.md](/CLAUDE.md) in the root directory
- **Tech Stack & Structure**: See [ai-context/project-structure.md](ai-context/project-structure.md)
- **All Documentation**: See [ai-context/docs-overview.md](ai-context/docs-overview.md)

## Core Documentation (3 Essential Files)

### 🔧 Technical References
- **[ELECTRICITY-CALCULATOR-LOGIC.md](ELECTRICITY-CALCULATOR-LOGIC.md)** - Core business logic for price calculations
- **[ICON-USAGE-GUIDE.md](ICON-USAGE-GUIDE.md)** - How to use the Sanity icon plugin correctly

### 📝 Workflows & Guides
- **[SEO_PAGE_GENERATION.md](SEO_PAGE_GENERATION.md)** - Complete workflow for creating SEO-optimized pages

## Additional Resources

### Development Tools
- `development/` - MCP servers, browser automation, competitor analysis
- `ai-context/` - System integration patterns and API documentation
- `seo-content/` - Examples of generated SEO content

### Architecture
- `architecture/` - Navigation patterns and system design

## For AI Agents

**Start Here:**
1. Read `/CLAUDE.md` for project context
2. Use `SEO_PAGE_GENERATION.md` for creating new pages
3. Check actual code for schemas (see below)

**Finding Schema Information:**
1. Check GROQ queries in `/src/services/sanityService.ts`
2. Look at component implementations in `/src/components/`
3. Review TypeScript types in `/src/types/sanity.ts`
4. Verify in Sanity Studio when needed

**Common Mistakes to Avoid:**
- Never guess field names - check the actual GROQ queries
- Don't create generic documentation - keep it ElPortal-specific
- Always validate content by checking what fields are actually fetched