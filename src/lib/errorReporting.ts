import { ErrorInfo } from 'react';

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    component?: string;
    props?: any;
    route?: string;
    userAgent?: string;
    url?: string;
  };
  errorInfo?: {
    componentStack?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  environment: 'development' | 'production';
}

class ErrorReportingService {
  private reports: ErrorReport[] = [];
  private maxReports = 50; // Keep last 50 errors in memory

  /**
   * Log an error report
   */
  reportError(
    error: Error,
    context?: Partial<ErrorReport['context']>,
    errorInfo?: ErrorInfo,
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        component: context?.component,
        props: this.sanitizeProps(context?.props),
        route: context?.route || window.location.pathname,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
      },
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack,
      } : undefined,
      severity,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    };

    // Add to in-memory storage
    this.reports.unshift(report);
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports);
    }

    // Log based on environment
    if (report.environment === 'development') {
      this.logToDevelopmentConsole(report);
    } else {
      this.logToProductionService(report);
    }

    return report.id;
  }

  /**
   * Get all error reports
   */
  getReports(): ErrorReport[] {
    return [...this.reports];
  }

  /**
   * Get error reports by severity
   */
  getReportsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.reports.filter(report => report.severity === severity);
  }

  /**
   * Clear all error reports
   */
  clearReports(): void {
    this.reports = [];
  }

  /**
   * Export error reports for debugging
   */
  exportReports(): string {
    return JSON.stringify(this.reports, null, 2);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeProps(props: any): any {
    if (!props) return undefined;
    
    try {
      // Remove potentially sensitive data
      const sanitized = { ...props };
      
      // Remove functions
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'function') {
          sanitized[key] = '[Function]';
        }
      });

      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });

      return sanitized;
    } catch (e) {
      return '[Error serializing props]';
    }
  }

  private logToDevelopmentConsole(report: ErrorReport): void {
    const style = this.getConsoleStyle(report.severity);
    
    console.group(`%c🐛 Error Report [${report.severity.toUpperCase()}]`, style);
    console.error('Error:', report.error);
    console.log('Context:', report.context);
    if (report.errorInfo) {
      console.log('Error Info:', report.errorInfo);
    }
    console.log('Report ID:', report.id);
    console.log('Timestamp:', report.timestamp.toISOString());
    console.groupEnd();
  }

  private logToProductionService(report: ErrorReport): void {
    // In production, you would send to an error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    console.error('Application error occurred', {
      id: report.id,
      severity: report.severity,
      timestamp: report.timestamp.toISOString(),
    });

    // Example: Send to external service
    // this.sendToErrorService(report);
  }

  private getConsoleStyle(severity: ErrorReport['severity']): string {
    const styles = {
      low: 'color: #059669; font-weight: bold;',
      medium: 'color: #d97706; font-weight: bold;',
      high: 'color: #dc2626; font-weight: bold;',
      critical: 'color: #991b1b; font-weight: bold; background: #fef2f2; padding: 2px 4px;',
    };
    return styles[severity];
  }

  // Example method for sending to external service
  private async sendToErrorService(report: ErrorReport): Promise<void> {
    try {
      // Example: Send to Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });
    } catch (e) {
      console.error('Failed to send error report to service:', e);
    }
  }
}

// Singleton instance
export const errorReporting = new ErrorReportingService();

/**
 * Utility function to report errors with context
 */
export function reportError(
  error: Error,
  context?: {
    component?: string;
    action?: string;
    props?: any;
    additionalInfo?: any;
  },
  severity: ErrorReport['severity'] = 'medium'
): string {
  return errorReporting.reportError(
    error,
    {
      component: context?.component,
      props: context?.props,
      ...context?.additionalInfo,
    },
    undefined,
    severity
  );
}

/**
 * Utility function for API errors
 */
export function reportApiError(
  error: Error,
  endpoint: string,
  method: string = 'GET',
  additionalContext?: any
): string {
  return reportError(
    error,
    {
      component: 'API',
      action: `${method} ${endpoint}`,
      additionalInfo: additionalContext,
    },
    'high'
  );
}

/**
 * Utility function for user action errors
 */
export function reportUserActionError(
  error: Error,
  action: string,
  component: string,
  additionalContext?: any
): string {
  return reportError(
    error,
    {
      component,
      action,
      additionalInfo: additionalContext,
    },
    'medium'
  );
}

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Make error reporting available in console for debugging
  (window as any).errorReporting = errorReporting;
  
  console.log('🔧 Development mode: Error reporting available as window.errorReporting');
}