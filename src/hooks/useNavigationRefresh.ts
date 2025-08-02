import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook that provides navigation refresh capabilities
 * - Manual refresh function
 * - Keyboard shortcut (Ctrl+Shift+N) in development
 * - Useful for testing navigation updates
 */
export const useNavigationRefresh = () => {
  const queryClient = useQueryClient();

  const refreshNavigation = async () => {
    console.log('[Navigation] Manual refresh triggered');
    await queryClient.invalidateQueries({ 
      queryKey: ['site-settings'],
      exact: true 
    });
  };

  // Development keyboard shortcut
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+N (or Cmd+Shift+N on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        console.log('[Navigation] Keyboard shortcut triggered');
        refreshNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { refreshNavigation };
};