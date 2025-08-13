import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  buildTrackingParams, 
  addTrackingToUrl, 
  trackPartnerClick,
  getPartnerSlug 
} from '@/utils/tracking';

interface TrackedLinkProps {
  // Required
  href: string;
  partner: string; // Partner name or ID
  
  // Optional tracking context
  component?: string; // e.g., 'provider_card', 'calculator_results'
  variant?: string; // e.g., 'featured', 'standard'
  consumption?: number; // User's consumption if available
  region?: string; // DK1 or DK2
  estimatedValue?: number; // Estimated monthly/annual value for analytics
  
  // Link behavior
  onClick?: (e: React.MouseEvent) => void;
  openInNewTab?: boolean;
  
  // Styling
  className?: string;
  children: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
  disabled?: boolean;
}

/**
 * TrackedLink - Wrapper component for all partner links
 * Automatically adds tracking parameters and fires tracking events
 * GDPR compliant - only uses anonymous click IDs
 */
export const TrackedLink: React.FC<TrackedLinkProps> = ({
  href,
  partner,
  component = 'unknown',
  variant,
  consumption,
  region,
  estimatedValue,
  onClick,
  openInNewTab = true,
  className,
  children,
  'aria-label': ariaLabel,
  disabled = false
}) => {
  const location = useLocation();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't track if disabled
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    // Validate href
    if (!href || typeof href !== 'string') {
      console.error('TrackedLink: Invalid href provided:', href);
      e.preventDefault();
      return;
    }
    
    try {
      // Get partner slug
      const partnerSlug = getPartnerSlug(partner);
      
      // Build tracking parameters
      const trackingParams = buildTrackingParams({
        partner: partnerSlug,
        component,
        page: location.pathname,
        variant,
        consumption,
        region
      });
      
      // Add tracking to URL
      const trackedUrl = addTrackingToUrl(href, trackingParams);
      
      // Always log in production for debugging
      console.log('🔗 TrackedLink Click:', {
        partner: partnerSlug,
        originalUrl: href,
        trackedUrl,
        trackingParams,
        component,
        page: location.pathname
      });
      
      // Track with enhanced analytics (respects consent)
      trackPartnerClick(partnerSlug, trackingParams.click_id, {
        component,
        page: location.pathname,
        variant,
        consumption,
        region,
        estimatedValue
      });
      
      // Call custom onClick if provided
      if (onClick) {
        onClick(e);
      }
      
      // Always prevent default and handle navigation ourselves
      e.preventDefault();
      e.stopPropagation();
      
      // Open the tracked URL with parameters
      if (openInNewTab) {
        window.open(trackedUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = trackedUrl;
      }
    } catch (error) {
      console.error('TrackedLink error:', error);
      // Fallback: navigate to original URL without tracking
      e.preventDefault();
      e.stopPropagation();
      if (openInNewTab) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  }, [
    disabled, 
    partner, 
    component, 
    location.pathname, 
    variant, 
    consumption, 
    region,
    estimatedValue,
    href, 
    onClick, 
    openInNewTab
  ]);
  
  // Use an anchor tag that looks like a div but handles navigation properly
  // This ensures proper link behavior while intercepting for tracking
  return (
    <a
      href={href}
      onClick={handleClick}
      style={{ 
        display: 'inline-block',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        textDecoration: 'none', // Remove underline
        color: 'inherit', // Inherit color from children
        // Remove any pointer-events that might block clicks
        pointerEvents: disabled ? 'none' : 'auto'
      }}
      className={className}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
};

// Export a Button variant for convenience
interface TrackedButtonProps extends Omit<TrackedLinkProps, 'children'> {
  children: React.ReactNode;
  buttonClassName?: string;
}

export const TrackedButton: React.FC<TrackedButtonProps> = ({
  buttonClassName,
  children,
  ...props
}) => {
  return (
    <TrackedLink {...props} className={buttonClassName}>
      {children}
    </TrackedLink>
  );
};