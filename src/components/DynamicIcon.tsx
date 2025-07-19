import React from 'react';
import { HelpCircle } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface DynamicIconProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  color?: string; // New prop for dynamic color control
}


/**
 * Simplified, bulletproof icon component for Sanity icon-manager
 * No complex state management, just render what we have
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  icon,
  size = 24, 
  className = "",
  fallbackIcon,
  color = 'currentColor' // Default to currentColor for better CSS inheritance
}) => {
  // Debug mode - set to true to see visual indicators
  const DEBUG_MODE = false; // Disabled for production
  
  // Debug log to verify component is being called
  if (DEBUG_MODE) {
    console.log('[DynamicIcon] Rendering with:', { 
      hasIcon: !!icon,
      hasMetadata: !!icon?.metadata,
      url: icon?.metadata?.url,
      inlineSvg: !!icon?.metadata?.inlineSvg,
      color 
    });
  }

  // If no icon data, show fallback immediately
  if (!icon?.metadata) {
    return fallbackIcon || <HelpCircle size={size} className={className} style={{ color }} />;
  }

  const { inlineSvg, url, iconName } = icon.metadata;

  // Priority 1: Inline SVG (most reliable, no network request)
  if (inlineSvg) {
    // For inline SVG, we need to inject the color into the SVG
    const coloredSvg = inlineSvg.replace(/currentColor/g, color);
    
    return (
      <div
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color // Set color for any SVGs that use currentColor
        }}
        dangerouslySetInnerHTML={{ __html: coloredSvg }}
      />
    );
  }

  // Priority 2: URL-based icon using CSS mask technique
  if (url) {
    // Use the URL exactly as provided by Sanity (preserving all customizations)
    // No URL manipulation needed - CSS mask handles the coloring
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          // The icon color is controlled by backgroundColor
          backgroundColor: color,
          // Use the icon as a mask - this preserves all transformations
          maskImage: `url("${url}")`,
          WebkitMaskImage: `url("${url}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
        role="img"
        aria-label={iconName || 'Icon'}
      />
    );
  }

  // No valid icon data
  return fallbackIcon || <HelpCircle size={size} className={className} style={{ color }} />;
};

// Simple validation - just check if we have the required data
export const hasValidIcon = (iconData: any): iconData is IconManager => {
  return !!iconData?.metadata && !!(iconData.metadata.inlineSvg || iconData.metadata.url);
};

// Simplified preload - let browser handle caching
export const preloadIcons = (icons: Array<IconManager | undefined>) => {
  icons.forEach(icon => {
    if (icon?.metadata?.url) {
      // Preload the URL exactly as provided (no color parameter needed with CSS mask)
      const img = new Image();
      img.src = icon.metadata.url;
    }
  });
};

// Export for backwards compatibility
export const preloadIcon = (url: string) => {
  const img = new Image();
  img.src = url;
};