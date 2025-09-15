# Active Scripts (Source of Truth)

Updated: 2025‑09‑15

Only the scripts below are considered “active”. Legacy/experimental scripts were removed from the working tree; use git history if you need them.

## Active

- `generate-sitemap.ts` — Generate sitemap.xml for SEO
- `check-navigation-health.ts` — Verify navigation structure integrity
- `force-navigation-refresh.ts` — Force CDN cache refresh for navigation
- `test-api-parity.ts` — Sanity/endpoint parity checks (optional)

Run via tsx:
```bash
npx tsx scripts/<name>.ts
```

## Removed / Not used (see git history)

- `pw-*.ts` Playwright utilities (compare, verify-prices, capture, historiske)
- `test-all-pages.ts`, `test-middleware.ts`, `test-webhook-revalidation.ts`
- `monitor-webhook-health.ts`, `internal-linking.ts`, `seo/audit-sitemap.ts`
- `debug-sanity-elprisberegner.ts`, `inspect-homepage.ts`, `remove-ladeboks.ts`
