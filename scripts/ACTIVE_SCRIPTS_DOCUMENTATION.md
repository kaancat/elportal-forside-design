# Active Scripts (Source of Truth)

Updated: 2025‑09‑15

Only the scripts below are considered “active”. Playwright and other legacy/experimental scripts have been moved to `scripts/archive/`.

## Active

- `generate-sitemap.ts` — Generate sitemap.xml for SEO
- `check-navigation-health.ts` — Verify navigation structure integrity
- `force-navigation-refresh.ts` — Force CDN cache refresh for navigation
- `test-api-parity.ts` — Sanity/endpoint parity checks (optional)

Run via tsx:
```bash
npx tsx scripts/<name>.ts
```

## Archived / Not used

Moved to `scripts/archive/`:
- `pw-*.ts` Playwright utilities (compare, verify-prices, capture, historiske)
- `test-all-pages.ts`, `test-middleware.ts`

If you need any of these again, move them back to `scripts/` and document the workflow here.
