import { useCallback, useState } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

interface UseErrorHandlerReturn {
  errorState: ErrorState;
  clearError: () => void;
  handleError: (error: Error, context?: string) => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => (...args: T) => Promise<R | void>;
}

/**
 * Hook for handling errors in functional components
 * Provides error state management and error boundary-like functionality
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
  });

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null,
    });
  }, []);

  const handleError = useCallback((error: Error, context?: string) => {
    const errorId = generateErrorId();
    
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context || 'component'}:`, error);
      console.error('Error ID:', errorId);
    } else {
      // In production, log minimal information
      console.error('Application error occurred', { errorId, context });
      // Here you could send to an error reporting service
      // logErrorToService(error, { errorId, context });
    }

    setErrorState({
      hasError: true,
      error,
      errorId,
    });
  }, []);

  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      context?: string
    ) => {
      return async (...args: T): Promise<R | void> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error instanceof Error ? error : new Error(String(error)), context);
        }
      };
    },
    [handleError]
  );

  return {
    errorState,
    clearError,
    handleError,
    withErrorHandling,
  };
};

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook specifically for API error handling
 */
export const useApiErrorHandler = () => {
  const { errorState, clearError, handleError, withErrorHandling } = useErrorHandler();

  const handleApiError = useCallback((error: Error, endpoint?: string) => {
    // Add API-specific error handling logic
    const context = endpoint ? `API call to ${endpoint}` : 'API call';
    
    // Check if it's a network error
    if (error.message.includes('fetch')) {
      const networkError = new Error('Netværksfejl: Tjek din internetforbindelse');
      handleError(networkError, context);
      return;
    }

    // Check if it's a timeout error
    if (error.message.includes('timeout')) {
      const timeoutError = new Error('Anmodningen tog for lang tid');
      handleError(timeoutError, context);
      return;
    }

    // Default API error handling
    handleError(error, context);
  }, [handleError]);

  const withApiErrorHandling = useCallback(
    <T extends any[], R>(
      apiCall: (...args: T) => Promise<R>,
      endpoint?: string
    ) => {
      return withErrorHandling(apiCall, endpoint ? `API: ${endpoint}` : 'API call');
    },
    [withErrorHandling]
  );

  return {
    errorState,
    clearError,
    handleApiError,
    withApiErrorHandling,
  };
};

/**
 * Hook for handling form submission errors
 */
export const useFormErrorHandler = () => {
  const { errorState, clearError, handleError } = useErrorHandler();

  const handleFormError = useCallback((error: Error, formName?: string) => {
    const context = formName ? `Form: ${formName}` : 'Form submission';
    
    // Add form-specific error handling
    if (error.message.includes('validation')) {
      const validationError = new Error('Udfyld venligst alle påkrævede felter korrekt');
      handleError(validationError, context);
      return;
    }

    if (error.message.includes('submit')) {
      const submitError = new Error('Formularen kunne ikke sendes. Prøv igen.');
      handleError(submitError, context);
      return;
    }

    handleError(error, context);
  }, [handleError]);

  return {
    errorState,
    clearError,
    handleFormError,
  };
};