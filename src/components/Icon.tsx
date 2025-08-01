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

  // Early return for no icon data
  if (!icon) {
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  // Priority 1: Non-placeholder SVG (highest quality)
  // BUT: Skip direct SVG if we have metadata URL as backup (VP2 case)
  if (icon.svg && !icon.svg.includes('Placeholder SVG') && !icon.metadata?.url) {
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

  // Priority 2: Metadata URL (works for both VP1 and VP2)
  if (icon.metadata?.url) {
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
          // Hide broken images
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Priority 3: Inline SVG from metadata
  if (icon.metadata?.inlineSvg) {
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

  // Priority 4: Generate URL from icon string (legacy fallback)
  if (icon.icon) {
    const defaultColor = color || '#84db41';
    const generatedUrl = `https://api.iconify.design/${icon.icon}.svg?color=${encodeURIComponent(defaultColor)}`;
    
    return (
      <img
        src={generatedUrl}
        alt={icon.icon || 'Icon'}
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          objectFit: 'contain'
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Final fallback
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