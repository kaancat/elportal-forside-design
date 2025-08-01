# HomePage & Page Schema Unification Plan

## Executive Summary

The ElPortal codebase currently maintains two separate schema types for what is essentially the same content structure: `homePage` and `page`. This creates massive code duplication, increased maintenance burden, and confusion. This document provides a comprehensive analysis and migration plan to unify these schemas into a single `page` type.

## Current State Analysis

### Schema Differences

#### HomePage Schema (`/sanityelpriscms/schemaTypes/homePage.ts`)
```typescript
{
  _type: 'homePage',
  fields: [
    title,
    ...extendedSeoFields,
    contentBlocks[]
  ]
}
```

#### Page Schema (`/sanityelpriscms/schemaTypes/page.ts`)
```typescript
{
  _type: 'page',
  fields: [
    title,
    slug,           // ← UNIQUE TO PAGE
    parent,         // ← UNIQUE TO PAGE
    ...extendedSeoFields,
    // DEPRECATED SEO FIELDS (hidden):
    contentGoal,
    generatedAt,
    keywords,
    language,
    seoDescription,
    seoTitle,
    contentBlocks[]
  ]
}
```

### Content Block Differences

**Page Schema is a SUPERSET** - it contains ALL homepage blocks PLUS these additional ones:
- `hero` (basic hero without calculator)
- `regionalComparison`
- `pricingComparison`
- `dailyPriceTimeline`
- `infoCardsSection`

**Note:** Page schema has 26 content blocks vs HomePage's 22 content blocks

### Code Duplication Impact

#### 1. GROQ Query Duplication (`sanityService.ts`)
- `getHomePage()`: 314 lines
- `getPageBySlug()`: 301 lines (now 318 after fix)
- **~85-90% identical content** - differences include:
  - Type filter (`homePage` vs `page`)
  - Slug parameter in page query
  - ~~Missing `heroWithCalculator` block in getPageBySlug~~ (FIXED)
  - Different content block ordering

#### 2. Frontend Components
- `Index.tsx` (homepage): Custom SEO handling, uses `ContentBlocks` (likely with `enableErrorBoundaries={true}`)
- `GenericPage.tsx` (pages): Identical SEO handling, uses `ContentBlocksWithBreadcrumb`
- Both components handle SEO metadata identically

#### 3. TypeScript Types
- Separate interfaces for essentially the same structure
- Duplicated ContentBlock type unions

## Migration Challenges & Edge Cases

### 1. Homepage Routing
**Current**: Homepage is loaded via `SanityService.getHomePage()` at root path `/`
**Challenge**: No slug field on homepage - would need special handling

**Solution Options:**
1. **Special slug**: Give homepage a reserved slug like `home` or `/`
2. **Slug-less pages**: Make slug optional and query by `_id` for homepage
3. **Root page flag**: Add `isHomepage` boolean field

### 2. Parent/Child Relationships
**Current**: Pages can have parent references for hierarchy
**Usage**: Currently unused - breadcrumbs are placeholder only
**Evidence**: GenericPage.tsx line 118 comment: "Add parent page if exists (you might need to fetch this from Sanity)"

**Impact**: Minimal - feature is implemented but not utilized

### 3. SEO Field Migration
**Issue**: Page has deprecated SEO fields from SEO Page Builder
**Solution**: Clean migration that removes deprecated fields

### 4. Page Schema Already Complete
**Reality**: Page schema already contains ALL homepage blocks plus additional ones
**Solution**: No blocks need to be added - page schema is already a superset

### 5. Scripts & Automation
**Current**: 49 scripts specifically target `homePage` type
**Solution**: Update scripts to use unified type with homepage detection

### 6. Missing Document Actions Configuration
**Issue**: `sanity.config.ts` references `resolveDocumentActions` from `./documentActions` which doesn't exist
**Impact**: Migration may fail if document actions are expected to handle homepage-specific behaviors
**Solution**: Either remove the reference from sanity.config.ts or create the missing file with appropriate actions

### 7. Frontend Component Architecture Divergence  
**Issue**: Homepage uses `ContentBlocks` with `enableErrorBoundaries={true}`, while pages use `ContentBlocksWithBreadcrumb`
**Hidden Complexity**: The breadcrumb placement logic (`useBreadcrumbPlacement` hook) is deeply integrated with page rendering
**Solution**: Create a unified component that conditionally handles breadcrumbs based on the `isHomepage` flag

### 8. Navigation Type References
**Issue**: Internal links in mega menus include 'homePage' as a valid `_type` reference
**Impact**: Breaking navigation if type changes without updating all internal link references
**Solution**: Update `InternalLink` interface and all navigation queries to handle unified page type

### 9. Query Performance Implications
**Issue**: Homepage uses array access `[0]` while pages use slug-based lookup
**Risk**: Performance regression if homepage lookup changes from direct array access to conditional query
**Solution**: Create compound index on `_type` + `isHomepage` for optimal query performance

### 10. TypeScript Type Duplication
**Issue**: `HomePage` and `SanityPage` interfaces have different structures but similar content
**Risk**: Type mismatches during migration could cause runtime errors not caught at build time
**Solution**: Create intermediate unified type first, deploy type changes, then migrate data

### 11. Studio Preview Configuration
**Issue**: Potential differences in preview behavior between homepage and regular pages
**Risk**: Content editors may lose familiar preview workflows
**Solution**: Ensure preview configuration in Studio handles both page types identically

### 12. Error Boundary Behavior
**Issue**: Homepage explicitly enables error boundaries while pages don't
**Impact**: Different error handling behavior could confuse users post-migration
**Solution**: Standardize error boundary usage across all page types

## Benefits of Unification

1. **Code Reduction**
   - Eliminate 600+ lines of duplicated GROQ queries
   - Single set of TypeScript types
   - One content rendering path

2. **Maintenance**
   - Single source of truth for page structure
   - No more keeping two schemas in sync
   - Easier to add new content blocks

3. **Flexibility**
   - Homepage could have a slug for better URLs
   - All pages get parent/child support
   - Consistent content editing experience

4. **Future-Proofing**
   - Easier to implement features like:
     - Multi-language support
     - A/B testing
     - Personalization
     - Preview modes

## Critical Bug Fixed (2025-08-01)

**Issue**: `heroWithCalculator` content block was missing from `getPageBySlug()` GROQ query
**Impact**: Pages could not render the calculator hero component, causing potential runtime errors
**Resolution**: Added the missing block definition to getPageBySlug() method
**Status**: ✅ FIXED - Build verified successful

## Migration Strategy

### Phase 1: Schema Preparation
1. ~~Create unified `page` schema with all features~~ (Page schema already has all features)
2. Add `isHomepage` boolean field to page schema
3. Make slug optional (required only when !isHomepage)
4. ~~Include all content blocks from both schemas~~ (Page schema already contains all blocks)

### Phase 1.5: Type Safety Preparation (NEW)
Before schema changes:
1. Create unified TypeScript interface:
```typescript
interface UnifiedPage extends Omit<HomePage, '_type'>, Omit<SanityPage, '_type'> {
  _type: 'page'
  isHomepage?: boolean
}
```
2. Deploy type changes to ensure compile-time safety
3. Update all type imports to use new unified type
4. Create migration helper module:
```typescript
// scripts/utils/migrationHelpers.ts
export const getHomePageQuery = () => {
  // Returns query that works with both schemas during migration
  return `*[_type in ["homePage", "page"] && (isHomepage == true || _type == "homePage")][0]`
}
```

### Phase 2: Data Migration
1. Add rollback metadata field to schema:
```typescript
defineField({
  name: '_migratedFrom',
  type: 'string',
  hidden: true,
  description: 'Original document ID for rollback purposes'
})
```
2. Create migration script to:
   - Copy homePage data to new page document
   - Set `isHomepage: true`
   - Set `slug: { current: 'home' }` or leave empty
   - Preserve all content and SEO fields
   - Add `_migratedFrom` field for rollback support
   - DO NOT delete original homepage document yet

### Phase 3: Frontend Updates
1. Update `sanityService.ts`:
   - Create unified `getPage()` method with fallback support:
   ```typescript
   static async getHomePage() {
     // Try new structure first
     let page = await client.fetch(`*[_type == "page" && isHomepage == true][0]`)
     
     // Fallback to legacy if not found
     if (!page) {
       page = await client.fetch(`*[_type == "homePage"][0]`)
     }
     
     return page
   }
   ```
   - `getPageBySlug()` remains for backwards compatibility

2. Create unified component wrapper:
   ```typescript
   const UnifiedContentBlocks = ({ page, enableBreadcrumbs = true }) => {
     if (page.isHomepage || !enableBreadcrumbs) {
       return <ContentBlocks blocks={page.contentBlocks} enableErrorBoundaries={true} />
     }
     return <ContentBlocksWithBreadcrumb blocks={page.contentBlocks} />
   }
   ```

3. Update routing:
   - Homepage continues to load at `/`
   - Use `isHomepage` flag instead of type check

### Phase 4: Script Updates
1. Audit all 52 scripts
2. Update to use unified page type
3. Use `isHomepage` flag where needed

### Phase 5: Cleanup
1. Remove old `homePage` schema
2. Remove duplicated GROQ queries
3. Update TypeScript types

## Implementation Checklist

### Pre-Migration
- [ ] Backup current Sanity dataset
- [ ] Document all custom homepage behaviors
- [ ] List all scripts that need updating
- [ ] Create rollback plan

### Migration Tasks
- [ ] Create unified page schema
- [ ] Write data migration script
- [ ] Test migration on development dataset
- [ ] Update frontend service layer
- [ ] Update all affected scripts
- [ ] Update TypeScript types
- [ ] Test all page types thoroughly

### Post-Migration
- [ ] Remove deprecated schemas
- [ ] Clean up unused code
- [ ] Update documentation
- [ ] Monitor for issues

## Risk Assessment

### Low Risk
- Parent/child relationships (unused feature)
- SEO field cleanup (hidden fields)
- TypeScript updates (compile-time safety)

### Medium Risk
- Script updates (many files to change)
- Content block availability (need testing)
- Studio preview configuration differences
- Error boundary standardization

### High Risk
- Homepage routing (critical path)
- Data migration (content loss potential)
- GROQ query changes (performance impact)
- Navigation type references breaking
- Query performance degradation
- Reference integrity during migration

### Performance Risks
- **Query Complexity**: Conditional queries may be slower than direct type queries
- **Index Requirements**: New compound indexes needed for optimal performance
- **Cache Invalidation**: CDN cache strategies need updating

### Data Integrity Risks  
- **Reference Integrity**: All internal links must be updated atomically
- **Content Block Validation**: Ensure all block types are properly migrated
- **SEO Field Preservation**: Critical that no SEO data is lost during migration

## Rollback Plan

1. **Immediate**: Revert code changes, homepage continues using old schema
2. **Data**: Keep old homepage document until fully validated
3. **Gradual**: Can run both schemas in parallel during transition

## Timeline Estimate

- **Phase 1**: 2-3 hours (schema prep)
- **Phase 2**: 3-4 hours (migration + testing)
- **Phase 3**: 4-6 hours (frontend updates)
- **Phase 4**: 6-8 hours (script updates)
- **Phase 5**: 2-3 hours (cleanup)

**Total**: 17-24 hours of focused work

## Alternative Approach: Minimal Change

If full unification is deemed too risky, consider:

1. **Keep separate schemas** but extract shared fields
2. **Create shared GROQ fragments** to eliminate query duplication
3. **Unify only the frontend** code paths
4. **Add missing blocks** to homepage incrementally

This would provide 60% of benefits with 20% of risk.

## Recommendation

**Proceed with full unification using page schema** because:

1. Technical debt is significant and growing
2. No functional reason for separation exists
3. Page schema is already a complete superset - no schema changes needed
4. Migration risk is manageable with proper planning
5. Long-term benefits far outweigh short-term risks

The homepage being a separate type is an artificial constraint that complicates the entire system without providing value. Since page schema already contains everything needed, the migration is simpler than originally thought - we just need to convert the homepage document to use the page type.

## Implementation Status

### ✅ Phase 1: Schema Preparation - COMPLETED
- Added `isHomepage` field to page schema
- Validated all required fields are present
- Confirmed page schema is a superset of homepage schema

### ✅ Phase 1.5: Type Safety Preparation - COMPLETED
- Created UnifiedPage interface
- Implemented UnifiedPageService
- Added unified methods to SanityService

### ✅ Phase 2: Data Migration - COMPLETED
- Migrated homepage document to page schema
- Preserved legacy homepage for backward compatibility
- Added migration tracking with `_migratedFrom` field

### ✅ Phase 3: Frontend Updates - COMPLETED
- Updated Index.tsx to use UnifiedPage
- Standardized GenericPage.tsx to use unified approach
- Implemented UnifiedContentBlocks component

### ✅ Phase 4: Address Edge Cases - COMPLETED
- Fixed InternalLink type definition
- Updated navigation reference checks
- Resolved all type mismatches

### ✅ Phase 5: Post-Refactor Cleanup - COMPLETED
- Removed legacy homePage schema from Sanity
- Deleted HomePage TypeScript interfaces
- Cleaned up service layer fallback logic
- Removed all migration scripts
- Standardized all components to use UnifiedPage
- Updated all documentation

## Monitoring & Validation

### Pre-Migration Validation
```typescript
// Validate all homepage references before migration
const validateReferences = async () => {
  const megaMenus = await client.fetch(`*[_type == "megaMenu"]`)
  const invalidRefs = megaMenus.filter(menu => 
    menu.content.some(col => 
      col.items.some(item => 
        item.link?.internalLink?._type === 'homePage'
      )
    )
  )
  return invalidRefs.length === 0
}
```

### Content Validation
```typescript
// Ensure all content blocks are properly migrated
const validateMigration = async () => {
  const oldHome = await client.fetch(`*[_type == "homePage"][0]`)
  const newHome = await client.fetch(`*[_type == "page" && isHomepage == true][0]`)
  
  // Deep comparison excluding expected differences
  const differences = deepDiff(oldHome, newHome, ['_id', '_type', '_migratedFrom', 'isHomepage', 'slug'])
  
  if (differences.length > 0) {
    console.error('Migration validation failed:', differences)
    return false
  }
  return true
}
```

### Performance Monitoring
- Query performance benchmarks (should not exceed 10% degradation)
- SEO meta tag comparison (100% parity required)
- Error rate monitoring (should not increase)
- User journey testing (especially navigation flows)

## Next Steps

1. Review and approve this plan
2. Create detailed task breakdown
3. Set up test environment
4. Begin Phase 1 implementation
5. Validate each phase before proceeding

---

*Document created: 2025-08-01*
*Updated: 2025-08-01 - Added verification findings and fixed critical bug*
*Updated: 2025-08-01 - Added comprehensive edge cases and enhanced migration strategy*
*Updated: 2025-08-01 - Phase 5 completed, all migration work finished*
*Author: AI Assistant with comprehensive codebase analysis*