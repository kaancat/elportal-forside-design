# Active Scripts Documentation

Last Updated: 2025-08-01

## Overview

This directory contains active TypeScript scripts and utilities for the ElPortal project. All scripts have been audited and verified to be in active use or necessary for ongoing operations.

## Script Categories

### 1. MCP Integration Scripts
- `mcp-search.ts` - Search for MCP servers in Smithery registry
- `mcp-use.ts` - Use specific MCP servers with dynamic tool discovery
- `mcp-browserbase.ts` - Browser automation using Browserbase MCP server

### 2. Validation & Schema Scripts
- `comprehensive-validation.ts` - Run comprehensive validation across all Sanity content
- `validate-faq-structure.ts` - Validate FAQ content structure
- `validate-final.ts` - Final validation before deployment
- `comprehensive-schema-validation-fix.ts` - Fix schema validation errors automatically
- `auto-fix-schema-issues.ts` - Automated schema issue resolution
- `quick-fix-valueitem-title.ts` - Fix common valueItem title→heading errors

### 3. SEO & Content Creation
- `create-seo-page-with-validation.ts` - Create SEO-optimized pages with validation
- `seo-page-creator-agent.ts` - AI-powered SEO page generation
- `create-icon-helper.ts` - Helper for creating icon metadata

### 4. Navigation & Health Checks
- `check-navigation-health.ts` - Verify navigation structure integrity
- `force-navigation-refresh.ts` - Force CDN cache refresh for navigation
- `check-ladeboks-structure.ts` - Check ladeboks page structure

### 5. Content Management
- `add-all-images-to-ladeboks.ts` - Add images to ladeboks products
- `fix-faq-references-to-inline.ts` - Convert FAQ references to inline content

### 6. Testing & Debugging
- `test-sanity-query.ts` - Test GROQ queries against Sanity


## Usage

Most scripts can be run directly with tsx:
```bash
npx tsx scripts/[script-name].ts
```

Or via npm scripts defined in package.json:
```bash
npm run validate:comprehensive
npm run navigation:health
npm run seo:create
```

## Environment Variables

All scripts expect these environment variables (from .env):
- `SANITY_API_TOKEN` - Sanity write token
- `VITE_SANITY_PROJECT_ID` - Sanity project ID (yxesi03x)
- `VITE_SANITY_DATASET` - Sanity dataset name (production)


## Maintenance Notes

- Run `check-navigation-health.ts` weekly
- Run `validate-final.ts` before any deployment
- All scripts are part of ongoing operations