import { useQuery } from '@tanstack/react-query';
import { SanityService } from '@/services/sanityService';
import { SiteSettings } from '@/types/sanity';

/**
 * Unified hook for fetching site settings from Sanity
 * Used by Navigation, metadata, and any other components that need site-wide settings
 */
export function useSiteSettings() {
  const query = useQuery<SiteSettings | null>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      console.log('[SiteSettings] Fetching site settings...');
      const data = await SanityService.getSiteSettings();
      
      if (data) {
        console.log('[SiteSettings] Successfully fetched site settings');
      } else {
        console.warn('[SiteSettings] Received null site settings from Sanity');
      }
      
      return data;
    },
    // Consider data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Keep in cache for 1 hour
    gcTime: 1000 * 60 * 60,
    // Refetch on window focus for fresh navigation (disabled on mobile to prevent scroll issues)
    refetchOnWindowFocus: !('ontouchstart' in window),
    // Refetch when network reconnects
    refetchOnReconnect: true,
    // Retry with exponential backoff
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.log(`[SiteSettings] Retrying fetch (attempt ${failureCount + 1})`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}