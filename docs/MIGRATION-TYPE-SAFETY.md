# HomePage to UnifiedPage Migration - Type Safety Documentation

## Overview

This document covers Phase 1.5 of the homepage unification migration, which establishes type safety and backward compatibility for migrating from separate `homePage` and `page` schemas to a unified `page` schema.

## Type Architecture

### UnifiedPage Interface

The `UnifiedPage` interface combines both `HomePage` and `SanityPage` types:

```typescript
// src/types/sanity.ts
export interface UnifiedPage extends Omit<HomePage, '_type'>, Omit<SanityPage, '_type' | 'slug'> {
  _type: 'page'
  isHomepage?: boolean
  slug?: SanitySlug // Optional since homepage won't have it
  parent?: {
    _ref: string
    _type: 'reference'
  }
}
```

Key features:
- Extends both original types for full compatibility
- Removes conflicting `_type` fields
- Makes `slug` optional (homepage doesn't need one)
- Adds `isHomepage` boolean flag

### Type Conversion Service

The `UnifiedPageService` provides type-safe conversions:

```typescript
// src/services/unifiedPageService.ts
export class UnifiedPageService {
  // Convert legacy HomePage to UnifiedPage
  static homePageToUnified(homePage: HomePage): UnifiedPage
  
  // Convert SanityPage to UnifiedPage
  static sanityPageToUnified(page: SanityPage): UnifiedPage
  
  // Type guards
  static isHomePage(page: any): page is HomePage
  static isUnifiedPage(page: any): page is UnifiedPage
  static isUnifiedHomepage(page: UnifiedPage): boolean
  
  // Normalize any page type to UnifiedPage
  static normalizeToUnified(page: HomePage | SanityPage | UnifiedPage | null): UnifiedPage | null
}
```

## Migration Helpers

### GROQ Query Helpers

```typescript
// sanityelpriscms/scripts/utils/migrationHelpers.ts

// Works with both schemas during migration
export const getHomePageQuery = () => {
  return `*[_type in ["homePage", "page"] && (isHomepage == true || _type == "homePage")][0]`
}

// Unified query for any page
export const getUnifiedPageQuery = (slug?: string) => {
  if (!slug) return getHomePageQuery()
  return `*[_type == "page" && slug.current == $slug][0]`
}
```

### Backward-Compatible Service Methods

The `SanityService` now includes unified methods that work with both schemas:

```typescript
// src/services/sanityService.ts

// Fetch homepage with automatic fallback
static async getUnifiedHomePage(): Promise<UnifiedPage | null> {
  // Try new schema first
  let page = await client.fetch(`*[_type == "page" && isHomepage == true][0]`)
  
  // Fall back to legacy if not found
  if (!page) {
    const legacyPage = await this.getHomePage()
    if (legacyPage) {
      page = UnifiedPageService.homePageToUnified(legacyPage)
    }
  }
  
  return page
}

// Fetch any page (homepage or regular)
static async getUnifiedPage(slug?: string): Promise<UnifiedPage | null>
```

## Migration Path

### Phase 1 ✅ (Complete)
- Added `isHomepage` field to page schema
- Made slug conditionally required
- Updated preview to show homepage indicator

### Phase 1.5 ✅ (Current - Complete)
- Created UnifiedPage TypeScript interface
- Built type conversion service
- Added backward-compatible query methods
- Verified type safety with build

### Phase 2 (Next)
- Migrate homepage content to new page document
- Set `isHomepage: true` on migrated page
- Keep legacy homepage for rollback

### Phase 3
- Update frontend components to use unified methods
- Replace `getHomePage()` with `getUnifiedHomePage()`
- Update routing logic

### Phase 4
- Update all 49 scripts that reference homePage type
- Use migration helpers for dual-schema support

### Phase 5
- Remove homePage schema from Sanity
- Delete legacy TypeScript types
- Remove backward compatibility code

## Usage Examples

### Frontend Components

```typescript
// Before (Phase 3 will update this)
const homepage = await SanityService.getHomePage()

// After
const homepage = await SanityService.getUnifiedHomePage()
```

### Type-Safe Conversions

```typescript
// Handle any page type
const page = await fetchSomePage() // Could be HomePage or SanityPage
const unified = UnifiedPageService.normalizeToUnified(page)

if (unified && UnifiedPageService.isUnifiedHomepage(unified)) {
  // Handle homepage-specific logic
}
```

### URL Generation

```typescript
const url = UnifiedPageService.getCanonicalUrl(page, 'https://elportal.dk')
// Returns: https://elportal.dk for homepage
// Returns: https://elportal.dk/about for regular pages
```

## Testing

Run type compatibility tests:

```bash
npm run build  # Verify TypeScript compilation
npx tsx scripts/test-unified-types-simple.ts  # Test runtime compatibility
```

## Files Modified in Phase 1.5

1. `/src/types/sanity.ts` - Added UnifiedPage interface
2. `/sanityelpriscms/scripts/utils/migrationHelpers.ts` - Created migration utilities
3. `/src/services/unifiedPageService.ts` - Created type conversion service
4. `/src/services/sanityService.ts` - Added unified methods
5. `/scripts/test-unified-types-simple.ts` - Created verification script

## Notes

- All changes are backward compatible
- No data migration happens in this phase
- Frontend continues to work unchanged
- Type safety ensures smooth migration in later phases