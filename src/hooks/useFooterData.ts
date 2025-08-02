import { useSiteSettings } from './useSiteSettings'

export function useFooterData() {
  // Use the unified site settings hook
  const { settings, isLoading, error } = useSiteSettings()
  
  return {
    data: settings,
    isLoading,
    error
  }
}