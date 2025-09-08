import { useSiteSettings } from './useSiteSettings'
import type { SiteSettings } from '@/types/sanity'

export function useFooterData(options?: { enabled?: boolean }) {
  // Use the unified site settings hook and allow disabling when server provided
  const { settings, isLoading, error } = useSiteSettings({ enabled: options?.enabled !== false })
  
  return {
    data: settings as SiteSettings | null,
    isLoading,
    error
  }
}