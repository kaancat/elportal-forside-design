/**
 * Test script to validate webhook authentication
 * Run with: node test-webhook.js
 */

const testWebhook = async () => {
  const clickId = 'dep_test_' + Date.now();
  const webhookSecret = process.env.CONVERSION_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('❌ CONVERSION_WEBHOOK_SECRET not found in environment');
    console.log('💡 Make sure to add it to your .env.local file');
    return;
  }
  
  console.log('🧪 Testing webhook with click ID:', clickId);
  console.log('🔐 Using secret:', webhookSecret.substring(0, 10) + '...');
  
  // First, create a click to track
  console.log('\n1️⃣ Creating test click...');
  const clickResponse = await fetch('http://localhost:3000/api/track-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      click_id: clickId,
      partner_id: 'vindstod',
      timestamp: Date.now(),
      source: { page: '/test', component: 'test_script' }
    })
  });
  
  const clickResult = await clickResponse.json();
  console.log('Click result:', clickResult);
  
  if (!clickResponse.ok) {
    console.error('❌ Click tracking failed');
    return;
  }
  
  // Then test conversion
  console.log('\n2️⃣ Testing conversion webhook...');
  const conversionResponse = await fetch('http://localhost:3000/api/track-conversion', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Webhook-Secret': webhookSecret
    },
    body: JSON.stringify({
      click_id: clickId,
      conversion_time: new Date().toISOString(),
      customer_id: 'test_customer_123',
      product_selected: 'vindstod_spot',
      contract_value: 12000,
      contract_length_months: 12
    })
  });
  
  const conversionResult = await conversionResponse.json();
  console.log('Conversion result:', conversionResult);
  
  if (conversionResponse.ok) {
    console.log('✅ Full tracking flow works!');
    console.log('💰 Revenue tracking: 12,000 DKK');
  } else {
    console.error('❌ Conversion tracking failed');
    console.error('Status:', conversionResponse.status);
    console.error('Error:', conversionResult);
  }
};

// Run the test
testWebhook().catch(console.error);