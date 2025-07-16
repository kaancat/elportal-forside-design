import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'app' | 'page' | 'component';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Error info:', errorInfo);
    } else {
      // In production, you might want to send to an error reporting service
      // Example: logErrorToService(error, errorInfo);
      console.error('Application error occurred');
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI based on level
      const { level = 'component' } = this.props;
      const { error, errorInfo } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      // Different UI based on error boundary level
      switch (level) {
        case 'app':
          return <AppErrorFallback 
            error={error} 
            errorInfo={errorInfo} 
            isDevelopment={isDevelopment}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />;
        
        case 'page':
          return <PageErrorFallback 
            error={error} 
            errorInfo={errorInfo} 
            isDevelopment={isDevelopment}
            onReset={this.handleReset}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />;
        
        case 'component':
        default:
          return <ComponentErrorFallback 
            error={error} 
            errorInfo={errorInfo} 
            isDevelopment={isDevelopment}
            onReset={this.handleReset}
          />;
      }
    }

    return this.props.children;
  }
}

// App-level error fallback (full page crash)
const AppErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDevelopment: boolean;
  onReload: () => void;
  onGoHome: () => void;
}> = ({ error, errorInfo, isDevelopment, onReload, onGoHome }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Beklager, noget gik galt
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Vi oplever tekniske problemer. Prøv venligst at genindlæse siden.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isDevelopment && error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Fejldetaljer (kun i udvikling)</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="font-mono text-sm text-red-700">{error.message}</p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-600 hover:underline">
                      Se stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto bg-red-100 p-2 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex gap-3 justify-center">
          <Button 
            onClick={onReload}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Genindlæs siden
          </Button>
          <Button 
            onClick={onGoHome}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Gå til forsiden
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Page-level error fallback
const PageErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDevelopment: boolean;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}> = ({ error, errorInfo, isDevelopment, onReset, onReload, onGoHome }) => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Siden kunne ikke indlæses</CardTitle>
              <CardDescription>Der opstod en fejl ved indlæsning af denne side</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {isDevelopment && error && (
          <CardContent>
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-sm">
                <code className="font-mono text-xs">{error.message}</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <CardFooter className="flex gap-2">
          <Button 
            onClick={onReset}
            variant="default"
            size="sm"
          >
            Prøv igen
          </Button>
          <Button 
            onClick={onReload}
            variant="outline"
            size="sm"
          >
            Genindlæs
          </Button>
          <Button 
            onClick={onGoHome}
            variant="ghost"
            size="sm"
          >
            Forside
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Component-level error fallback
const ComponentErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDevelopment: boolean;
  onReset: () => void;
}> = ({ error, errorInfo, isDevelopment, onReset }) => {
  return (
    <Alert className="m-4 border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Komponent kunne ikke indlæses</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-yellow-700">
          Denne del af siden kunne ikke vises korrekt.
        </p>
        {isDevelopment && error && (
          <p className="mt-1 font-mono text-xs text-yellow-600">
            {error.message}
          </p>
        )}
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          Prøv igen
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorBoundary;
export { AppErrorFallback, PageErrorFallback, ComponentErrorFallback };