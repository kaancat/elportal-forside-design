# Active Scripts Documentation

Last Updated: 2025-08-06

## Overview

This directory contains only essential infrastructure and utility scripts for the DinElPortal project. All static Sanity content manipulation scripts have been removed in favor of real-time schema reading.

## Philosophy

**NO STATIC CONTENT SCRIPTS**: We do not maintain scripts that write to Sanity with static assumptions about schemas. Instead, we read schemas directly from `/sanityelpriscms/schemaTypes/` whenever content needs to be created or modified.

## Active Scripts

### MCP Integration Tools
- `mcp-search.ts` - Search for MCP servers in Smithery registry
- `mcp-use.ts` - Use specific MCP servers with dynamic tool discovery
- `mcp-browserbase.ts` - Browser automation using Browserbase MCP server

### Infrastructure & Monitoring
- `check-navigation-health.ts` - Verify navigation structure integrity
- `force-navigation-refresh.ts` - Force CDN cache refresh for navigation
- `generate-sitemap.ts` - Generate sitemap.xml for SEO

### Testing & Debugging
- `test-sanity-query.ts` - Test GROQ queries against Sanity (read-only)

## Usage

Run scripts directly with tsx:
```bash
npx tsx scripts/[script-name].ts
```

Or via npm scripts:
```bash
npm run mcp:search "query"
npm run mcp:use @server/name
npm run navigation:health
npm run generate:sitemap
```

## Environment Variables

Required (from .env):
- `SANITY_API_TOKEN` - Sanity write token (server-only)
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID (yxesi03x)
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset name (production)

## Content Management Protocol

When writing to Sanity:
1. Read the actual schema from `/sanityelpriscms/schemaTypes/[type].ts`
2. Use exact field names and types from the schema
3. Write directly via Sanity API
4. No intermediate scripts or cached assumptions

This ensures we never have schema drift or field name mismatches.
