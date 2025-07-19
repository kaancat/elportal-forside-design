import React from 'react';
import { HelpCircle } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface IconProps {
  icon?: IconManager;
  color?: string | { hex: string }; // Can be a string or Sanity color object
  size?: number;
  className?: string;
  hoverColor?: string; // Future: for hover states
  darkModeColor?: string; // Future: for dark mode
  fallbackIcon?: React.ReactNode;
}

/**
 * Robust icon component that handles Sanity icon-manager icons with proper URL construction
 * and flexible color management
 */
export const Icon: React.FC<IconProps> = ({ 
  icon,
  color,
  size = 24, 
  className = "",
  fallbackIcon
}) => {
  // If no icon data, show fallback
  if (!icon?.metadata) {
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  const { inlineSvg, url, iconName } = icon.metadata;

  // Extract color string from color prop (handles both string and Sanity color object)
  const colorValue = typeof color === 'string' ? color : color?.hex;

  // Priority 1: Inline SVG (most reliable, no network request)
  if (inlineSvg) {
    // Replace currentColor with the specified color
    const coloredSvg = colorValue 
      ? inlineSvg.replace(/currentColor/g, colorValue)
      : inlineSvg;
    
    return (
      <div
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colorValue || 'currentColor'
        }}
        dangerouslySetInnerHTML={{ __html: coloredSvg }}
      />
    );
  }

  // Priority 2: URL-based icon with proper parameter handling
  if (url) {
    try {
      // Use URL class for robust query parameter handling
      const iconUrl = new URL(url);
      
      // If color is specified and this is an Iconify URL, add color parameter
      if (colorValue && url.includes('api.iconify.design')) {
        // Remove the # from hex colors
        const cleanColor = colorValue.startsWith('#') 
          ? colorValue.substring(1) 
          : colorValue;
        iconUrl.searchParams.set('color', cleanColor);
      }

      return (
        <img
          src={iconUrl.toString()}
          alt={iconName || 'Icon'}
          className={className}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            objectFit: 'contain'
          }}
          // Hide broken images
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } catch (error) {
      console.error('Invalid icon URL:', url, error);
    }
  }

  // No valid icon data
  return fallbackIcon || <HelpCircle size={size} className={className} />;
};

// Re-export helper functions for compatibility
export { hasValidIcon, preloadIcons, preloadIcon } from './DynamicIcon';