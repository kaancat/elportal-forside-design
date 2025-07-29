import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SanityService } from '@/services/sanityService'

export function useSiteMetadata() {
  const { data: settings } = useQuery({
    queryKey: ['site-metadata'],
    queryFn: async () => {
      const data = await SanityService.getSiteSettings()
      return data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  })

  useEffect(() => {
    if (!settings) return

    // Update favicon
    if (settings.favicon?.asset?._ref) {
      const faviconUrl = `https://cdn.sanity.io/images/yxesi03x/production/${settings.favicon.asset._ref
        .replace('image-', '')
        .replace('-png', '.png')
        .replace('-jpg', '.jpg')
        .replace('-ico', '.ico')}`
      
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll("link[rel*='icon']")
      existingFavicons.forEach(el => el.remove())
      
      // Add new favicon
      const link = document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = faviconUrl
      document.getElementsByTagName('head')[0].appendChild(link)
      
      // Also add as icon for modern browsers
      const link2 = document.createElement('link')
      link2.rel = 'icon'
      link2.href = faviconUrl
      document.getElementsByTagName('head')[0].appendChild(link2)
    }

    // Update page title if available
    if (settings.title) {
      document.title = settings.title
    }

    // Update meta description if available
    if (settings.description) {
      let metaDescription = document.querySelector("meta[name='description']")
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.getElementsByTagName('head')[0].appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', settings.description)
    }
  }, [settings])

  return settings
}