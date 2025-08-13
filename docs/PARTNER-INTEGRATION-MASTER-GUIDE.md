# DinElportal Partner Integration Master Guide

## 🚀 Quick Start: 5-Minute Integration

Add this ONE line to your website's `<head>` section on ALL pages:

```html
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_PARTNER_ID" async></script>
```

**That's it!** You're now tracking conversions. No backend changes, no webhooks, no complexity.

---

## 📋 Table of Contents

1. [How It Works](#how-it-works)
2. [Integration Methods](#integration-methods)
3. [Testing Your Integration](#testing-your-integration)
4. [Technical Implementation Details](#technical-implementation-details)
5. [Troubleshooting](#troubleshooting)
6. [API Reference](#api-reference)
7. [Contact & Support](#contact--support)

---

## How It Works

### The Complete Flow

```
1. User browses DinElportal → Finds your company → Clicks "Skift til [Partner]"
                                         ↓
2. We generate unique tracking ID: click_id=dep_abc123xyz
                                         ↓
3. User redirects to: partner.dk?click_id=dep_abc123xyz
                                         ↓
4. Your site (with our script) automatically captures & stores the click_id
                                         ↓
5. User signs up/purchases → Script detects conversion automatically
                                         ↓
6. We receive conversion data → Commission tracked → Monthly payout
```

### What Our Script Does Automatically

✅ **Captures tracking parameters** from any page URL  
✅ **Stores persistently** using cookies, localStorage, and sessionStorage  
✅ **Survives navigation** across your entire website  
✅ **Auto-detects conversions** on thank you/success pages  
✅ **Reports to DinElportal** instantly and securely  
✅ **Handles edge cases** like blocked cookies, private browsing  
✅ **GDPR compliant** - no personal data collected  

---

## Integration Methods

### Method 1: Universal Script (RECOMMENDED) ⭐

**Setup Time:** 5 minutes  
**Technical Skill:** None required  
**Reliability:** 99.9%  

#### Basic Implementation

```html
<!-- Add to <head> on ALL pages -->
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_PARTNER_ID" async></script>
```

#### Advanced Configuration (Optional)

```html
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_PARTNER_ID&debug=true&cookie_days=30" async></script>
```

**Available Parameters:**
- `partner_id` (required): Your unique partner identifier
- `debug` (optional): Show console logs for testing (true/false)
- `cookie_days` (optional): Attribution window in days (default: 90)
- `auto_conversion` (optional): Auto-detect conversions (default: true)
- `test` (optional): Test mode - doesn't affect production data

### Method 2: Webhook Integration (Advanced)

**Setup Time:** 1-2 hours  
**Technical Skill:** Backend development required  
**Reliability:** 99%  

If you prefer server-side tracking or need more control:

#### Step 1: Capture click_id

```javascript
// JavaScript example
const clickId = new URLSearchParams(window.location.search).get('click_id');
if (clickId && clickId.startsWith('dep_')) {
    sessionStorage.setItem('dinelportal_click_id', clickId);
}
```

```php
// PHP example
$click_id = $_GET['click_id'] ?? null;
if ($click_id && strpos($click_id, 'dep_') === 0) {
    $_SESSION['dinelportal_click_id'] = $click_id;
}
```

#### Step 2: Send conversion webhook

```javascript
// Send when customer converts
fetch('https://www.dinelportal.dk/api/track-conversion', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'YOUR_SECRET_KEY'
    },
    body: JSON.stringify({
        click_id: 'dep_abc123xyz',
        conversion_time: new Date().toISOString(),
        customer_id: 'cust_123',
        product_selected: 'premium_plan',
        contract_value: 599,
        contract_length_months: 12
    })
});
```

---

## Testing Your Integration

### Step 1: Visit Test Page

Go to: **https://www.dinelportal.dk/partner-test.html**

This page will show you:
- ✅ Script loaded successfully
- ✅ Click ID captured from URL
- ✅ API available and responding
- ✅ Tracking data stored correctly

### Step 2: Test the Complete Flow

1. Add `?click_id=dep_test_123` to any page on your site
2. Navigate through your site (data should persist)
3. Go to your conversion/thank you page
4. Check browser console for "Conversion tracked" message

### Step 3: Enable Debug Mode

```html
<!-- Add &debug=true for detailed console logs -->
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID&debug=true" async></script>
```

Then open browser console (F12) to see:
- Script initialization
- Click ID capture
- Storage operations
- Conversion detection
- API communications

### Step 4: Verify in Admin Dashboard

Contact us for test access to verify your conversions are being received:
**https://www.dinelportal.dk/admin/dashboard** (restricted access)

---

## Technical Implementation Details

### Conversion Detection

Our script automatically detects conversions on pages with these URL patterns:

**Danish:**
- `/tak` - Thank you
- `/bekraeftelse` - Confirmation  
- `/kvittering` - Receipt
- `/velkommen` - Welcome
- `/velkomst` - Welcome variant
- `/gennemfoert` - Completed
- `/succes` - Success

**English:**
- `/thank-you` - Thank you
- `/thanks` - Thanks
- `/confirmation` - Confirmation
- `/success` - Success
- `/welcome` - Welcome
- `/complete` - Complete
- `/completed` - Completed

**Form-based:**
- Forms with action containing: `tilmeld`, `signup`, `register`
- Submit buttons with text: "Tilmeld", "Opret", "Bekræft", "Registrer"

### Manual Conversion Tracking

If auto-detection doesn't match your pages, trigger manually:

```javascript
// Check if user came from DinElportal
if (window.DinElportal && window.DinElportal.getTrackingData()) {
    console.log('User from DinElportal detected');
    
    // Track conversion manually
    window.DinElportal.trackConversion({
        conversion_type: 'signup',      // or 'purchase', 'subscription'
        conversion_value: 599,           // Contract/order value in DKK
        product: 'premium_plan',         // Your product identifier
        contract_months: 12,             // Contract length
        metadata: {                     // Optional additional data
            customer_type: 'residential',
            payment_method: 'card'
        }
    });
}
```

### JavaScript API Reference

Once loaded, the script provides `window.DinElportal` with these methods:

```javascript
// Get all tracking data
const data = window.DinElportal.getTrackingData();
// Returns: { click_id, partner_id, session_id, timestamp, ... }

// Get just the click ID
const clickId = window.DinElportal.getClickId();
// Returns: "dep_abc123xyz" or null

// Check if user has click ID
const hasClickId = window.DinElportal.hasClickId();
// Returns: true/false

// Manually track conversion
window.DinElportal.trackConversion({
    conversion_type: 'signup',
    conversion_value: 599,
    product: 'your_product_id'
});

// Get current configuration
const config = window.DinElportal.getConfig();

// Update configuration
window.DinElportal.setConfig({
    debug: true,
    auto_conversion: false
});

// Clear all tracking data
window.DinElportal.clearData();

// Enable/disable debug mode
window.DinElportal.debug(true);
```

### Data Storage Methods

The script uses multiple storage methods for maximum reliability:

1. **Cookies** (Primary)
   - Name: `dinelportal_click_id`
   - Duration: 90 days
   - Domain: Your domain + subdomains
   - SameSite: Lax

2. **localStorage** (Backup)
   - Key: `dinelportal_data`
   - Persists: Until cleared
   - Survives: Browser restarts

3. **sessionStorage** (Fallback)
   - Key: `dinelportal_data`
   - Persists: Current session
   - Survives: Page navigation

4. **Device Fingerprinting** (Last resort)
   - When: All storage blocked
   - How: Browser characteristics
   - Accuracy: ~85%

---

## Troubleshooting

### Script Not Loading

**Check:**
1. View page source → Search for "universal.js"
2. Browser console → Look for errors
3. Network tab → Check if script loads (200 status)
4. Try without `async` attribute

**Solution:**
```html
<!-- Try without async if having issues -->
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID"></script>
```

### Click ID Not Captured

**Check:**
1. URL has `?click_id=dep_xxx` parameter
2. Browser console: Type `window.DinElportal.getClickId()`
3. Enable debug mode to see capture process

**Common Issues:**
- Script loaded after page navigation (load on ALL pages)
- JavaScript errors blocking execution
- Content Security Policy blocking script

### Conversions Not Tracking

**Check:**
1. Conversion page URL matches our patterns
2. Browser console shows "Conversion tracked" message
3. Network tab shows request to `/api/tracking/log`

**Solution for custom pages:**
```javascript
// Manually trigger on your custom success page
if (window.location.pathname === '/your-custom-success-page') {
    window.DinElportal.trackConversion({
        conversion_type: 'signup'
    });
}
```

### Testing Locally

The script works on localhost for testing:

```html
<!-- Will work on http://localhost:3000 -->
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=test&debug=true" async></script>
```

---

## Platform-Specific Examples

### WordPress

Add to your theme's `header.php` before `</head>`:

```php
<!-- DinElportal Tracking -->
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID" async></script>
```

Or use a plugin like "Insert Headers and Footers".

### Shopify

Add to `theme.liquid` in the `<head>` section:

```liquid
<!-- DinElportal Tracking -->
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID" async></script>
```

### React/Next.js

```jsx
// In your _app.js or layout component
import Script from 'next/script'

export default function App() {
  return (
    <>
      <Script 
        src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID"
        strategy="afterInteractive"
      />
      {/* Your app */}
    </>
  )
}
```

### Google Tag Manager

Create new Custom HTML tag:

```html
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID';
  script.async = true;
  document.head.appendChild(script);
})();
</script>
```

Trigger: All Pages

---

## Security & Compliance

### GDPR Compliance

✅ **No personal data collected** - Only anonymous click IDs  
✅ **No cross-site tracking** - Data isolated to your domain  
✅ **No marketing pixels** - Pure conversion tracking  
✅ **Transparent operation** - Use debug mode to see all operations  
✅ **User control** - Can be disabled with Do Not Track  

### Security Features

- **HTTPS only** - All data transmitted securely
- **Domain validation** - Script validates partner domain
- **Rate limiting** - Prevents abuse
- **Webhook authentication** - Secret key required for webhooks
- **No sensitive data** - Never send passwords, emails, or PII

### Data Retention

- **Click data**: 90 days (configurable)
- **Conversion data**: 2 years for accounting
- **Aggregated stats**: Indefinite (anonymized)

---

## Contact & Support

### Getting Started

**Need your partner ID?**  
Email: partners@dinelportal.dk

**Technical integration help:**  
Email: tech@dinelportal.dk  
Response time: Within 24 hours on business days

### Resources

- **Test Page**: https://www.dinelportal.dk/partner-test.html
- **Admin Dashboard**: https://www.dinelportal.dk/admin/dashboard (restricted)
- **This Guide**: Always up-to-date at `/docs/PARTNER-INTEGRATION-MASTER-GUIDE.md`

### Common Partner IDs (Examples)

- Vindstød: `vindstod`
- Andel Energi: `andelenergi`
- OK: `ok`
- Test/Development: `test`

### Frequently Asked Questions

**Q: Do I need to modify my backend?**  
A: No, the universal script is 100% client-side.

**Q: Works with Single Page Apps?**  
A: Yes, the script persists across client-side navigation.

**Q: What about ad blockers?**  
A: Core functionality works even with ad blockers.

**Q: Can I track different products?**  
A: Yes, use the `product` field in conversion tracking.

**Q: How do I test without affecting real data?**  
A: Add `&test=true` to the script URL.

**Q: When do we get paid?**  
A: Monthly payouts for conversions from the previous month.

---

## Success Checklist

Before going live, verify:

- [ ] Script added to ALL pages of your website
- [ ] Test page shows all green checkmarks
- [ ] Click ID persists across page navigation
- [ ] Conversions trigger on your success pages
- [ ] Debug mode shows expected output
- [ ] You have your production partner_id
- [ ] Webhook secret stored securely (if using webhooks)

---

*Last Updated: January 2025*  
*Version: 1.0.0*  
*This is the complete, authoritative guide for DinElportal partner integration.*