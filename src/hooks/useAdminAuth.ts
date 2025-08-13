import { useState, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'dinelportal_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface AdminSession {
  authenticated: boolean;
  expiresAt: number;
}

/**
 * Simple admin authentication hook
 * Uses sessionStorage for security (clears on browser close)
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (sessionData) {
        const session: AdminSession = JSON.parse(sessionData);
        
        // Check if session is still valid
        if (session.authenticated && Date.now() < session.expiresAt) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear it
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
        }
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
      // Call our auth endpoint
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Create session
        const session: AdminSession = {
          authenticated: true,
          expiresAt: Date.now() + SESSION_DURATION
        };
        
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}