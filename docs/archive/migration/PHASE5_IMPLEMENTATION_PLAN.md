# [Archived] Phase 5: Client-Only Components - Implementation Plan

## Executive Summary
Phase 5 focuses on properly isolating client-side components to prevent hydration errors while maintaining SSR benefits for SEO. This requires systematic identification and marking of browser-dependent components with 'use client' directive or dynamic imports with ssr:false.

## Current State Analysis

### Components Requiring Client Marking
**11 Recharts-based components identified:**
- LivePriceGraphComponent
- CO2EmissionsChart / CO2EmissionsChartSimple
- MonthlyProductionChart
- RenewableEnergyForecast
- DeclarationProductionChart / DeclarationGridmix
- DailyPriceTimeline
- ConsumptionChart (forbrugTracker)
- ConsumptionDashboard (multiple variants)
- ImprovedConsumptionDashboard / EnhancedConsumptionDashboard

**20+ Browser API-dependent components:**
- PriceCalculatorWidget (localStorage, window)
- ForbrugTracker (sessionStorage, window)
- AddressAutocomplete (navigator)
- ConsumptionMap (window for map)
- MobileNav (window for responsive)
- ReadingProgress (window scroll)
- ScrollToTop (window scroll)
- TrackedLink (window events)
- ThirdPartyFuldmagt (localStorage)
- ErrorBoundary (window error events)

### Current Implementation State
- ClientContentBlocks.tsx already uses dynamic imports with ssr:false ✅
- ServerContentBlocks.tsx handles SSR-safe content ✅
- NO components have 'use client' directive yet ❌
- Components still import React hooks directly ⚠️

## Implementation Strategy

### Risk Mitigation Approach

#### 1. Three-Tier Component Classification
```
Tier 1: Pure Server Components (No changes needed)
- Static content blocks
- SEO metadata components
- Simple presentational components

Tier 2: Hybrid Components (Need careful handling)
- ProviderList (can be SSR with client interactivity)
- Navigation (SSR structure, client menu)
- Footer (SSR links, client tracking)

Tier 3: Pure Client Components (Must be client-only)
- All chart components (Recharts)
- Calculator widgets
- Interactive dashboards
- Browser API consumers
```

#### 2. Implementation Pattern Hierarchy

**Pattern A: Dynamic Import with SSR False (PREFERRED for charts)**
```typescript
// In ContentBlocks or page components
const LivePriceGraph = dynamic(
  () => import('@/components/LivePriceGraphComponent'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
)
```

**Pattern B: Use Client Directive (for simpler components)**
```typescript
'use client'
// Component that uses hooks but no heavy libraries
```

**Pattern C: Hybrid Approach (for complex components)**
```typescript
// ServerShell.tsx - No directive
export function ChartContainer({ title, description }) {
  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <p>{description}</p>
      <ChartClient />
    </div>
  )
}

// ChartClient.tsx
'use client'
export function ChartClient() {
  // Interactive chart logic
}
```

### Hydration Error Prevention

#### Common Hydration Mismatch Sources
1. **Date/Time rendering** - Use consistent timezone
2. **Random values** - Move to useEffect
3. **localStorage checks** - Wrap in useEffect
4. **Window dimensions** - Initialize with defaults
5. **User preferences** - Use suspense boundaries

#### Prevention Patterns
```typescript
// BAD - Causes hydration mismatch
const [width, setWidth] = useState(window.innerWidth)

// GOOD - Safe initialization
const [width, setWidth] = useState(1024) // Default
useEffect(() => {
  setWidth(window.innerWidth)
}, [])
```

## Step-by-Step Implementation

### Phase 5.1: Audit & Classification
1. Create component inventory spreadsheet
2. Classify each component (Tier 1/2/3)
3. Identify hydration risk points
4. Document SSR requirements per component

### Phase 5.2: Chart Components Migration
1. **Keep existing dynamic imports in ClientContentBlocks**
2. **Add 'use client' to source components**:
   ```typescript
   // src/components/LivePriceGraphComponent.tsx
   'use client'
   import React from 'react'
   import { LineChart, ... } from 'recharts'
   ```
3. **Create SSR shells for SEO**:
   ```typescript
   // src/components/LivePriceGraphShell.tsx (no directive)
   export function LivePriceGraphShell({ title, description }) {
     return (
       <div className="price-graph-container">
         <h2>{title}</h2>
         <p>{description}</p>
         <div className="chart-placeholder h-[400px]" />
       </div>
     )
   }
   ```

### Phase 5.3: Calculator & Interactive Components
1. **Mark with 'use client'**:
   - PriceCalculatorWidget
   - ApplianceCalculator
   - ForbrugTracker components
2. **Fix localStorage/sessionStorage usage**:
   ```typescript
   'use client'
   const [savedData, setSavedData] = useState(null)
   
   useEffect(() => {
     const stored = localStorage.getItem('calculator-data')
     if (stored) setSavedData(JSON.parse(stored))
   }, [])
   ```

### Phase 5.4: Navigation & Layout Components
1. **Split server/client parts**:
   ```typescript
   // Navigation.tsx (server)
   export function Navigation({ links }) {
     return (
       <nav>
         <NavigationLinks links={links} />
         <MobileMenuClient />
       </nav>
     )
   }
   
   // MobileMenuClient.tsx
   'use client'
   export function MobileMenuClient() {
     // Mobile menu with useState
   }
   ```

### Phase 5.5: Error Boundaries & Monitoring
1. **Convert error boundaries**:
   ```typescript
   'use client'
   export function ErrorBoundary({ children }) {
     // Error boundary logic
   }
   ```
2. **Keep error logging server-compatible**

## Testing Strategy

### Unit Testing
```typescript
// __tests__/components/client-marking.test.ts
describe('Client Component Marking', () => {
  it('should have use client directive', () => {
    const content = fs.readFileSync('LivePriceGraphComponent.tsx')
    expect(content).toMatch(/^'use client'/)
  })
})
```

### Hydration Testing
```typescript
// playwright/hydration.spec.ts
test('no hydration errors on homepage', async ({ page }) => {
  const errors = []
  page.on('console', msg => {
    if (msg.text().includes('Hydration')) errors.push(msg)
  })
  await page.goto('/')
  expect(errors).toHaveLength(0)
})
```

### SSR Content Verification
```bash
# Verify SSR content without JS
curl http://localhost:3000 | grep -E "<h1>|<h2>|<p>"
# Should show headings and text content
```

## Success Criteria

### Must Have (Phase 5 Complete)
- [ ] Zero hydration errors in console
- [ ] All Recharts components work
- [ ] Calculators fully functional
- [ ] SSR content visible in view-source
- [ ] No performance regression

### Should Have
- [ ] Loading skeletons match final layout
- [ ] Smooth progressive enhancement
- [ ] Error boundaries catch client errors
- [ ] Monitoring for client-side errors

### Nice to Have
- [ ] Lazy loading for below-fold charts
- [ ] Intersection observer for chart init
- [ ] Reduced JavaScript bundle size
- [ ] Improved Core Web Vitals

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Hydration errors | High | High | Systematic testing, proper initialization |
| Bundle size increase | Medium | Medium | Code splitting, dynamic imports |
| SEO content loss | Low | High | SSR shells, server components |
| Performance degradation | Medium | Medium | Lazy loading, progressive enhancement |
| Browser compatibility | Low | Low | Polyfills, feature detection |

## Rollback Plan

### If Critical Issues Occur:
1. **Immediate**: Set NEXT_PUBLIC_PHASE2_SSR=false (reverts to SPA)
2. **Quick Fix**: Remove 'use client' directives
3. **Nuclear**: Git revert to Phase 4 commit

### Monitoring Signals:
- Sentry error rate > 1%
- Hydration errors in production
- Core Web Vitals regression > 10%
- User complaints about functionality

## Implementation Order

### Priority 1: Critical Path Components
1. LivePriceGraphComponent (homepage)
2. PriceCalculatorWidget (main CTA)
3. ProviderList (conversion path)

### Priority 2: Supporting Components
4. CO2EmissionsChart
5. RenewableEnergyForecast
6. MonthlyProductionChart
7. DailyPriceTimeline

### Priority 3: Enhancement Components
8. ForbrugTracker suite
9. ConsumptionMap
10. DeclarationCharts
11. Utility components

## Code Organization

```
src/components/
├── charts/                    # All chart components
│   ├── client/               # 'use client' versions
│   │   ├── LivePriceGraph.tsx
│   │   └── CO2Chart.tsx
│   └── shells/               # SSR shells for SEO
│       ├── LivePriceGraphShell.tsx
│       └── CO2ChartShell.tsx
├── calculators/              # Interactive calculators
│   └── client/              # All with 'use client'
└── layout/                  # Navigation, footer, etc
    ├── Navigation.tsx       # Server component
    └── client/             # Client parts
        └── MobileMenu.tsx
```

## Validation Checklist

### Pre-Implementation
- [ ] All components audited
- [ ] Risk assessment complete
- [ ] Testing environment ready
- [ ] Rollback plan confirmed

### During Implementation
- [ ] Each component tested individually
- [ ] Hydration errors checked
- [ ] SSR content verified
- [ ] Bundle size monitored

### Post-Implementation
- [ ] Full regression test
- [ ] Performance benchmarks
- [ ] SEO audit
- [ ] Production smoke test

## Summary

Phase 5 requires careful, systematic migration of client components with three key principles:
1. **Preserve SSR benefits** - Use shells and progressive enhancement
2. **Prevent hydration errors** - Proper initialization and boundaries
3. **Maintain functionality** - Test everything, rollback ready

The approach prioritizes stability over speed, with comprehensive testing at each step and multiple rollback options.
