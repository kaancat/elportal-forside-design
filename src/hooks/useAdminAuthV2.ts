import { useState, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'dinelportal_admin_token';

/**
 * Improved admin authentication with session tokens
 */
export function useAdminAuthV2() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (token) {
        setSessionToken(token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login...');
      
      const response = await fetch('/api/admin/auth-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials })
      });

      const result = await response.json();
      
      console.log('Login response:', { status: response.status, result });

      if (response.ok && result.success) {
        const token = result.sessionToken;
        sessionStorage.setItem(ADMIN_SESSION_KEY, token);
        setSessionToken(token);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error: ' + String(error) };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setSessionToken(null);
    setIsAuthenticated(false);
  };

  const getAuthHeaders = () => {
    return sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {};
  };

  return {
    isAuthenticated,
    isLoading,
    sessionToken,
    login,
    logout,
    getAuthHeaders
  };
}