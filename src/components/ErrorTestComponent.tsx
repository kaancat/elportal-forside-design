import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bug, Zap, AlertTriangle } from 'lucide-react';

/**
 * Test component for demonstrating error boundary functionality
 * This component should only be used in development for testing purposes
 */
const ErrorTestComponent: React.FC = () => {
  const [errorType, setErrorType] = useState<string>('');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const throwError = () => {
    switch (errorType) {
      case 'render':
        throw new Error('Render error: Component failed during render phase');
      
      case 'async':
        Promise.reject(new Error('Async error: Unhandled promise rejection'));
        break;
      
      case 'event':
        throw new Error('Event error: Error thrown in event handler');
      
      case 'type':
        // TypeScript error simulation
        const obj: any = null;
        obj.nonExistentMethod();
        break;
      
      case 'network':
        throw new Error('fetch failed: Network request failed');
      
      case 'validation':
        throw new Error('validation failed: Invalid form data');
      
      case 'timeout':
        throw new Error('timeout: Request took too long');
      
      default:
        throw new Error('Generic test error for error boundary testing');
    }
  };

  const throwAsyncError = async () => {
    // Simulate an async operation that fails
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Async operation failed: Simulated API error');
  };

  const handleAsyncError = () => {
    throwAsyncError().catch(error => {
      console.error('Caught async error:', error);
      // This won't be caught by error boundary since it's in an async context
      // You'd need to handle this with useErrorHandler hook
    });
  };

  return (
    <Card className="m-4 border-yellow-300 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Bug className="w-5 h-5" />
          Error Testing Component
        </CardTitle>
        <CardDescription className="text-yellow-700">
          This component is only visible in development mode for testing error boundaries.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Warning</AlertTitle>
          <AlertDescription className="text-orange-700">
            These buttons will intentionally crash parts of the application to test error handling.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-yellow-800 mb-2 block">
              Select Error Type:
            </label>
            <Select value={errorType} onValueChange={setErrorType}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Choose an error type to test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="render">Render Error</SelectItem>
                <SelectItem value="event">Event Handler Error</SelectItem>
                <SelectItem value="type">TypeError (null reference)</SelectItem>
                <SelectItem value="network">Network Error</SelectItem>
                <SelectItem value="validation">Validation Error</SelectItem>
                <SelectItem value="timeout">Timeout Error</SelectItem>
                <SelectItem value="async">Async Error (uncaught)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={throwError}
              variant="destructive"
              size="sm"
              disabled={!errorType}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Throw {errorType || 'Error'}
            </Button>
            
            <Button 
              onClick={handleAsyncError}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Throw Async Error
            </Button>
            
            <Button 
              onClick={() => {
                // This will cause a component to re-render and fail
                const badComponent = () => {
                  throw new Error('Component lifecycle error');
                };
                badComponent();
              }}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Component Lifecycle Error
            </Button>
          </div>
        </div>

        <div className="text-xs text-yellow-600 space-y-1">
          <p><strong>Render Error:</strong> Will be caught by error boundary</p>
          <p><strong>Event Handler Error:</strong> Will be caught by error boundary</p>
          <p><strong>Async Error:</strong> Will NOT be caught by error boundary (needs useErrorHandler)</p>
          <p><strong>Network/Validation/Timeout:</strong> Simulates different error types for specific fallbacks</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorTestComponent;