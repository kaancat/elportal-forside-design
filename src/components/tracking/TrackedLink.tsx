import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  buildTrackingParams, 
  addTrackingToUrl, 
  trackClick,
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
    
    // Track the click (fire and forget)
    trackClick(partnerSlug, trackingParams.click_id, {
      component,
      page: location.pathname,
      variant,
      consumption,
      region
    });
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
    
    // Handle navigation
    if (!e.defaultPrevented) {
      e.preventDefault();
      
      if (openInNewTab) {
        window.open(trackedUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = trackedUrl;
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
    href, 
    onClick, 
    openInNewTab
  ]);
  
  // Render as button-like div for better control
  return (
    <div
      role="link"
      tabIndex={disabled ? -1 : 0}
      className={className}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {children}
    </div>
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