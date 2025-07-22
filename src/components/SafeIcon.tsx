import React from 'react';
import { HelpCircle } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface SafeIconProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  color?: string;
}

/**
 * Safe icon component that handles icon rendering with proper error handling
 * and type safety for the icon.metadata.color object structure
 */
export const SafeIcon: React.FC<SafeIconProps> = ({ 
  icon,
  size = 24, 
  className = "",
  fallbackIcon,
  color
}) => {
  // Debug logging
  if (icon && process.env.NODE_ENV === 'development') {
    console.log('[SafeIcon] Rendering icon:', {
      hasIcon: !!icon,
      hasMetadata: !!icon?.metadata,
      url: icon?.metadata?.url,
      colorData: icon?.metadata?.color
    });
  }

  // If no icon data, show fallback
  if (!icon?.metadata) {
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  const { inlineSvg, url, iconName } = icon.metadata;

  // For inline SVG
  if (inlineSvg) {
    return (
      <div
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        dangerouslySetInnerHTML={{ __html: inlineSvg }}
      />
    );
  }

  // For URL-based icons
  if (url) {
    try {
      // Use the URL as-is from Sanity
      // The icon-manager plugin already includes all necessary parameters
      return (
        <img
          src={url}
          alt={iconName || 'Icon'}
          className={className}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.error('[SafeIcon] Failed to load icon:', url);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } catch (error) {
      console.error('[SafeIcon] Error rendering icon:', error);
      return fallbackIcon || <HelpCircle size={size} className={className} />;
    }
  }

  // No valid icon data
  return fallbackIcon || <HelpCircle size={size} className={className} />;
};

// Helper to safely extract hex color from metadata
export const getIconColor = (icon?: IconManager): string | undefined => {
  if (!icon?.metadata?.color) return undefined;
  
  // Handle both string and object color formats
  const color = icon.metadata.color;
  if (typeof color === 'string') {
    return color;
  }
  if (typeof color === 'object' && 'hex' in color) {
    return color.hex;
  }
  
  return undefined;
};