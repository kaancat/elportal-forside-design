# DinElportal Universal Tracking System

A comprehensive, production-ready tracking solution for partner websites. Features auto-capture of click IDs, multi-storage persistence, automatic conversion detection, and GDPR compliance.

## 🚀 Quick Start

### One-Line Embed (Recommended)

Add this single line to your partner website's `<head>` section:

```html
<script src="https://dinelportal.dk/tracking.js" data-partner-id="your-partner-id" async></script>
```

That's it! The tracker will automatically:
- Capture `click_id` from URL parameters
- Store tracking data across page visits
- Detect conversion pages
- Handle all edge cases (blocked cookies, private browsing, etc.)

### Manual Integration

```typescript
import { quickSetup } from '@/tracking';

// Initialize with your partner ID
await quickSetup('your-partner-id');

// Track conversions manually
window.DinElportal.trackConversion({
  conversion_type: 'purchase',
  conversion_value: 299.99,
  conversion_currency: 'DKK'
});
```

## 📋 Features

### ✅ Automatic Features
- **Click ID Capture**: Auto-captures from URL parameters on ANY page
- **Multi-Storage**: localStorage + sessionStorage + cookies (90-day retention)
- **Conversion Detection**: Auto-detects `/thank-you`, `/success`, `/tak`, etc.
- **Subdomain Support**: Works across your entire domain
- **Fingerprint Fallback**: Device fingerprinting when click_id is lost
- **GDPR Compliant**: Respects Do Not Track, no personal data collection

### ✅ Edge Case Handling
- Blocked cookies → Uses localStorage/sessionStorage
- Private browsing → Uses sessionStorage
- Missing click_id → Uses device fingerprinting
- Dynamic content → Monitors DOM changes
- Form submissions → Auto-tracks conversions

### ✅ Developer Features
- **Debug Mode**: Comprehensive console logging
- **TypeScript**: Full type safety
- **Global API**: `window.DinElportal.trackConversion()`
- **Error Handling**: Graceful degradation

## 🛠 Configuration Options

```typescript
const config = {
  // API settings
  endpoint: 'https://dinelportal.dk/api/track',
  partner_id: 'your-partner-id',
  
  // Click ID settings
  clickIdParam: 'click_id', // URL parameter name
  
  // Storage settings
  cookieDays: 90,
  domain: '.yoursite.com', // For subdomain sharing
  
  // Feature toggles
  enableAutoConversion: true,
  enableFingerprinting: true,
  enableFormTracking: true,
  enableButtonTracking: true,
  
  // Privacy compliance
  respectDoNotTrack: true,
  requireConsent: false,
  
  // Development
  debug: false
};
```

## 📊 Usage Examples

### Basic Tracking

```html
<!-- Simple embed - works for most cases -->
<script src="https://dinelportal.dk/tracking.js" async></script>
```

### With Partner ID

```html
<!-- Recommended: Include your partner ID -->
<script 
  src="https://dinelportal.dk/tracking.js" 
  data-partner-id="elselskab-xyz" 
  async>
</script>
```

### Manual Conversion Tracking

```javascript
// Track specific conversion events
window.DinElportal.trackConversion({
  conversion_type: 'signup',
  conversion_value: 0,
  metadata: {
    plan: 'premium',
    source: 'landing-page'
  }
});

// Track purchase with value
window.DinElportal.trackConversion({
  conversion_type: 'purchase',
  conversion_value: 1299.99,
  conversion_currency: 'DKK',
  metadata: {
    product_id: 'electricity-plan-pro',
    payment_method: 'card'
  }
});
```

### Development & Testing

```typescript
import { debugSetup, logDebugInfo } from '@/tracking';

// Enable debug mode
await debugSetup('test-partner', { debug: true });

// Check what's being tracked
logDebugInfo();
console.log('Current tracking data:', window.DinElportal.getTrackingData());
```

### Custom Conversion Patterns

```typescript
import { UniversalTracker } from '@/tracking';

const tracker = new UniversalTracker({
  partner_id: 'your-partner-id',
  conversionPatterns: [
    '/bestilling-gennemfoert',
    '/kundeservice-kontakt',
    '/prissammenligning-afsluttet'
  ],
  debug: true
});

await tracker.initialize();
```

## 🎯 Conversion Detection

The tracker automatically detects conversions on pages matching these patterns:

### Danish Patterns
- `/tak` - Thank you pages
- `/takker` - Thanks pages
- `/bekraeftelse` - Confirmation pages
- `/bekraeftet` - Confirmed pages
- `/gennemfoert` - Completed pages
- `/succes` - Success pages
- `/ordre-bekraeftelse` - Order confirmation
- `/bestilling-bekraeftelse` - Booking confirmation

### English Patterns
- `/thank-you` - Thank you pages
- `/success` - Success pages
- `/confirmation` - Confirmation pages
- `/complete` - Completion pages
- `/order-complete` - Order completion
- `/checkout-complete` - Checkout completion

### Content Detection
The tracker also detects conversions based on page content:
- Elements with class `.success-message`
- Elements with class `.thank-you`
- Elements with `[data-conversion="true"]`
- Form submissions to checkout/order endpoints

## 🔒 Privacy & GDPR Compliance

### Automatic Privacy Features
- **No Personal Data**: Only technical browser characteristics
- **Respect Do Not Track**: Honors browser DNT settings
- **Consent Management**: Supports consent frameworks
- **Data Minimization**: Only collects necessary tracking data

### Privacy Configuration

```typescript
const privacyConfig = {
  respectDoNotTrack: true,     // Honor DNT header
  requireConsent: true,        // Wait for user consent
  enableFingerprinting: false, // Disable fingerprinting
  anonymizeIp: true           // Anonymize IP addresses (server-side)
};
```

### Consent Integration

```javascript
// Set consent before tracking
window.dinelportal_consent = true;

// Or integrate with your consent manager
window.addEventListener('consent-granted', () => {
  window.dinelportal_consent = true;
});
```

## 🛡️ Data Storage Strategy

The tracker uses a multi-layered storage approach for maximum reliability:

### Storage Priority
1. **sessionStorage** (current session)
2. **localStorage** (persistent, 90 days)
3. **First-party cookies** (cross-subdomain, 90 days)

### Fallback Strategy
1. **URL click_id** (highest priority)
2. **Stored click_id** (from any storage method)
3. **Device fingerprint** (when click_id is unavailable)
4. **Session-only tracking** (minimal data)

## 🔧 API Reference

### Global API (`window.DinElportal`)

```typescript
interface DinElportalAPI {
  // Track conversion manually
  trackConversion(data?: Partial<ConversionData>): Promise<boolean>;
  
  // Get current tracking data
  getTrackingData(): TrackingData | null;
  
  // Clear all stored data
  clearData(): void;
  
  // Update configuration
  setConfig(config: Partial<TrackingConfig>): void;
  
  // Get current configuration
  getConfig(): TrackingConfig;
  
  // Enable/disable debug mode
  debug(enabled: boolean): void;
  
  // Version information
  version: string;
}
```

### Tracking Data Structure

```typescript
interface TrackingData {
  click_id?: string;        // From URL parameter
  fingerprint?: string;     // Device fingerprint
  session_id: string;       // Session identifier
  page_url: string;         // Current page URL
  referrer: string;         // Referrer URL
  timestamp: number;        // When tracking started
  user_agent: string;       // Browser user agent
}
```

### Conversion Data Structure

```typescript
interface ConversionData {
  click_id?: string;           // Original click ID
  fingerprint?: string;        // Device fingerprint
  session_id: string;          // Session identifier
  conversion_type: string;     // Type of conversion
  conversion_value?: number;   // Monetary value
  conversion_currency?: string; // Currency code
  page_url: string;           // Conversion page URL
  timestamp: number;          // Conversion timestamp
  metadata?: Record<string, any>; // Additional data
}
```

## 📈 Monitoring & Debugging

### Debug Mode

```javascript
// Enable debug mode
window.DinElportal.debug(true);

// Check debug information
import { logDebugInfo } from '@/tracking';
logDebugInfo();
```

### Debug Output Example

```
🔍 DinElportal Debug Information
├── Version: 1.0.0
├── Initialized: true
├── Configuration: { partner_id: 'test', debug: true, ... }
├── Current Data: { click_id: 'abc123', session_id: 'sess_...', ... }
└── Browser Info: { capabilities: { localStorage: true, ... } }
```

### Health Checks

```javascript
// Check if tracking is working
const data = window.DinElportal.getTrackingData();
console.log('Tracking active:', !!data);
console.log('Has click_id:', !!data?.click_id);
console.log('Has fingerprint:', !!data?.fingerprint);
```

## 🚨 Troubleshooting

### Common Issues

**No tracking data**
- Check if Do Not Track is enabled
- Verify consent settings
- Enable debug mode to see errors

**Click ID not captured**
- Check URL parameter name (`click_id` by default)
- Verify the parameter is present in URL
- Check for URL encoding issues

**Conversions not detected**
- Verify conversion page URL patterns
- Check if custom patterns are needed
- Enable form/button tracking

### Debug Commands

```javascript
// Check browser capabilities
import { checkBrowserSupport } from '@/tracking';
console.log('Browser support:', checkBrowserSupport());

// Test conversion detection
import { isConversionPage } from '@/tracking';
console.log('Is conversion page:', isConversionPage());

// Extract click ID manually
import { extractClickId } from '@/tracking';
console.log('Click ID from URL:', extractClickId());
```

## 🏗 Architecture Overview

```
┌─────────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   Partner Website   │    │  Universal       │    │  DinElportal   │
│                     │    │  Tracking        │    │  API Server    │
│ ┌─────────────────┐ │    │  Script          │    │                │
│ │  <script>       │─┼────┤                  │────┤  /api/track    │
│ │  tracking.js    │ │    │ ┌──────────────┐ │    │  /api/convert  │
│ │  </script>      │ │    │ │ Storage      │ │    │                │
│ └─────────────────┘ │    │ │ Manager      │ │    └────────────────┘
│                     │    │ └──────────────┘ │
│ ┌─────────────────┐ │    │ ┌──────────────┐ │
│ │  Conversion     │─┼────┤ │ Conversion   │ │
│ │  Pages          │ │    │ │ Detector     │ │
│ └─────────────────┘ │    │ └──────────────┘ │
│                     │    │ ┌──────────────┐ │
│ ┌─────────────────┐ │    │ │ Fingerprint  │ │
│ │  Forms &        │─┼────┤ │ Generator    │ │
│ │  Buttons        │ │    │ └──────────────┘ │
│ └─────────────────┘ │    └──────────────────┘
└─────────────────────┘
```

## 📦 Installation & Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Create minified tracking script
npm run build:tracking

# Deploy to CDN
npm run deploy
```

### File Structure

```
src/tracking/
├── index.ts              # Main exports
├── UniversalScript.ts    # Core tracking logic
├── StorageManager.ts     # Multi-storage persistence
├── ConversionDetector.ts # Auto-conversion detection
├── Fingerprint.ts        # Device fingerprinting
├── types.ts             # TypeScript definitions
└── README.md           # This documentation
```

## 🤝 Partner Integration Guide

### Step 1: Add Script Tag
```html
<script 
  src="https://dinelportal.dk/tracking.js" 
  data-partner-id="your-partner-id" 
  async>
</script>
```

### Step 2: Configure Conversion Pages
Ensure your thank-you/success pages include patterns like:
- `/tak` or `/thank-you`
- `/success` or `/succes`  
- `/confirmation` or `/bekraeftelse`

### Step 3: Test Integration
```javascript
// Enable debug mode temporarily
window.DinElportal.debug(true);

// Visit with click_id parameter
// https://yoursite.com/landing?click_id=test123

// Check tracking data
console.log(window.DinElportal.getTrackingData());

// Complete a conversion
// Visit /thank-you or call trackConversion() manually
```

### Step 4: Monitor Performance
- Check conversion detection accuracy
- Monitor API success rates
- Verify cross-page persistence

## 📊 Analytics Integration

### Google Analytics 4

```javascript
// Send conversions to GA4
window.DinElportal.trackConversion({
  conversion_type: 'purchase',
  conversion_value: 299.99,
  metadata: {
    send_to_ga4: true
  }
});
```

### Custom Analytics

```javascript
// Hook into conversion events
window.addEventListener('dinelportal-conversion', (event) => {
  const conversionData = event.detail;
  
  // Send to your analytics platform
  myAnalytics.track('conversion', {
    click_id: conversionData.click_id,
    type: conversionData.conversion_type,
    value: conversionData.conversion_value
  });
});
```

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Multi-storage persistence
- Auto-conversion detection
- Device fingerprinting
- GDPR compliance
- TypeScript support
- Comprehensive error handling

## 📄 License

MIT License - See LICENSE file for details.

## 🆘 Support

For technical support or integration questions:
- Email: support@dinelportal.dk
- Documentation: https://docs.dinelportal.dk
- Status: https://status.dinelportal.dk

---

**© 2025 DinElportal - Denmark's Most Trusted Electricity Price Comparison Platform**