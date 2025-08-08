# Dev Log

## 2025-08-08 – Update
Goal: Fix empty-looking select fields in desktop comparison table

- Adjusted desktop select trigger styles in `src/components/RealPriceComparisonTable.tsx` to ensure placeholder and text are visible on light theme (`text-brand-dark` and `placeholder:text-gray-600`).
- Impact: Prevents an apparent "empty white bar" on desktop by making the select content clearly visible when no provider is chosen. Mobile cards were already fine.
- TODO: Consider auto-selecting first two providers after fetch to reduce empty state friction.

## 2025-08-07 – Update
Goal: Align FE schemas with Studio and elevate PageSection visuals

- Implemented runtime Zod validation for UnifiedPage and contentBlocks to filter invalid blocks and log schema mismatches.
- Synced frontend Zod/TS types with Studio: faqGroup (uses faqItems), heroWithCalculator.highlightWords, extended fields for consumptionMap, declarationProduction, declarationGridmix, providerList, energyTipsSection defaultCategory.
- Updated FAQ extraction to support both faqItems and legacy items in `Index.tsx` and `GenericPage.tsx`.
- Upgraded `PageSectionComponent` visuals (enterprise polish): heading accent underline, subtle theme-aware background depth overlay, premium image treatment, pill CTA, fullWidth support, and preserved all Sanity-driven settings (theme, padding, text alignment, separator, sticky, layout).

- Impact: More resilient runtime rendering (invalid blocks no longer break pages), FE <-> Studio schema drift reduced, and improved perceived quality for the most common content section without requiring Studio changes.

- NOTE: `npm run lint` currently hits an upstream plugin issue in `react-hooks/exhaustive-deps` on `src/utils/inpOptimization.ts`. Type-check is green. Proceeding with push to allow visual review.

- TO VERIFY:
  - Pages with `faqGroup` render FAQs and SEO structured data as expected.
  - Visual polish in `PageSectionComponent` matches brand expectations across themes.
  - Optional: decide whether to add Studio toggles for enabling/disabling visual flourishes.
