# Vindstød Integration Guide - Conversion Tracking

## Overview
Simple, GDPR-compliant conversion tracking that takes less than 1 hour to implement. No cookies, no JavaScript libraries, just one parameter to capture.

## Quick Start (15 minutes)

### What You Need to Do
1. **Capture `click_id` from URL** (1 line of code)
2. **Save it with the order** (1 database field)
3. **Notify us on conversion** (webhook or pixel)

That's literally it. No complex integration needed.

## Step 1: Capture Click ID

When users arrive from DinElportal, they'll have ONE parameter that matters:

```
https://vindstod.dk/?click_id=dep_lm5k2n8_a3b9x7c2
```

### Just Capture This ONE Parameter
- `click_id` - The ONLY required parameter (format: `dep_[timestamp]_[random]`)

Optional UTM parameters may be included for your own analytics but are NOT required for tracking.

### Implementation Example (JavaScript)
```javascript
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const clickId = urlParams.get('click_id');

if (clickId && clickId.startsWith('dep_')) {
    // Store in session/cookie for later use
    sessionStorage.setItem('dinelportal_click_id', clickId);
    
    // Or add to your form as hidden field
    document.getElementById('signup-form').innerHTML += 
        `<input type="hidden" name="dinelportal_click_id" value="${clickId}">`;
}
```

### Implementation Example (PHP)
```php
// Capture click ID
$click_id = $_GET['click_id'] ?? null;

if ($click_id && strpos($click_id, 'dep_') === 0) {
    // Store in session
    $_SESSION['dinelportal_click_id'] = $click_id;
    
    // Or store in database with customer record
    $customer->dinelportal_click_id = $click_id;
    $customer->save();
}
```

## Step 2: Store with Customer Signup

When a customer completes signup, store the click_id with their record:

### Database Schema Example
```sql
ALTER TABLE customers ADD COLUMN dinelportal_click_id VARCHAR(50);
ALTER TABLE customers ADD COLUMN signup_source VARCHAR(50) DEFAULT 'direct';
ALTER TABLE customers ADD INDEX idx_dinelportal_click (dinelportal_click_id);
```

### During Signup Process
```javascript
// When customer completes signup
async function completeSignup(customerData) {
    // Get stored click ID
    const clickId = sessionStorage.getItem('dinelportal_click_id');
    
    if (clickId) {
        customerData.dinelportal_click_id = clickId;
        customerData.signup_source = 'dinelportal';
    }
    
    // Save customer
    await saveCustomer(customerData);
    
    // Trigger webhook (see Step 3)
    if (clickId) {
        await sendDinElPortalWebhook(customerData);
    }
}
```

## Step 3: Send Conversion Webhook

When a customer from DinElportal successfully signs up, send a webhook to our tracking endpoint.

### Webhook Details

**Endpoint**: `https://www.dinelportal.dk/api/track-conversion`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
X-Webhook-Secret: [PROVIDED_SECRET_KEY]
```

**Request Body**:
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

### Field Descriptions
- `click_id` **(required)**: The click ID from DinElportal
- `conversion_time` **(required)**: ISO 8601 timestamp of signup completion
- `customer_id` **(required)**: Your internal customer ID (anonymized is fine)
- `product_selected` **(required)**: Which product they signed up for
- `contract_value` **(optional)**: Total contract value in DKK
- `contract_length_months` **(optional)**: Contract duration

### Implementation Example (Node.js)
```javascript
const axios = require('axios');

async function sendDinElPortalConversion(customer) {
    if (!customer.dinelportal_click_id) return;
    
    const payload = {
        click_id: customer.dinelportal_click_id,
        conversion_time: new Date().toISOString(),
        customer_id: customer.id,
        product_selected: customer.product,
        contract_value: customer.annual_value,
        contract_length_months: 12
    };
    
    try {
        const response = await axios.post(
            'https://www.dinelportal.dk/api/track-conversion',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': process.env.DINELPORTAL_WEBHOOK_SECRET
                }
            }
        );
        
        console.log('DinElportal conversion tracked:', response.data);
    } catch (error) {
        console.error('Failed to track DinElportal conversion:', error);
        // Consider retry logic here
    }
}
```

### Implementation Example (PHP)
```php
function sendDinElPortalConversion($customer) {
    if (empty($customer->dinelportal_click_id)) return;
    
    $payload = [
        'click_id' => $customer->dinelportal_click_id,
        'conversion_time' => date('c'),
        'customer_id' => $customer->id,
        'product_selected' => $customer->product,
        'contract_value' => $customer->annual_value,
        'contract_length_months' => 12
    ];
    
    $ch = curl_init('https://www.dinelportal.dk/api/track-conversion');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-Webhook-Secret: ' . $_ENV['DINELPORTAL_WEBHOOK_SECRET']
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        error_log('DinElportal conversion tracked successfully');
    } else {
        error_log('Failed to track DinElportal conversion: ' . $response);
    }
}
```

## Step 4: Tracking Pixel (Optional but Recommended)

Add this tracking pixel to your thank you/confirmation page for redundant tracking:

```html
<!-- DinElportal Conversion Tracking Pixel -->
<script>
(function() {
    // Get the stored click ID
    var clickId = sessionStorage.getItem('dinelportal_click_id');
    if (!clickId) return;
    
    // Create tracking pixel
    var img = new Image(1, 1);
    img.src = 'https://www.dinelportal.dk/api/track-pixel?click_id=' + clickId + 
              '&event=conversion&value=' + (window.contractValue || 0);
    
    // Clear the click ID after conversion
    sessionStorage.removeItem('dinelportal_click_id');
})();
</script>
```

## Testing

### Test Environment
We provide a test endpoint for integration testing:

**Test Endpoint**: `https://www.dinelportal.dk/api/track-conversion-test`

Use the same payload format. The test endpoint will:
1. Validate your request format
2. Check authentication
3. Return detailed feedback
4. NOT count as real conversions

### Test with cURL
```bash
# Test your webhook implementation
curl -X POST https://www.dinelportal.dk/api/track-conversion-test \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SECRET_KEY" \
  -d '{
    "click_id": "dep_test_123456",
    "conversion_time": "2025-01-13T12:00:00Z",
    "customer_id": "test_customer_1",
    "product_selected": "vindstod_spot",
    "contract_value": 10200,
    "contract_length_months": 12
  }'

# Expected response:
# {
#   "status": "success",
#   "message": "Test conversion received successfully",
#   "validation": {
#     "click_id": "valid",
#     "timestamp": "valid",
#     "authentication": "valid"
#   }
# }
```

### Testing Checklist
- [ ] Click through from our test page: https://www.dinelportal.dk/test-tracking
- [ ] Verify click_id is captured in your system
- [ ] Complete a test signup
- [ ] Verify webhook is sent successfully
- [ ] Check response code is 200
- [ ] Verify tracking pixel loads (if implemented)

## Security

### Authentication
- **Webhook Secret**: We'll provide you with a unique secret key
- **Keep it secure**: Store in environment variables, not in code
- **Rotate if compromised**: Contact us immediately

### IP Whitelisting (Optional)
If you want extra security, provide us with your server IPs and we'll whitelist them.

### HTTPS Only
All tracking endpoints use HTTPS. Never send tracking data over HTTP.

## Response Codes

Our webhook endpoint will return:

| Code | Meaning | Action Required |
|------|---------|----------------|
| 200 | Success | None - conversion tracked |
| 400 | Bad Request | Check payload format |
| 401 | Unauthorized | Check webhook secret |
| 404 | Click ID not found | ID expired or invalid |
| 409 | Duplicate | Conversion already tracked |
| 429 | Rate Limited | Retry after delay |
| 500 | Server Error | Retry with exponential backoff |

### Retry Logic
For 429 or 500 errors, implement exponential backoff:
- 1st retry: After 1 second
- 2nd retry: After 2 seconds
- 3rd retry: After 4 seconds
- Then give up and log for manual review

## Why This is GDPR Compliant

✅ **No Cookies**: We don't set any cookies on your site
✅ **No Personal Data**: Click IDs are anonymous identifiers
✅ **No JavaScript Tracking**: No privacy-invasive scripts
✅ **User Control**: Works with all privacy settings
✅ **Transparent**: Users can see the click_id in the URL

## FAQ

### Q: Is this really all we need to do?
A: Yes! Just capture click_id, save it, and tell us when someone converts.

### Q: What about GDPR?
A: Click IDs are anonymous and contain no personal data. Fully compliant.

### Q: How long is a click valid for attribution?
A: 90 days from the initial click. This gives customers plenty of time to research and decide on their energy provider.

### Q: Why 90 days?
A: Energy contracts are complex purchases. Industry standard is 30-90 days. Many customers research for weeks before switching providers.

### Q: What if a user clears cookies?
A: Doesn't matter - we don't use cookies. The click_id is all we need.

### Q: How reliable is this?
A: 99.9% reliable. Server-to-server tracking can't be blocked by browsers or ad-blockers.

### Q: Can we test first?
A: Yes! Use our test endpoint to verify everything works before going live.

### Q: What if we miss capturing some click_ids?
A: That's OK. You only pay commission on tracked conversions. But capturing them means more revenue for both of us!

## Support

### Technical Support
**Email**: tech@dinelportal.dk  
**Response Time**: Within 24 hours on business days

### Integration Issues
**Contact**: Kaan Catalkaya  
**Email**: kaan@dinelportal.dk  
**Phone**: +45 XX XX XX XX  

### Webhook Secret Request
Contact us to receive your unique webhook secret. Do not use a placeholder or test key in production.

## Appendix: Complete Integration Example

Here's a minimal complete implementation:

### HTML Landing Page
```html
<!DOCTYPE html>
<html>
<head>
    <script>
    // Capture and store click_id immediately
    (function() {
        const params = new URLSearchParams(window.location.search);
        const clickId = params.get('click_id');
        if (clickId && clickId.startsWith('dep_')) {
            sessionStorage.setItem('dinelportal_click_id', clickId);
            console.log('DinElportal tracking initialized:', clickId);
        }
    })();
    </script>
</head>
<body>
    <!-- Your landing page content -->
</body>
</html>
```

### Signup Form Handler
```javascript
async function handleSignupSubmit(formData) {
    // Add click_id to form data
    const clickId = sessionStorage.getItem('dinelportal_click_id');
    if (clickId) {
        formData.dinelportal_click_id = clickId;
    }
    
    // Process signup
    const customer = await createCustomer(formData);
    
    // Send conversion webhook
    if (customer.dinelportal_click_id) {
        await fetch('https://www.dinelportal.dk/api/track-conversion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': 'YOUR_SECRET_KEY'
            },
            body: JSON.stringify({
                click_id: customer.dinelportal_click_id,
                conversion_time: new Date().toISOString(),
                customer_id: customer.id,
                product_selected: 'vindstod_spot'
            })
        });
    }
    
    // Redirect to thank you page
    window.location.href = '/thank-you';
}
```

### Thank You Page
```html
<!DOCTYPE html>
<html>
<head>
    <title>Tak for din tilmelding!</title>
</head>
<body>
    <h1>Velkommen til Vindstød!</h1>
    
    <!-- DinElportal Tracking Pixel -->
    <script>
    (function() {
        var clickId = sessionStorage.getItem('dinelportal_click_id');
        if (clickId) {
            var img = new Image(1, 1);
            img.src = 'https://www.dinelportal.dk/api/track-pixel?click_id=' + clickId + '&event=conversion';
            sessionStorage.removeItem('dinelportal_click_id');
        }
    })();
    </script>
</body>
</html>
```

That's all you need for basic integration! Contact us if you have any questions.