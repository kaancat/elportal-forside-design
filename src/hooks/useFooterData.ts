import { useQuery } from '@tanstack/react-query'
import { SanityService } from '@/services/sanityService'
import { SiteSettings } from '@/types/sanity'

export function useFooterData() {
  return useQuery<SiteSettings | null, Error>({
    queryKey: ['footer', 'site-settings'],
    queryFn: async () => {
      const data = await SanityService.getSiteSettings()
      return data
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch footer on window focus
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 3, // Retry failed requests 3 times
  })
}