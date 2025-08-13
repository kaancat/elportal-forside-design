import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';

/**
 * Simple admin dashboard for testing
 * Access: /admin/simple
 */
const SimpleAdmin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Very simple authentication - just for testing
  const handleLogin = () => {
    if (accessCode === 'test123') {
      setIsAuthenticated(true);
    } else {
      alert('Try: test123');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Test our API endpoints directly
      const clickResponse = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          click_id: 'dep_test_dashboard',
          partner_id: 'test_partner',
          timestamp: Date.now()
        })
      });

      const clickResult = await clickResponse.json();
      
      setData({
        clickTest: clickResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setData({
        error: String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Simple Admin Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Test code: <code>test123</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Simple Admin Test</h1>
          <div className="flex gap-2">
            <Button onClick={fetchData} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Test APIs
            </Button>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {data ? (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">Click "Test APIs" to see if tracking endpoints work</p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>Environment Variables Available:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>VITE_COOKIEBOT_ID: {import.meta.env.VITE_COOKIEBOT_ID ? '✅ Set' : '❌ Missing'}</li>
                <li>VITE_GA4_MEASUREMENT_ID: {import.meta.env.VITE_GA4_MEASUREMENT_ID ? '✅ Set' : '❌ Missing'}</li>
                <li>VITE_FB_PIXEL_ID: {import.meta.env.VITE_FB_PIXEL_ID ? '✅ Set' : '❌ Missing'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleAdmin;