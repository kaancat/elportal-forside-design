# Tracking Reference (Partner Stack)

This document is the canonical spec for DinElportal’s partner tracking.

## Universal Script

Serve the client script with partner configuration:

```
GET /api/tracking/universal.js?partner_id=ID&...
```

Supported query parameters:
- `partner_id` (required)
- Statisk tak‑side:
  - `thank_you=/path` (single) or
  - `conversion_patterns=["/path1","/path2"]` (JSON array)
  - `match_mode=exact|startsWith|contains` (default `contains`)
- Dynamisk (ingen tak‑side):
  - `auto_conversion=false`
  - `url_contains=["needle1","needle2"]` (JSON array; matches path+query+hash)
  - `text_contains=["phrase1","phrase2"]` (JSON array; scans visible text)
- Optional:
  - `click_param` (default `click_id`), `cookie_days` (default `90`), `debug=true|false`

Behavior in the client (universal-simple.js):
- Captures `click_id` on landing and stores in cookie + localStorage + sessionStorage.
- Auto-detects conversions per config:
  - Statisk: matches current pathname to patterns using `match_mode`.
  - Dynamisk: evaluates `url_contains` and `text_contains`; fires once per path.
- Monitors SPA route changes to re‑evaluate detection.

## Event Transport

Client uses a 1×1 pixel GET to avoid CORS issues:

```
GET /api/tracking/pixel?partner_id=…&event_type=track|conversion&click_id=…&url=…&t=…
```

Server behavior:
- Validates `Referer` against partner `domain_whitelist` and active status (prevents off‑domain spam).
- Stores recent events (7 days) and daily counters (30 days), dedupes conversions by `click_id`.

## Logging API (server‑side clients)

```
POST /api/tracking/log
{
  "type": "track" | "conversion",
  "partner_id": "…",
  "partner_domain": "…",
  "data": {
    "click_id": "dep_*",
    "session_id": "…",
    "page_url": "…",
    "timestamp": 1699999999999,
    "conversion_value": 0,
    "conversion_type": "purchase"
  }
}
```

Server validates partner (active + domain whitelist), rate‑limits, stores event, dedupes conversion. On first‑time conversions, a GA4 Measurement Protocol `partner_conversion` is sent (analytics only).

## Verification API

```
GET /api/tracking/verify?partner_id=ID
```

Returns recent events (up to 10), `total_events_today`, and `tracking_status` (active|inactive|no_data). Used by Partner Platform “Live Status”.

## Partner Configuration API (admin)

- `GET /api/tracking/config/{partner_id}` (sanitized)
- `POST|PUT /api/tracking/config/{partner_id}` with `x-admin-auth: ADMIN_AUTH_TOKEN`

Key fields:
- `domain_whitelist`: ["example.dk","www.example.dk","*.example.dk"]
- `metadata.status`: `active|paused|suspended` (only active partners accept events)

## Security Notes

- Both `/log` and `/pixel` enforce domain whitelisting (see `docs/SECURITY.md`).
- No PII is collected; attribution keyed by anonymized `click_id`.
- 90‑day attribution window.

## GA4 / Google Ads

See `docs/tracking/GA4-ADS.md` for how we report to GA4 and import `partner_click` into Ads.

