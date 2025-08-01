# Active Scripts Documentation

Last Updated: 2025-08-01

## Overview

This directory contains 22 active TypeScript scripts and utilities for the ElPortal project. All scripts have been audited and verified to be in active use or necessary for ongoing operations.

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
- `test-phase3-frontend.ts` - Test Phase 3 frontend migration (temporary)
- `test-unified-types.ts` - Test unified type system
- `test-unified-types-simple.ts` - Simplified unified type testing

### 7. Migration Scripts
- `comprehensive-migration-check.ts` - Comprehensive homepage unification verification

### 8. Agent Actions (Subdirectory)
The `agent-actions/` folder contains experimental AI agent integration scripts for automated content creation and validation.

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

## Scripts Still Referencing homePage

These scripts reference the legacy `homePage` type for backward compatibility testing:
- `test-unified-types.ts` - Tests type conversion between schemas
- `test-unified-types-simple.ts` - Simplified type testing
- `test-phase3-frontend.ts` - Frontend migration testing
- `comprehensive-migration-check.ts` - Migration verification
- `agent-actions/test-agent-actions-schemas.ts` - Schema testing

These references are intentional and necessary for ensuring the migration works correctly.

## Maintenance Notes

- Run `check-navigation-health.ts` weekly
- Run `validate-final.ts` before any deployment
- Migration test scripts can be removed after Phase 5 completion
- All other scripts are part of ongoing operations