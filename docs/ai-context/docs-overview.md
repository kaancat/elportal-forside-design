# DinElportal Documentation Overview

This document provides a comprehensive map of the DinElportal documentation, helping AI agents and developers quickly find relevant information.

## Core Documentation

### Master Context
- **[/CLAUDE.md](/CLAUDE.md)** - Essential AI context with project overview, architecture, coding standards, and SEO generation workflow

### Project Structure & Integration
- **[project-structure.md](project-structure.md)** - Complete tech stack, file organization, and dependency management
- **[system-integration.md](system-integration.md)** - API patterns, data flow between Frontend and Sanity CMS
- **[EnergiDataServiceAPI.md](EnergiDataServiceAPI.md)** - External energy data API documentation with endpoints and examples

## Development Guides

### Key Workflows
- **[SEO_PAGE_GENERATION.md](/docs/SEO_PAGE_GENERATION.md)** - Direct API approach for creating SEO-optimized pages
### Technical References
- **[ELECTRICITY-CALCULATOR-LOGIC.md](/docs/ELECTRICITY-CALCULATOR-LOGIC.md)** - Core business logic for price calculations
- **[ICON-USAGE-GUIDE.md](/docs/ICON-USAGE-GUIDE.md)** - Icon management with sanity-plugin-icon-manager

### Development Tools
- **[using-mcp-servers.md](/docs/development/using-mcp-servers.md)** - MCP server integration via Smithery
- **[smithery-example-workflow.md](/docs/development/smithery-example-workflow.md)** - Practical MCP usage examples
- **[browserbase-setup.md](/docs/development/browserbase-setup.md)** - Browser automation setup

## Architecture

### System Architecture
- **[NAVIGATION_ARCHITECTURE.md](/docs/architecture/NAVIGATION_ARCHITECTURE.md)** - Navigation implementation patterns

## Quick Reference

### Most Important Files for AI Agents
1. **/CLAUDE.md** - Start here for project context
2. **docs/ai-context/project-structure.md** - Understand the codebase
3. **docs/SEO_PAGE_GENERATION.md** - Create new SEO pages

### Finding Schema Information
Instead of a static schema reference, check:
1. **GROQ queries** in `/src/services/sanityService.ts` - Shows actual fields being fetched
2. **Component files** in `/src/components/` - Shows how data is used
3. **TypeScript types** in `/src/types/sanity.ts` - Shows expected structures

### Common Tasks
- **Creating SEO Pages**: See SEO_PAGE_GENERATION.md
- **Understanding Schemas**: Check GROQ queries in sanityService.ts
- **Price Calculations**: See ELECTRICITY-CALCULATOR-LOGIC.md
- **Using MCP Servers**: See development/using-mcp-servers.md