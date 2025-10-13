import { useEffect } from 'react'
import { useSiteSettings } from './useSiteSettings'

export function useSiteMetadata() {
  const { settings } = useSiteSettings()

  useEffect(() => {
    if (!settings) return

    // Update favicon
    if (settings.favicon?.asset && '_ref' in settings.favicon.asset) {
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