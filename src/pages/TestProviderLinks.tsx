import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SanityService } from '@/services/sanityService';
import { ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Test page to debug provider links and TrackedLink issues
 */
const TestProviderLinks: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const allProviders = await SanityService.getAllProviders();
        setProviders(allProviders);
        
        // Check each provider's signup link
        const linkTests: Record<string, any> = {};
        allProviders.forEach((provider, index) => {
          linkTests[`provider_${index}`] = {
            name: provider.providerName || provider.productName,
            hasSignupLink: !!provider.signupLink,
            signupLink: provider.signupLink,
            isValidUrl: provider.signupLink ? isValidUrl(provider.signupLink) : false,
            isVindstod: provider.isVindstoedProduct || false
          };
        });
        
        setTestResults(linkTests);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const testDirectLink = (url: string, provider: string) => {
    if (!url) {
      alert(`${provider}: No signup link available`);
      return;
    }
    
    console.log(`Testing direct link for ${provider}:`, url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Testing Provider Links...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Provider Links Debug</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Provider Link Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{result.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      {result.hasSignupLink ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {result.hasSignupLink ? 'Has Link' : 'No Link'}
                    </span>
                    <span className="flex items-center gap-1">
                      {result.isValidUrl ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {result.isValidUrl ? 'Valid URL' : 'Invalid URL'}
                    </span>
                    {result.isVindstod && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Vindstød
                      </span>
                    )}
                  </div>
                  {result.signupLink && (
                    <p className="text-xs text-gray-600 mt-1 break-all">
                      {result.signupLink}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {result.hasSignupLink && result.isValidUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testDirectLink(result.signupLink, result.name)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Test Direct
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded">
              <h4 className="font-semibold mb-2">How to Debug:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open browser DevTools (F12)</li>
                <li>Go to Console tab</li>
                <li>Go back to homepage or any page with provider cards</li>
                <li>Click a "Skift til" button</li>
                <li>Look for 🔗 TrackedLink Click logs in console</li>
                <li>Check if URLs have tracking parameters</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Expected Behavior:</h4>
              <p className="text-sm">
                When clicking "Skift til" buttons, you should see console logs with tracking parameters
                and the link should open in a new tab with click_id, utm_source, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestProviderLinks;