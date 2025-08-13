# DinElportal Tracking Implementation Guide

## Overview
This document outlines the complete tracking implementation for DinElportal to accurately attribute user referrals to multiple partners and track conversions for revenue sharing. Our business model depends entirely on accurate conversion tracking across multiple partnerships, making this implementation business-critical.

## Business Requirements

### Revenue Model
- **Multi-Partner System**: Support unlimited partner integrations (Vindstød, Andelenergi, etc.)
- **Attribution Window**: 90 days (industry standard for complex purchases)
- **Tracking Accuracy**: Must be 99.9% reliable as revenue depends on it
- **GDPR Compliance**: Must respect user consent via Cookiebot
- **Scalability**: Handle 100,000+ clicks/day and 1,000+ conversions/day

### Key Metrics to Track
1. **Click Events**: Every outbound click to any partner
2. **Unique Users**: Deduplicated user count per partner
3. **Conversion Events**: Successful signups across all partners
4. **Revenue Attribution**: Commission tracking per partner and campaign
5. **Partner Performance**: CTR, conversion rates, revenue per partner
6. **User Journey**: Multi-touch attribution across sessions

## GDPR Compliance & Privacy-First Architecture

### Critical GDPR Findings (2024)
Based on latest EU regulations and best practices:
- **Server-side tracking does NOT bypass GDPR** - consent is still required for personal data
- **Click IDs are acceptable** - they don't contain PII (Personal Identifiable Information)
- **Simplicity is key** - complex implementations increase compliance risks
- **Documentation is mandatory** - must demonstrate compliance, not just claim it

### Our Privacy-First Approach

#### 1. Three-Tier Tracking Strategy

**Tier 1: No Consent Required (Always Active)**
- Click ID tracking via URL parameters (no PII)
- Server-to-server conversion webhooks
- Aggregated analytics (no individual tracking)
- Session-based counting (no persistent identifiers)

**Tier 2: Statistics Consent (Medium Detail)**
- Google Analytics 4 in anonymized mode
- No user ID tracking
- IP anonymization enabled
- No cross-site tracking

**Tier 3: Marketing Consent (Full Tracking)**
- Complete GA4 functionality
- Facebook Pixel for retargeting
- Enhanced conversion tracking
- Cross-device attribution

### 2. Simplified Click Tracking Flow

```
GDPR-Compliant Journey (No Consent Needed):
1. User clicks partner link → Generate click_id (anonymous)
2. Redirect: partner.dk/?ref=dinelportal&click_id=dep_abc123
3. Server stores: {click_id, timestamp, partner_id} (NO personal data)
4. Partner captures click_id on their side
5. On conversion → Partner sends webhook with click_id
6. We validate and record conversion
7. Update dashboard metrics (aggregated)

Additional with Consent:
- GA4 events for user behavior
- Facebook Pixel for ad attribution
```

## Simplified Partner Integration (1-Hour Setup)

### Why Our System is Easy for Partners

1. **ONE Line of Code**: Partners only need to capture the `click_id` parameter
2. **No Cookies Required**: Works with all privacy settings
3. **No JavaScript**: Simple server-side parameter reading
4. **Flexible Integration**: Works with any tech stack
5. **Test Mode Available**: Verify before going live

### Partner Implementation Options

#### Option 1: Ultra-Simple (Recommended)
```html
<!-- Just save the click_id with the order -->
<?php $_SESSION['dinelportal_click_id'] = $_GET['click_id']; ?>
```

#### Option 2: Simple Tracking Pixel
```html
<!-- Add to thank you page -->
<img src="https://elportal.dk/api/track-pixel?click_id=CLICK_ID&value=ORDER_VALUE" width="1" height="1" />
```

#### Option 3: Webhook (Most Reliable)
```javascript
// Send when customer converts
fetch('https://elportal.dk/api/track-conversion', {
  method: 'POST',
  headers: {'X-Secret': 'YOUR_SECRET'},
  body: JSON.stringify({click_id, order_value})
})
```

## Implementation Components

### 1. Cookiebot Integration (GDPR Compliance)

```html
<!-- In index.html - Load Cookiebot first -->
<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" 
        data-cbid="YOUR-COOKIEBOT-ID" 
        data-blockingmode="auto" 
        type="text/javascript">
</script>
```

**Configuration**:
- Auto-blocking mode to prevent scripts loading before consent
- Categories: necessary, statistics, marketing, preferences
- Cookie declaration page at `/cookie-policy`

### 2. Google Analytics 4 Setup

**Account Structure**:
```
Property: DinElportal
Data Stream: elportal.dk (Web)
Measurement ID: G-XXXXXXXXXX
```

**Key Events to Track**:
- `page_view` - All page visits
- `provider_click` - Click on provider card
- `calculator_use` - Price calculator interaction
- `signup_initiated` - User clicks "Skift til" button
- `conversion` - Successful signup (via webhook)

**Enhanced Ecommerce Parameters**:
```javascript
gtag('event', 'provider_click', {
  'currency': 'DKK',
  'value': estimated_monthly_savings,
  'items': [{
    'item_id': 'vindstod_spot',
    'item_name': 'Vindstød Spot',
    'item_category': 'electricity_provider',
    'price': monthly_price,
    'quantity': 1
  }]
});
```

**Consent Mode v2**:
```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});

// Update after Cookiebot consent
window.addEventListener('CookiebotOnAccept', function() {
  gtag('consent', 'update', {
    'ad_storage': Cookiebot.consent.marketing ? 'granted' : 'denied',
    'analytics_storage': Cookiebot.consent.statistics ? 'granted' : 'denied'
  });
});
```

### 3. Facebook Pixel Setup

**Pixel ID**: XXXXXXXXXXXXXXXXX

**Key Events**:
- `PageView` - Standard page tracking
- `ViewContent` - Provider list viewed
- `InitiateCheckout` - Click "Skift til" button
- `Lead` - Conversion tracked (server-side)

**Limited Data Use (LDU) for GDPR**:
```javascript
fbq('dataProcessingOptions', ['LDU'], 0, 0); // For EU users
```

### 4. UTM Parameter Strategy

**Standard Parameters**:
- `utm_source=dinelportal` - Always our domain
- `utm_medium=` - Context of the click:
  - `referral` - Provider list page
  - `calculator` - Price calculator results
  - `cta` - Call-to-action buttons
  - `email` - Email campaigns
- `utm_campaign=` - Specific campaign:
  - `provider_list` - Main comparison page
  - `hero_cta` - Homepage hero section
  - `green_energy` - Environmental focus
  - `{month}_{year}_promo` - Time-based campaigns

**Custom Parameters**:
- `click_id={uuid}` - Unique identifier for attribution
- `ref_page={page_slug}` - Source page on DinElportal
- `consumption={kwh}` - User's calculated consumption
- `region={DK1|DK2}` - User's selected region

### 5. Click ID Generation

```typescript
// Generate unique click ID
function generateClickId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `dep_${timestamp}_${random}`;
}

// Example: dep_lm5k2n8_a3b9x7c2
```

### 6. Server-Side Tracking Endpoint

**Endpoint**: `POST /api/track-click`

**Request Payload**:
```json
{
  "click_id": "dep_lm5k2n8_a3b9x7c2",
  "provider": "vindstod",
  "product": "vindstod_spot",
  "source_page": "/elpriser",
  "consumption": 4000,
  "region": "DK2",
  "estimated_price": 850,
  "timestamp": "2025-01-13T10:30:00Z",
  "session_id": "sess_abc123",
  "user_agent": "Mozilla/5.0..."
}
```

**Storage**: Vercel KV or PostgreSQL
- TTL: 90 days for click data
- Index on click_id for fast lookups

### 7. Conversion Webhook

**Endpoint**: `POST /api/track-conversion`

**Authentication**: 
- Shared secret in header: `X-Webhook-Secret: {SECRET}`
- IP whitelist for Vindstød servers

**Expected Payload from Vindstød**:
```json
{
  "click_id": "dep_lm5k2n8_a3b9x7c2",
  "conversion_time": "2025-01-13T14:45:00Z",
  "customer_id": "vind_cust_123",
  "product_selected": "vindstod_spot",
  "contract_value": 10200,
  "contract_length_months": 12
}
```

**Validation Steps**:
1. Verify webhook secret
2. Check click_id exists in our database
3. Verify within 30-day attribution window
4. Prevent duplicate conversions
5. Send to GA4 Measurement Protocol
6. Send to Facebook Conversions API
7. Store in our database for reporting

## Reporting and Analytics

### Dashboard Requirements
- Real-time click tracking
- Conversion rate by source
- Revenue attribution reports
- Campaign performance metrics
- A/B test results

### Key Performance Indicators (KPIs)
1. **Click-Through Rate (CTR)**: Clicks / Page Views
2. **Conversion Rate**: Conversions / Clicks
3. **Cost Per Acquisition (CPA)**: Ad Spend / Conversions
4. **Customer Lifetime Value (CLV)**: Avg Revenue per Conversion
5. **Return on Ad Spend (ROAS)**: Revenue / Ad Spend

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up Cookiebot account and configure consent categories
- [ ] Create GA4 property and configure data streams
- [ ] Set up Facebook Business Manager and Pixel
- [ ] Deploy basic tracking scripts with consent checks

### Phase 2: Click Tracking (Week 2)
- [ ] Implement click ID generation
- [ ] Add UTM parameters to all provider links
- [ ] Create `/api/track-click` endpoint
- [ ] Set up Vercel KV for click storage
- [ ] Test click tracking flow

### Phase 3: Conversion Tracking (Week 3)
- [ ] Create `/api/track-conversion` webhook
- [ ] Implement webhook security
- [ ] Set up GA4 Measurement Protocol
- [ ] Configure Facebook Conversions API
- [ ] Coordinate with Vindstød for testing

### Phase 4: Testing & Optimization (Week 4)
- [ ] End-to-end testing with Vindstød
- [ ] Load testing on tracking endpoints
- [ ] Set up monitoring and alerts
- [ ] Create reporting dashboards
- [ ] Document troubleshooting procedures

## Testing Procedures

### Test Scenarios
1. **Happy Path**: User consents → clicks → converts
2. **No Consent**: User denies cookies → server tracking only
3. **Partial Consent**: Statistics only, no marketing
4. **Cross-Device**: Mobile click → desktop conversion
5. **Attribution Window**: Click today → convert in 29 days

### Test Tools
- GA4 DebugView for real-time event testing
- Facebook Pixel Helper Chrome extension
- Postman for webhook testing
- Custom test harness for click_id validation

## Security Considerations

### Data Protection
- Hash IP addresses before storage
- Encrypt click_ids in database
- SSL/TLS for all API endpoints
- Rate limiting on tracking endpoints

### GDPR Compliance
- No PII in tracking data
- 90-day data retention
- User right to deletion
- Transparent cookie policy
- Cookiebot consent management

## Monitoring & Alerts

### Key Metrics to Monitor
- Tracking endpoint response time < 100ms
- Webhook success rate > 99.9%
- Click-to-conversion ratio within expected range
- No duplicate conversions

### Alert Triggers
- Tracking endpoint down > 1 minute
- Conversion rate drops > 20%
- Webhook failures > 5 in 10 minutes
- Database storage > 80% capacity

## Troubleshooting Guide

### Common Issues

**1. Conversions not tracking**
- Check webhook secret matches
- Verify click_id exists in database
- Confirm within 30-day window
- Check Vindstød is sending correct payload

**2. GA4 events missing**
- Verify Cookiebot consent granted
- Check GA4 Measurement ID correct
- Use DebugView to test events
- Confirm gtag.js loaded properly

**3. Click IDs not generating**
- Check JavaScript errors in console
- Verify tracking script loaded
- Test ID generation function
- Check for ad blockers

## Contact & Support

**Internal Team**:
- Technical Lead: [Your Name]
- Analytics: [Analytics Contact]
- Vindstød Relationship: [Business Contact]

**External Contacts**:
- Vindstød Technical: [Their Dev Contact]
- Cookiebot Support: support@cookiebot.com
- GA4 Support: Via Google Ads account

## Appendix

### A. Environment Variables
```bash
# Public (client-side safe)
VITE_COOKIEBOT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=XXXXXXXXXXXXXXXXX

# Private (server-side only)
CONVERSION_WEBHOOK_SECRET=random-secret-string
GA4_API_SECRET=your-ga4-api-secret
FB_ACCESS_TOKEN=your-fb-access-token
TRACKING_DATABASE_URL=your-database-url
```

### B. Useful Resources
- [Cookiebot Developer Docs](https://www.cookiebot.com/en/developer/)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Facebook Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [UTM Parameter Best Practices](https://ga-dev-tools.web.app/campaign-url-builder/)

### C. Revenue Attribution Model
```
Monthly Revenue = Σ(Conversions × Commission Rate) per Partner
Commission Types:
- Fixed fee per conversion (e.g., 500 kr per signup)
- Revenue share (e.g., 5% of customer LTV)
- Tiered commission (increases with volume)
Attribution Models:
- Last-click (default)
- First-click (optional)
- Linear (equal credit)
- Time-decay (recent clicks weighted more)
```

## Sales & Revenue Tracking Dashboard

### GDPR Compliance Checklist

✅ **Data We Track (Without Consent)**
- Click IDs (anonymous identifiers)
- Timestamp of clicks
- Partner destination
- Aggregated conversion counts
- NO IP addresses, NO user IDs, NO personal data

✅ **User Rights Implementation**
- **Right to Access**: Users can request their data (we have none without consent)
- **Right to Erasure**: Click IDs auto-expire after 90 days
- **Data Portability**: Export functionality available
- **Transparency**: Clear privacy policy and cookie banner

✅ **Legal Basis**
- **No Consent Needed**: Click tracking uses "legitimate interest" (no PII)
- **Statistics**: Requires consent for GA4
- **Marketing**: Requires explicit consent for remarketing

✅ **Why 90-Day Attribution is GDPR Compliant**
- **Industry Standard**: 30-90 days is typical for affiliate marketing in EU
- **Complex Purchases**: Energy contracts require longer decision periods
- **No PII Storage**: Click IDs are anonymous, not personal data
- **Proportionate**: Justified by business need (customers research for weeks)
- **Documented Purpose**: Clear retention policy in privacy policy
- **Automatic Deletion**: Data expires after 90 days without manual intervention

✅ **Data Processing Agreements**
- Required with Vindstød and all partners
- Required with Google Analytics
- Required with any third-party processors

### Dashboard Strategy

We'll implement a **hybrid approach** combining multiple data sources for comprehensive tracking:

#### 1. Primary Dashboard: Custom Admin Panel
**Location**: `/admin/dashboard` (protected route)

**Why Custom Instead of Only GA4:**
- **Full Control**: Track partner-specific metrics GA4 doesn't handle
- **Revenue Data**: Store actual commission amounts (sensitive data)
- **Real-time Updates**: Instant conversion notifications
- **Partner Management**: Configure partners, view performance
- **Financial Reporting**: Generate invoices, track payments
- **Data Ownership**: All data stays in our control

**Key Features:**
```typescript
interface DashboardMetrics {
  // Real-time Overview
  today: {
    clicks: number
    conversions: number
    revenue: number
    topPartner: string
  }
  
  // Partner Performance
  partners: Map<string, {
    clicks30d: number
    conversions30d: number
    conversionRate: number
    revenue30d: number
    pendingCommission: number
    paidCommission: number
  }>
  
  // Financial Tracking
  financial: {
    unpaidCommissions: number
    monthlyRecurring: number
    projectedRevenue: number
    invoices: Invoice[]
  }
}
```

#### 2. Google Analytics 4: Marketing Analytics
**Purpose**: Track user behavior, marketing campaigns, traffic sources

**What to Track in GA4:**
- User acquisition channels
- Page views and engagement
- Campaign performance
- User demographics
- Conversion funnels
- A/B test results

**Custom Events for Partners:**
```javascript
// Track partner clicks
gtag('event', 'partner_click', {
  'partner_name': 'vindstod',
  'product': 'spot_price',
  'list_position': 1,
  'user_consumption': 4000
});

// Track conversions (via Measurement Protocol)
gtag('event', 'purchase', {
  'transaction_id': 'dep_abc123',
  'value': 500,
  'currency': 'DKK',
  'items': [{
    'item_name': 'vindstod_referral',
    'price': 500
  }]
});
```

#### 3. Data Storage Architecture

**Dual Database Strategy:**
1. **Vercel KV (Redis)**: Real-time data
   - Active clicks (last 90 days)
   - Session tracking
   - Rate limiting
   - Quick lookups
   - TTL: 90 days for click data

2. **PostgreSQL/Supabase**: Historical data
   - All conversions
   - Financial records
   - Partner configurations
   - Audit logs
   - Retention: As needed for accounting

### Simplified Implementation Roadmap

#### Phase 1: Core Tracking (Week 1)
- [ ] Implement click ID generation (no cookies)
- [ ] Create `/api/track-click` endpoint (no PII storage)
- [ ] Create `/api/track-conversion` webhook
- [ ] Add click tracking to all partner links
- [ ] Test with Vindstød

#### Phase 2: Compliance & Consent (Week 2)
- [ ] Set up Cookiebot account
- [ ] Implement consent banner
- [ ] Configure GA4 with consent mode v2
- [ ] Create privacy policy page
- [ ] Document data flows

#### Phase 3: Dashboard MVP (Week 3)
- [ ] Simple admin dashboard (Vercel KV data)
- [ ] Daily clicks and conversions
- [ ] Revenue tracking per partner
- [ ] Export functionality for accounting
- [ ] Basic alerts for anomalies

#### Phase 4: Enhanced Analytics (Week 4)
- [ ] GA4 integration for marketing insights
- [ ] Facebook Pixel (with consent only)
- [ ] A/B testing framework
- [ ] Partner performance comparison
- [ ] Automated reporting

## Current Codebase Analysis

### Components Requiring Updates
Based on preliminary research, these components handle external links:

1. **ProviderCard.tsx** (line 32-35)
   - `handleSignupClick()` opens provider links
   - Needs TrackedLink wrapper

2. **ProviderList.tsx**
   - Main provider comparison component
   - Multiple provider cards with links

3. **CalculatorResults.tsx** (line 54-57)
   - `handleSignup()` for calculator results
   - Context includes consumption data

4. **RealPriceComparisonTable.tsx**
   - Comparison table with CTAs
   - Multiple provider links

5. **CallToActionSectionComponent.tsx**
   - Generic CTA component
   - May link to partners

### Technical Considerations

#### Existing Infrastructure We Can Leverage:
- **Vercel KV**: Already used for API caching, perfect for tracking
- **API Pattern**: Existing error handling and rate limiting
- **TypeScript**: Type safety throughout
- **React Query**: Data fetching with caching

#### Challenges to Address:
- **No Current Analytics**: Need to add from scratch
- **Multiple Entry Points**: Links scattered across components
- **Cache Conflicts**: Separate namespace needed for tracking
- **Scale Requirements**: Must handle high volume

### Recommended Approach

1. **Start Simple**: Basic Vindstød tracking first
2. **Add Partners Gradually**: One at a time
3. **Build Dashboard Incrementally**: MVP then enhance
4. **Test Thoroughly**: Each partner integration
5. **Monitor Closely**: Watch for data discrepancies

### Why This Approach is Bulletproof

#### 🛡️ GDPR Compliant by Design
- **No Personal Data**: Click IDs contain no PII
- **Consent Layered**: Enhanced features only with consent
- **Auto-Expiry**: Data automatically deleted after 90 days
- **Transparent**: Users know exactly what we track
- **Industry Standard**: 90-day attribution is common for energy sector

#### ⚡ Simple for Partners
- **1-Hour Integration**: Copy-paste implementation
- **Any Tech Stack**: Works with PHP, Node, Python, etc.
- **No Dependencies**: No libraries or SDKs needed
- **Instant Testing**: Test mode for verification

#### 💪 Reliable Tracking
- **Triple Redundancy**: Webhook + Pixel + Server tracking
- **99.9% Accuracy**: Server-to-server can't be blocked
- **Cross-Device**: Click IDs survive device switches
- **Ad-Blocker Proof**: Core tracking works regardless

#### 📊 Powerful Analytics
- **Real-Time Dashboard**: See conversions instantly
- **Revenue Tracking**: Automatic commission calculation
- **Multi-Partner**: Supports unlimited partners
- **Export Ready**: CSV/Excel for accounting

### Next Steps

1. **Week 1 Priority**:
   - Implement click ID system (NO personal data)
   - Create simple webhook endpoint
   - Update ProviderCard component
   - Test with Vindstød

2. **Legal Preparation**:
   - Draft Data Processing Agreement template
   - Update privacy policy
   - Prepare partner onboarding docs
   - Review with legal counsel

3. **Quick Wins**:
   - Start with Vindstød only
   - Use existing Vercel KV for storage
   - Simple dashboard with key metrics
   - Expand gradually to other partners

### Critical Success Factors

✅ **Keep It Simple**: Resist over-engineering
✅ **Privacy First**: Never track without need
✅ **Partner Friendly**: Make integration effortless
✅ **Document Everything**: Prove compliance
✅ **Test Thoroughly**: Verify every conversion
✅ **Monitor Closely**: Watch for anomalies

This system balances GDPR compliance, ease of implementation, and powerful tracking capabilities. By focusing on anonymous click IDs and server-side tracking, we achieve 99.9% reliability without privacy concerns, while making partner integration so simple they can implement it in under an hour.