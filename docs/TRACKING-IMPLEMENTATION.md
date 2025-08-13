# DinElportal Tracking Implementation Guide

## Current Status: ✅ PRODUCTION READY

The universal tracking script is fully implemented and tested. Partners can integrate in 5 minutes with just one line of code.

## Quick Start for Partners

### One-Line Integration

Add this single line to your website's `<head>` section:

```html
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_PARTNER_ID" async></script>
```

That's it! The script automatically:
- Captures `click_id` from URL parameters
- Stores tracking data across multiple storage methods
- Detects conversion pages automatically
- Provides fallback device fingerprinting
- Handles all edge cases

### Live Testing Example (mondaybrew test site)

```html
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=mondaybrew" async></script>
```

*Note: mondaybrew.dk is our test integration site, not an actual partner.*

## Testing URLs & Dashboards

### Public Testing Pages

| URL | Purpose | Description |
|-----|---------|-------------|
| [`/partner-test.html`](https://www.dinelportal.dk/partner-test.html) | Partner Integration Test | Standalone HTML page simulating partner site |

### Admin Dashboards

| URL | Purpose | Access |
|-----|---------|--------|
| [`/admin/dashboard`](https://www.dinelportal.dk/admin/dashboard) | Main Admin Dashboard | Protected (auth required) - Shows all tracking metrics, partner performance, and conversion data |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| [`/api/tracking/universal.js`](https://www.dinelportal.dk/api/tracking/universal.js?partner_id=test&debug=true) | GET | Serve tracking script |
| `/api/tracking/log` | POST | Receive tracking events |
| `/api/track-click` | POST | Track outbound clicks |
| `/api/track-conversion` | POST | Webhook for conversions |
| `/api/track-pixel` | GET | Tracking pixel endpoint |
| [`/api/tracking/config/[partnerId]`](https://www.dinelportal.dk/api/tracking/config/vindstod) | GET | Partner configuration |

### Testing Tools

| File | Location | Purpose |
|------|----------|---------|
| `test-universal-playwright.ts` | `/scripts/` | Automated testing with Playwright |
| `test-mondaybrew-integration.ts` | `/scripts/` | Test mondaybrew.dk integration |
| `test-mondaybrew-detailed.ts` | `/scripts/` | Detailed debugging for mondaybrew |
| `check-mondaybrew-html.ts` | `/scripts/` | Check HTML for script presence |

## How The Universal Script Works

### 1. Automatic Click Tracking
When a user arrives at a partner site with a DinElportal link:
```
https://partner-site.dk?click_id=dep_abc123xyz
```

The script automatically:
1. Captures the `click_id` parameter
2. Stores it in localStorage, sessionStorage, and cookies
3. Creates a device fingerprint as fallback
4. Sends tracking data to our API

### 2. Data Persistence Strategy
- **Triple Storage**: localStorage + sessionStorage + cookies
- **90-day retention**: Matches industry standard attribution window
- **Cross-domain support**: Works across subdomains
- **Fallback tracking**: Device fingerprinting when storage blocked

### 3. Automatic Conversion Detection
The script automatically detects conversion pages by URL patterns:
- `/tak`, `/thank-you`, `/thanks`
- `/bekraeftelse`, `/confirmation`, `/success`
- `/velkommen`, `/welcome`, `/complete`
- `/gennemfoert`, `/complete`

### 4. Manual API (Optional)

The script provides `window.DinElportal` for manual control:

```javascript
// Track conversion manually
window.DinElportal.trackConversion({
  conversion_type: 'signup',
  conversion_value: 299
});

// Get tracking data
const data = window.DinElportal.getTrackingData();
console.log('Click ID:', data.click_id);

// Check if user came from DinElportal
if (window.DinElportal.getTrackingData()) {
  console.log('User referred by DinElportal');
}

// Debug mode
window.DinElportal.debug(true);

// Clear all tracking data
window.DinElportal.clearData();

// Get/set configuration
const config = window.DinElportal.getConfig();
window.DinElportal.setConfig({ debug: true });
```

## Implementation Architecture

### Components Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   DinElportal   │────▶│Partner Site  │────▶│  Conversion │
│   (Your site)   │     │(partner.dk)  │     │   Tracking  │
└─────────────────┘     └──────────────┘     └─────────────┘
        │                       │                     │
        ▼                       ▼                     ▼
   Generate ID            Capture & Store         Send Data
   dep_abc123            via Universal.js      to /api/log
```

### File Structure

```
/api/tracking/
├── universal.js.ts      # Serves the universal tracking script
├── log.ts              # Receives tracking data
└── config/
    └── [partnerId].ts  # Partner-specific configurations

/public/
├── partner-test.html   # Standalone test page for partners
└── tracking/
    ├── universal.js        # Main tracking script (development)
    ├── universal.min.js    # Production version (minified)
    └── universal-compiled.js # Alternative compiled version

/src/
├── components/
│   └── tracking/
│       └── TrackedLink.tsx  # Component for tracked outbound links
└── pages/
    └── admin/
        └── AdminDashboard.tsx # Admin dashboard

/scripts/
├── test-universal-playwright.ts  # Automated browser testing
├── test-mondaybrew-integration.ts # mondaybrew integration test
├── test-mondaybrew-detailed.ts # Detailed mondaybrew debugging
├── test-mondaybrew-console.ts # Console monitoring test
├── check-mondaybrew-html.ts # HTML inspection tool
└── build-universal.ts # Build script for universal.js
```

## GDPR Compliance

### What We Track (No Consent Required)
- **Click IDs**: Anonymous identifiers (no PII)
- **Timestamps**: When clicks/conversions occur
- **Partner IDs**: Which partner received traffic
- **Device Fingerprints**: Anonymous browser characteristics
- **Session IDs**: Temporary session identifiers

### What We DON'T Track Without Consent
- IP addresses
- User accounts
- Personal information
- Cross-site behavior
- Marketing pixels

### Compliance Features
- ✅ No personal data collection
- ✅ Respects Do Not Track header
- ✅ 90-day automatic data expiry
- ✅ Transparent tracking (debug mode available)
- ✅ Works with all privacy settings

## Testing the Integration

### 1. Test Mode
Add `&debug=true` to see console logs:
```html
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID&debug=true" async></script>
```

### 2. Using the Partner Test Page
Visit: https://www.dinelportal.dk/partner-test.html?click_id=test_123

This page:
- Shows real-time tracking status
- Displays captured click_id
- Shows if DinElportal API loaded
- Provides debug console
- Tests conversion tracking

### 3. Verify Tracking in Console
Open browser console and check:
```javascript
// Check if API loaded
console.log(window.DinElportal);
// Output: {trackConversion: ƒ, getTrackingData: ƒ, clearData: ƒ, ...}

// Check tracking data
console.log(window.DinElportal.getTrackingData());
// Output:
{
  click_id: "dep_xxx",
  fingerprint: "fp_yyy",
  session_id: "sess_zzz",
  page_url: "https://...",
  referrer: "",
  timestamp: 1755112470480,
  user_agent: "Mozilla/5.0..."
}
```

### 4. Test Conversion
Manually trigger a test conversion:
```javascript
window.DinElportal.trackConversion({
  conversion_type: 'test',
  conversion_value: 100
}).then(result => {
  console.log('Conversion tracked:', result);
});
```

### 5. Automated Testing
Run Playwright tests locally:
```bash
# Test universal script loading
npx tsx scripts/test-universal-playwright.ts

# Test mondaybrew integration
npx tsx scripts/test-mondaybrew-integration.ts

# Detailed debugging
npx tsx scripts/test-mondaybrew-detailed.ts
```

## Partner Onboarding Checklist

- [ ] **Partner ID assigned** (e.g., "vindstod", "andelenergi")
- [ ] **Provide integration guide** (this document)
- [ ] **Share test URL**: https://www.dinelportal.dk/partner-test.html
- [ ] **Script tag added** to partner's website header
- [ ] **Test with debug mode** to verify loading
- [ ] **Check data capture** with test click_id
- [ ] **Test conversion tracking** on thank you page
- [ ] **Verify in admin dashboard**: /admin/tracking
- [ ] **Go live** by removing debug parameter

## Current Partners & Test Sites

| Partner/Site | Status | Integration Type | Partner ID | Notes |
|--------------|--------|-----------------|------------|-------|
| mondaybrew | ✅ Test Site | Universal Script | `mondaybrew` | Test integration site (not a real partner) |
| Vindstød | 🚧 Testing | Webhook + Script | `vindstod` | Primary partner |
| Andelenergi | 📋 Planned | TBD | `andelenergi` | Future partner |

## Troubleshooting

### Script Not Loading
1. Check for typos in partner_id
2. Ensure script tag is properly closed: `</script>`
3. Verify script is in `<head>` section
4. Check browser console for errors
5. Test at: https://www.dinelportal.dk/partner-test.html

### Data Not Persisting
1. Check if cookies are enabled
2. Try different browser/incognito mode
3. Enable debug mode to see storage attempts
4. Check localStorage quota
5. Verify no browser extensions blocking storage

### Conversions Not Tracking
1. Verify click_id exists in tracking data
2. Check if conversion page URL matches patterns
3. Ensure script loaded before conversion
4. Check network tab for API calls to `/api/tracking/log`
5. Look for 403 errors (rate limiting)

### Common Error Messages
- **"Tracking script not available"** - Missing universal.min.js file (now fixed)
- **403 on /api/tracking/log** - Rate limiting or authentication (expected)
- **"Named entity expected"** - HTML encoding issue, use `&amp;` instead of `&`

## Technical Implementation Details

### Click ID Format
```
dep_[timestamp]_[random]
Example: dep_meac2b99_80nonoem4sn
```

### Storage Keys
- `dinelportal_click_id` - The click identifier
- `dinelportal_fp` - Device fingerprint
- `dinelportal_session` - Session ID
- `dinelportal_data` - Complete tracking data object

### API Response Codes
- **200** - Success
- **403** - Rate limited or unauthorized
- **405** - Method not allowed
- **500** - Server error

## Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build universal script
npm run build:universal

# Run tests
npm test
```

### Deployment
- Automatic via GitHub push to main branch
- Deploys to Vercel
- Usually takes 1-2 minutes
- Check status at: https://vercel.com/dashboard

## Technical Support

For integration support or questions:
- Technical issues: Create issue in GitHub repo
- Test the integration: https://www.dinelportal.dk/partner-test.html
- Check tracking data: https://www.dinelportal.dk/admin/tracking
- API documentation: See inline code comments in `/api/tracking/`

## Next Steps

### Phase 1: ✅ COMPLETED
- Universal tracking script implemented
- Test site (mondaybrew) successfully integrated
- API endpoints working
- Data persistence verified
- All test pages created

### Phase 2: 🚧 IN PROGRESS
- Vindstød production integration
- Enhanced conversion webhook
- Admin dashboard improvements
- Revenue tracking implementation

### Phase 3: 📋 PLANNED
- Google Analytics integration
- Multiple partner onboarding
- A/B testing framework
- Advanced attribution models
- Automated reporting

---

*Last Updated: August 2025*
*Version: 1.0.0*
*Test Site: mondaybrew.dk*