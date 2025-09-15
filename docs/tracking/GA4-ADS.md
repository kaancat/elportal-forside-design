# GA4 & Google Ads Integration

Two signals are produced by DinElportal:

## 1) partner_click (client → GA4 → Ads)

- Fired client‑side on outbound partner clicks from DinElportal.
- In GA4: mark `partner_click` as a conversion.
- In Google Ads: link GA4 and import the `partner_click` conversion. This becomes the ad‑optimizable signal.

Event parameters (example):
- `partner_name`, `click_id`, `page`, `component`, `region`, `value`

## 2) partner_conversion (server → GA4 Measurement Protocol)

- Fired server‑side on the first time we log a partner conversion (deduped by `click_id`).
- Purpose: analytics in GA4 (not directly ad‑attributable).
- Configuration (env): `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`.
- Identity: `user_id = click_id`, synthetic `client_id`, `event_id` for dedupe.

Payload params:
- `partner_id`, `click_id`, `value`, `currency: DKK`, `timestamp_micros`, `engagement_time_msec: 1`.

## Offline Ads conversions (optional, later)

If you want Google Ads to optimize on downstream partner conversions, capture `gclid` on DinElportal and upload offline conversions to Ads matching by `gclid`. This is not part of the default flow and can be added later.

