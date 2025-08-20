'use client'

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page when the route changes.
 * This ensures users always start at the top when navigating to a new page,
 * especially important for mobile users who may be scrolled down.
 * 
 * Based on React Router's recommended pattern for scroll restoration.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip scroll restoration if navigating to a hash link (e.g., #section)
    if (window.location.hash) {
      return;
    }

    // Small timeout to ensure DOM is ready, especially on mobile
    // This helps with slower devices and ensures smooth transition
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use instant for page changes, not smooth
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  // This component doesn't render anything
  return null;
}