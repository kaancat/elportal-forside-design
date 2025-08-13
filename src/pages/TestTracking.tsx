import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrackedLink } from '@/components/tracking/TrackedLink';
import { 
  generateClickId, 
  getClickIdFromUrl, 
  createTrackingPixelUrl,
  isEnhancedTrackingEnabled,
  isMarketingTrackingEnabled 
} from '@/utils/tracking';
import { Check, X, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

/**
 * Test page for tracking implementation
 * Access at: /test-tracking
 */
const TestTracking: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'success' | 'error'; message?: string }>>({});
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [generatedClickId, setGeneratedClickId] = useState<string>('');
  const [consentStatus, setConsentStatus] = useState({
    statistics: false,
    marketing: false,
    loaded: false
  });
  
  // Check if we arrived with a click_id (partner simulation)
  const urlClickId = getClickIdFromUrl();
  
  useEffect(() => {
    // Generate a test click ID on mount
    setGeneratedClickId(generateClickId());
    
    // Check consent status
    const checkConsent = () => {
      setConsentStatus({
        statistics: isEnhancedTrackingEnabled(),
        marketing: isMarketingTrackingEnabled(),
        loaded: typeof (window as any).Cookiebot !== 'undefined'
      });
    };
    
    // Check immediately
    checkConsent();
    
    // Listen for consent changes
    window.addEventListener('CookiebotOnAccept', checkConsent);
    window.addEventListener('CookiebotOnDecline', checkConsent);
    
    return () => {
      window.removeEventListener('CookiebotOnAccept', checkConsent);
      window.removeEventListener('CookiebotOnDecline', checkConsent);
    };
  }, []);
  
  // Test click ID generation
  const testClickIdGeneration = () => {
    try {
      const clickId = generateClickId();
      if (clickId && clickId.startsWith('dep_')) {
        setTestResults(prev => ({
          ...prev,
          clickIdGen: { status: 'success', message: `Generated: ${clickId}` }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          clickIdGen: { status: 'error', message: 'Invalid format' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        clickIdGen: { status: 'error', message: String(error) }
      }));
    }
  };
  
  // Test click tracking API
  const testClickTracking = async () => {
    setIsTestingApi(true);
    const testClickId = generateClickId();
    
    try {
      const response = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          click_id: testClickId,
          partner_id: 'test_partner',
          timestamp: Date.now(),
          source: {
            page: '/test-tracking',
            component: 'test_button'
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          clickApi: { status: 'success', message: `Tracked: ${testClickId}` }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          clickApi: { status: 'error', message: data.error || 'API error' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        clickApi: { status: 'error', message: String(error) }
      }));
    } finally {
      setIsTestingApi(false);
    }
  };
  
  // Test conversion webhook
  const testConversionWebhook = async () => {
    const testClickId = generatedClickId || generateClickId();
    
    // First track a click
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        click_id: testClickId,
        partner_id: 'vindstod',
        timestamp: Date.now()
      })
    });
    
    // Then test conversion
    try {
      const response = await fetch('/api/track-conversion', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'dev-secret' // Use test secret
        },
        body: JSON.stringify({
          click_id: testClickId,
          conversion_time: new Date().toISOString(),
          customer_id: 'test_customer_123',
          product_selected: 'vindstod_spot',
          contract_value: 10000
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          conversionApi: { status: 'success', message: 'Conversion tracked!' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          conversionApi: { status: 'error', message: data.error || 'Webhook error' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        conversionApi: { status: 'error', message: String(error) }
      }));
    }
  };
  
  const renderTestResult = (key: string) => {
    const result = testResults[key];
    if (!result) return <Badge variant="outline">Not tested</Badge>;
    
    if (result.status === 'pending') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (result.status === 'success') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm">{result.message || 'Success'}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-red-600">
        <X className="h-4 w-4" />
        <span className="text-sm">{result.message || 'Failed'}</span>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Tracking System Test Page</h1>
      
      {/* Partner Simulation */}
      {urlClickId && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Partner Mode Active</CardTitle>
            <CardDescription>
              You arrived with a click ID, simulating a partner receiving traffic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Click ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{urlClickId}</code></p>
              <p className="text-sm text-gray-600">
                This is what Vindstød would capture and store with the customer order.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Consent Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GDPR Consent Status</CardTitle>
          <CardDescription>
            Current consent levels and what tracking is enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Cookiebot Loaded:</span>
            {consentStatus.loaded ? (
              <Badge className="bg-green-500">✅ Ready</Badge>
            ) : (
              <Badge variant="outline">⏳ Loading</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>Statistics (GA4):</span>
            {consentStatus.statistics ? (
              <Badge className="bg-green-500">✅ Consented</Badge>
            ) : (
              <Badge variant="outline">❌ Not Consented</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>Marketing (Facebook):</span>
            {consentStatus.marketing ? (
              <Badge className="bg-green-500">✅ Consented</Badge>
            ) : (
              <Badge variant="outline">❌ Not Consented</Badge>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-4">
            <strong>Note:</strong> Basic click tracking works regardless of consent (GDPR compliant)
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tracking Tests</CardTitle>
          <CardDescription>
            Test each component of the tracking system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Click ID Generation */}
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-semibold">Click ID Generation</h3>
              <p className="text-sm text-gray-600">Generate unique tracking IDs</p>
            </div>
            <div className="flex items-center gap-4">
              {renderTestResult('clickIdGen')}
              <Button onClick={testClickIdGeneration} size="sm">
                Test
              </Button>
            </div>
          </div>
          
          {/* Click Tracking API */}
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-semibold">Click Tracking API</h3>
              <p className="text-sm text-gray-600">Store clicks in Vercel KV</p>
            </div>
            <div className="flex items-center gap-4">
              {renderTestResult('clickApi')}
              <Button onClick={testClickTracking} size="sm" disabled={isTestingApi}>
                {isTestingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
              </Button>
            </div>
          </div>
          
          {/* Conversion Webhook */}
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-semibold">Conversion Webhook</h3>
              <p className="text-sm text-gray-600">Partner conversion tracking</p>
            </div>
            <div className="flex items-center gap-4">
              {renderTestResult('conversionApi')}
              <Button onClick={testConversionWebhook} size="sm">
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Test Partner Links */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Partner Links</CardTitle>
          <CardDescription>
            Click these to test the TrackedLink component (check console and network tab)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrackedLink
            href="https://vindstod.dk"
            partner="Vindstød"
            component="test_page"
            variant="test_featured"
            consumption={4000}
            region="DK2"
            className="block"
          >
            <Button className="w-full bg-brand-green hover:bg-brand-green/90">
              <ExternalLink className="mr-2 h-4 w-4" />
              Test Vindstød Link (Featured)
            </Button>
          </TrackedLink>
          
          <TrackedLink
            href="https://example.com"
            partner="Test Partner"
            component="test_page"
            variant="test_standard"
            consumption={2000}
            region="DK1"
            className="block"
          >
            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Test Generic Partner Link
            </Button>
          </TrackedLink>
        </CardContent>
      </Card>
      
      {/* Tracking Pixel Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tracking Pixel URL</CardTitle>
          <CardDescription>
            This is what partners would add to their thank you page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm break-all">
            {`<img src="${createTrackingPixelUrl(generatedClickId, 'conversion', 10000)}" width="1" height="1" />`}
          </div>
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p><strong>For Developers:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Open browser DevTools (F12)</li>
                <li>Go to Network tab</li>
                <li>Click test buttons and links</li>
                <li>Look for <code>/api/track-click</code> requests</li>
                <li>Check Console for tracking logs</li>
              </ol>
            </div>
          </div>
          
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p><strong>For Partners:</strong></p>
              <p>Share this URL to test integration:</p>
              <code className="block bg-gray-100 p-2 rounded">
                {window.location.origin}/test-tracking?click_id=dep_test_123
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestTracking;