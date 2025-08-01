import React from 'react';
import { HelpCircle } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface IconProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  color?: string;
}

/**
 * Simple icon component that displays icons from sanity-plugin-icon-manager
 * The plugin handles all URL construction including color, size, and transformations
 */
export const Icon: React.FC<IconProps> = ({ 
  icon,
  size = 24, 
  className = "",
  fallbackIcon,
  color
}) => {

  // Debug logging for ValueProposition 2 icons
  if (process.env.NODE_ENV === 'development' && icon) {
    console.log('[Icon] Debug data:', {
      hasIcon: !!icon,
      hasSvg: !!icon.svg,
      svgContent: icon.svg ? icon.svg.substring(0, 50) + '...' : 'No SVG',
      hasMetadata: !!icon.metadata,
      metadataUrl: icon.metadata?.url,
      iconString: icon.icon,
      componentPath: 'Icon.tsx'
    });
  }

  // Handle direct SVG field from sanity-plugin-icon-manager
  // Skip placeholder SVGs and use URL instead
  if (icon?.svg && !icon.svg.includes('Placeholder SVG')) {
    return (
      <div
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || 'currentColor'
        }}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    );
  }

  // Handle icons with metadata URL (from icon manager plugin)
  if (icon?.metadata?.url) {
    return (
      <img
        src={icon.metadata.url}
        alt={icon.metadata.iconName || 'Icon'}
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          objectFit: 'contain'
        }}
        onError={(e) => {
          console.error('[Icon] Failed to load metadata URL:', icon.metadata.url);
          // Hide broken images
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Handle legacy icons that have icon string but no metadata
  if (icon?.icon && !icon.metadata?.url) {
    // Generate URL from icon string for backwards compatibility
    const iconString = icon.icon;
    const defaultColor = color || '#84db41'; // Use provided color or default green
    const generatedUrl = `https://api.iconify.design/${iconString}.svg?color=${encodeURIComponent(defaultColor)}`;
    

    return (
      <img
        src={generatedUrl}
        alt={iconString || 'Icon'}
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          objectFit: 'contain'
        }}
        onError={(e) => {
          console.error('[Icon] Failed to load generated URL:', generatedUrl);
          // Show fallback on error
          const parent = e.currentTarget.parentElement;
          if (parent && fallbackIcon) {
            parent.innerHTML = '';
            parent.appendChild(document.createElement('div')).innerHTML = 
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
          }
        }}
      />
    );
  }

  // For inline SVG (if plugin provides it)
  if (icon?.metadata?.inlineSvg) {
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
        dangerouslySetInnerHTML={{ __html: icon.metadata.inlineSvg }}
      />
    );
  }

  // If no icon data at all, show fallback
  if (!icon || (!icon.svg && !icon.metadata?.url && !icon.icon)) {
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  // Final fallback: this should not be reached given our current logic, but kept for safety
  return fallbackIcon || <HelpCircle size={size} className={className} />;
};

// Helper functions
export const hasValidIcon = (iconData: any): iconData is IconManager => {
  // Check if we have direct SVG, icon string (for legacy) or proper metadata
  return !!iconData && (!!iconData.svg || !!iconData.icon || (!!iconData.metadata && !!(iconData.metadata.inlineSvg || iconData.metadata.url)));
};

export const preloadIcons = (icons: Array<IconManager | undefined>) => {
  icons.forEach(icon => {
    if (icon?.metadata?.url) {
      const img = new Image();
      img.src = icon.metadata.url;
    } else if (icon?.icon) {
      // Preload legacy icon URLs
      const img = new Image();
      img.src = `https://api.iconify.design/${icon.icon}.svg`;
    }
  });
};

export const preloadIcon = (url: string) => {
  const img = new Image();
  img.src = url;
};