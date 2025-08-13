# DinElportal Tracking System Behavior Guide

## Overview
The DinElportal tracking system is designed for affiliate/partner tracking with cross-site attribution. It tracks user journeys from initial click through to conversion, even across different domains.

## Core Tracking Flow

### 1. Initial Click from DinElportal
When a user clicks a partner link on DinElportal:
```
https://partner-site.dk/?click_id=dep_test_123
```
- The `click_id` is captured from the URL
- Stored in triple persistence (cookies, localStorage, sessionStorage)
- Associated with a device fingerprint for cross-session tracking
- Tracked with 90-day attribution window

### 2. Subsequent Page Navigation
On partner site navigation without `click_id` parameter:
- Script retrieves stored `click_id` from persistence layer
- Sends page view event with the original `click_id`
- Maintains attribution throughout the session

### 3. Conversion Tracking
When user completes desired action:
- Conversion is attributed to original `click_id`
- Falls back to fingerprint matching if `click_id` lost
- Tracks conversion value and metadata

## Persistence Mechanism

### Triple Storage Strategy
1. **Cookies**: Cross-subdomain persistence with `.domain.dk` format
2. **localStorage**: Long-term storage (90 days)
3. **sessionStorage**: Current session backup

### Cookie Domain Setting
- Automatically detects and sets appropriate domain
- Example: `mondaybrew.dk` → `.mondaybrew.dk`
- Enables tracking across subdomains (www, app, etc.)

## Debug Mode

### Enabling Debug Mode
Add `debug=true` to the script URL:
```html
<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=test-partner&debug=true" async></script>
```

Or programmatically:
```javascript
window.DinElportal.debug(true);
```

### Debug Output
Check browser console for:
- Storage operations (cookie set/get)
- Tracking data retrieval
- Event sending status
- Click ID capture and persistence

## Common Scenarios

### Scenario 1: Direct Traffic (No Click ID)
- User visits partner site directly
- No `click_id` in URL
- System generates fingerprint
- Tracks as unattributed page view
- Events still logged for analytics

### Scenario 2: Referred Traffic (With Click ID)
- User clicks from DinElportal
- `click_id` in URL captured
- Stored in all persistence layers
- All subsequent actions attributed
- Conversions linked to original click

### Scenario 3: Return Visit
- User returns days later
- No `click_id` in URL
- System retrieves from localStorage/cookies
- Continues attribution if within 90-day window
- Falls back to fingerprint matching

## Troubleshooting

### Events Not Tracking
1. **Check domain whitelist**: Ensure your domain is whitelisted in partner config
2. **Verify script loading**: Check browser console for "DinElportal Universal Tracker v1.0.0 loaded"
3. **Enable debug mode**: Add `debug=true` to see detailed logs
4. **Check cookies**: Verify cookies are being set with correct domain

### Click ID Not Persisting
1. **Cookie domain issues**: Check if cookies are set with correct domain format
2. **Browser restrictions**: Some browsers block third-party cookies
3. **HTTPS required**: Secure cookies only work on HTTPS
4. **Cross-domain limitations**: Cookies don't persist across different root domains

### Verification Steps
1. Visit `/partner-test.html` on DinElportal
2. Complete Step 1 to load tracking script
3. Check Step 3 "Live Tracking Status"
4. Navigate with `?click_id=dep_test_123`
5. Verify events appear in dashboard

## Technical Details

### Event Types
- `track`: Page view events
- `conversion`: Completed actions
- `click_captured`: Initial click from DinElportal

### Data Collected
- `click_id`: Unique identifier from DinElportal
- `fingerprint`: Device fingerprint for fallback
- `session_id`: Current session identifier
- `page_url`: Current page URL
- `referrer`: Previous page URL
- `user_agent`: Browser information
- `timestamp`: Event time

### API Endpoints
- **Tracking**: `POST /api/tracking/log`
- **Verification**: `GET /api/tracking/verify?partner_id={id}`
- **Script**: `GET /api/tracking/universal.js?partner_id={id}`

## Security & Privacy

### GDPR Compliance
- Respects Do Not Track settings
- Optional consent requirement
- No personal data collected
- Data retained for 90 days maximum

### Domain Validation
- Partner domains must be whitelisted
- Prevents unauthorized tracking
- Protects partner IDs from theft

### Rate Limiting
- 1000 requests per hour per partner
- Per-IP rate limiting
- Prevents abuse and spam

## Best Practices

### For Partners
1. Always use HTTPS for your website
2. Test with debug mode first
3. Verify domain is whitelisted
4. Monitor tracking status regularly
5. Implement conversion tracking on success pages

### For Testing
1. Use `test-partner` ID for development
2. Enable debug mode for troubleshooting
3. Check browser console for errors
4. Verify cookies in DevTools
5. Test cross-page navigation

## FAQ

**Q: Why aren't my clicks tracking?**
A: Ensure your domain is whitelisted and the script is loaded with correct partner_id.

**Q: How long is attribution window?**
A: 90 days from initial click.

**Q: Can I track without click_id?**
A: Yes, events are tracked but won't be attributed to a specific campaign.

**Q: Does it work with ad blockers?**
A: Most ad blockers don't block first-party tracking scripts.

**Q: How do I verify tracking is working?**
A: Use the verification endpoint or check Step 3 in partner-test.html.

## Support
For issues or questions, contact DinElportal support with:
- Your partner ID
- Domain you're tracking from
- Browser console errors (if any)
- Steps to reproduce the issue