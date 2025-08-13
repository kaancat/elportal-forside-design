# DinElportal Universal Tracking Script

## Files

- `universal.js` - Development version (with readable code but TypeScript artifacts)
- ⚠️ **Note**: Minified version is currently not available due to TypeScript conversion issues

## Usage

### Basic Embed
```html
<script src="https://dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_PARTNER_ID" async></script>
```

### With Configuration
```html
<script src="https://dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID&debug=true&endpoint=custom" async></script>
```

### Manual API Usage
```javascript
// Track conversion manually
window.DinElportal.trackConversion({
  conversion_type: 'signup',
  conversion_value: 100
});

// Get tracking data
const data = window.DinElportal.getTrackingData();
console.log(data);
```

## API Endpoints

The universal script works with these API endpoints:

- `GET /api/tracking/universal.js` - Serves the universal script with partner configuration
- `POST /api/tracking/log` - Telemetry endpoint for tracking events and conversions
- `GET|POST /api/tracking/config/[partnerId]` - Partner configuration management
- `POST /api/track-conversion` - Legacy conversion tracking (supports both webhooks and universal script)

## Build Info

- Built: 2025-08-13T15:07:14.224Z
- Version: 1.0.0
- Node: ${process.version}
- Status: Development build only (TypeScript conversion in progress)

## Development

To rebuild the script:
```bash
npm run build:universal
```

**Note**: The build process currently generates a development-compatible version but has issues with TypeScript-to-JavaScript conversion for minification. This is suitable for testing and development but should be improved for production use.

## Configuration Options

The universal script accepts these URL parameters:

- `partner_id` - Your partner ID (required)
- `endpoint` - Custom API endpoint for tracking
- `click_param` - Parameter name for click ID (default: 'click_id')
- `cookie_days` - Cookie expiration in days (default: 90)
- `auto_conversion` - Enable auto-conversion detection (default: true)
- `fingerprinting` - Enable device fingerprinting (default: true)
- `form_tracking` - Monitor form submissions (default: true)
- `button_tracking` - Monitor button clicks (default: true)
- `debug` - Enable debug logging (default: false)
- `dnt` - Respect Do Not Track (default: true)
- `require_consent` - Require explicit consent (default: false)
- `conversion_patterns` - JSON array of URL patterns for conversion detection

## Features

- ✅ Multi-storage persistence (localStorage, sessionStorage, cookies)
- ✅ Auto-capture click_id from URL parameters
- ✅ Auto-conversion detection
- ✅ Device fingerprinting fallback
- ✅ GDPR compliant
- ✅ Handles edge cases (blocked cookies, private browsing)
- ✅ Cross-origin support with CORS
- ✅ Partner-specific configuration
- ✅ Rate limiting and security
- ❌ Production minification (in progress)

## Security

- Partner domain validation
- Rate limiting per partner/IP
- Webhook authentication for configuration changes
- Secure cookie settings
- GDPR compliance with DNT support