# ElPortal Multi-Project Workspace

## Project Structure

This workspace manages two interconnected projects:

### 1. elportal-forside-design (Frontend)
- **Path**: `/Users/kaancatalkaya/Desktop/projects/elportal-forside-design`
- **Tech Stack**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Purpose**: User-facing web application
- **Key Features**: Real-time price graphs, interactive calculator, provider comparison

### 2. sanityelpriscms (CMS Backend)
- **Path**: `/Users/kaancatalkaya/Desktop/projects/sanityelpriscms`
- **Tech Stack**: Sanity Studio v3 with 23+ custom schemas
- **Purpose**: Headless CMS for all content management
- **Access**: https://dinelportal.sanity.studio

## Critical Synchronization Points

### 1. Content Block Schemas
- **Sanity Schema**: `/sanityelpriscms/schemaTypes/`
- **Frontend Components**: `/elportal-forside-design/src/components/ContentBlocks.tsx`
- **Safe Renderer**: `/elportal-forside-design/src/components/SafeContentBlocks.tsx`

**IMPORTANT**: When adding new content blocks:
1. Define schema in Sanity first
2. Deploy to Sanity Studio
3. Update BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx
4. Update TypeScript interfaces
5. Test end-to-end

### 2. Type Definitions
- **Generated Types**: `/elportal-forside-design/src/lib/sanity-schemas.zod.ts`
- **Sanity Schemas**: `/sanityelpriscms/schemaTypes/`
- **Sync Command**: `npm run generate:types` (in frontend)

### 3. API Integration
- **Project ID**: yxesi03x
- **Dataset**: production
- **API Version**: 2025-01-01

## Development Workflow

### Daily Sync Checklist
1. [ ] Check for Sanity schema changes
2. [ ] Regenerate TypeScript types if schemas changed
3. [ ] Update component renderers for new content blocks
4. [ ] Test content creation in Sanity Studio
5. [ ] Verify frontend rendering

### Making Schema Changes
```bash
# 1. In sanityelpriscms
cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
# Make schema changes
npm run deploy

# 2. In elportal-forside-design
cd /Users/kaancatalkaya/Desktop/projects/elportal-forside-design
# Regenerate types
npm run generate:types
# Update components as needed
```

### Common Tasks

#### Adding a New Content Block
1. Create schema in `/sanityelpriscms/schemaTypes/`
2. Add to index.ts exports
3. Deploy Sanity: `npm run deploy`
4. Create React component in frontend
5. Add to BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx
6. Update GROQ queries
7. Test content creation and rendering

#### Updating Provider Data
1. Edit in Sanity Studio
2. Verify Vindstød ranking logic in frontend
3. Test price calculations

#### Creating SEO Pages
1. Use AI agent with seo-page-creator type
2. Validate against schemas before saving
3. Deploy and test page rendering

## Quick Reference

### Sanity Field Name Mappings (CRITICAL!)
```
hero:
  - headline (NOT title)
  - subheadline (NOT subtitle)
  
valueItem:
  - heading (NOT title)
  - icon (icon.manager object, NOT string)
  
featureItem:
  - title (NOT name)
  - icon (icon.manager object)
```

### Business Logic Reminders
- Vindstød ALWAYS appears first in provider lists
- All prices include 25% VAT
- Use Danish language for all content
- Regional differences: DK1 (West) and DK2 (East)

## Troubleshooting

### Schema Validation Errors
1. Check actual schema files in `/sanityelpriscms/schemaTypes/` 
2. Verify field names match exactly (valueProposition uses `heading/valueItems` NOT `title/items`)
3. Ensure icon fields use icon.manager objects with proper metadata
4. Check required vs optional fields

### Type Mismatches
1. Regenerate types after schema changes
2. Check for stale TypeScript definitions
3. Verify GROQ query projections

### Content Not Rendering
1. Check if component is in BOTH ContentBlocks renderers
2. Verify GROQ query includes new fields
3. Check for TypeScript errors
4. Test in Sanity Studio preview

## Project Commands

### Frontend (elportal-forside-design)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Run TypeScript checks
npm run generate:types # Generate Sanity types
```

### CMS (sanityelpriscms)
```bash
npm run dev          # Start Sanity Studio locally
npm run deploy       # Deploy schema changes
npm run build        # Build Studio for production
```

## Environment Variables

### Frontend (.env)
```
VITE_SANITY_PROJECT_ID=yxesi03x
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2025-01-01
```

### CMS (.env)
```
SANITY_API_TOKEN=your-token-here
```