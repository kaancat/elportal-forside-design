import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { 
  ApiErrorFallback, 
  ChartErrorFallback, 
  CalculatorErrorFallback, 
  ContentErrorFallback,
  NavigationErrorFallback,
  FormErrorFallback
} from './ErrorFallbacks';

type ErrorBoundaryLevel = 'app' | 'page' | 'component';
type ComponentType = 'api' | 'chart' | 'calculator' | 'content' | 'navigation' | 'form' | 'generic';

interface WithErrorBoundaryOptions {
  level?: ErrorBoundaryLevel;
  componentType?: ComponentType;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  displayName?: string;
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const {
    level = 'component',
    componentType = 'generic',
    fallback,
    onError,
    displayName
  } = options;

  const WithErrorBoundaryComponent = (props: P) => {
    // Generate appropriate fallback based on component type
    const generateFallback = () => {
      if (fallback) return fallback;

      const defaultRetry = () => window.location.reload();
      
      switch (componentType) {
        case 'api':
          return <ApiErrorFallback onRetry={defaultRetry} />;
        
        case 'chart':
          return <ChartErrorFallback 
            onRetry={defaultRetry}
            title={displayName || 'Diagram'}
          />;
        
        case 'calculator':
          return <CalculatorErrorFallback 
            onRetry={defaultRetry}
            onReset={() => window.location.reload()}
          />;
        
        case 'content':
          return <ContentErrorFallback onRetry={defaultRetry} />;
        
        case 'navigation':
          return <NavigationErrorFallback onRetry={defaultRetry} />;
        
        case 'form':
          return <FormErrorFallback onRetry={defaultRetry} />;
        
        default:
          return undefined; // Use ErrorBoundary's default fallback
      }
    };

    return (
      <ErrorBoundary
        level={level}
        fallback={generateFallback()}
        onError={onError}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = 
    displayName || `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * Convenience wrapper for API components
 */
export function withApiErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'api',
    level: 'component',
    displayName,
  });
}

/**
 * Convenience wrapper for chart/graph components
 */
export function withChartErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'chart',
    level: 'component',
    displayName,
  });
}

/**
 * Convenience wrapper for calculator components
 */
export function withCalculatorErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'calculator',
    level: 'component',
    displayName,
  });
}

/**
 * Convenience wrapper for content components
 */
export function withContentErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'content',
    level: 'component',
    displayName,
  });
}

/**
 * Convenience wrapper for navigation components
 */
export function withNavigationErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'navigation',
    level: 'component',
    displayName,
  });
}

/**
 * Convenience wrapper for form components
 */
export function withFormErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'form',
    level: 'component',
    displayName,
  });
}