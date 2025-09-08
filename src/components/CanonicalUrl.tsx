'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  generateCanonicalUrl, 
  injectCanonicalTag, 
  removeCanonicalTag,
  shouldHaveCanonical 
} from '@/utils/canonicalUrl';

interface CanonicalUrlProps {
  /**
   * Override the canonical URL (optional)
   * If not provided, will generate from current location
   */
  url?: string;
  /**
   * Base URL for the site
   */
  baseUrl?: string;
  /**
   * Whether to include this canonical tag
   */
  enabled?: boolean;
}

/**
 * Component that manages canonical URL tags for SEO
 * Prevents duplicate content issues by specifying the preferred version of a page
 */
const CanonicalUrl: React.FC<CanonicalUrlProps> = ({ 
  url, 
  baseUrl = 'https://elportal.dk',
  enabled = true 
}) => {
  const pathname = usePathname();
  
  useEffect(() => {
    if (!enabled) {
      removeCanonicalTag();
      return;
    }
    
    // Check if this path should have a canonical tag
    if (!shouldHaveCanonical(pathname)) {
      removeCanonicalTag();
      return;
    }
    
    // Use provided URL or generate from current location
    const canonicalUrl = url || generateCanonicalUrl(pathname, baseUrl);
    
    // Inject the canonical tag
    injectCanonicalTag(canonicalUrl);
    
    // Cleanup on unmount or when URL changes
    return () => {
      removeCanonicalTag();
    };
  }, [pathname, url, baseUrl, enabled]);
  
  return null; // This component doesn't render anything
};

export default CanonicalUrl;

/**
 * Hook for using canonical URLs
 */
export function useCanonicalUrl(customUrl?: string, enabled: boolean = true) {
  const pathname = usePathname();
  
  useEffect(() => {
    if (!enabled || !shouldHaveCanonical(pathname)) {
      removeCanonicalTag();
      return;
    }
    
    const canonicalUrl = customUrl || generateCanonicalUrl(pathname);
    injectCanonicalTag(canonicalUrl);
    
    return () => {
      removeCanonicalTag();
    };
  }, [pathname, customUrl, enabled]);
}