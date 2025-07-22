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
  // Debug logging in development
  if (icon && process.env.NODE_ENV === 'development') {
    console.log('[Icon] Full icon data:', {
      icon: icon.icon,
      metadata: icon.metadata,
      url: icon.metadata?.url,
      colorInMetadata: icon.metadata?.color,
      colorType: typeof icon.metadata?.color
    });
  }

  // Handle legacy icons that have icon string but no metadata
  if (icon?.icon && !icon.metadata?.url) {
    // Generate URL from icon string for backwards compatibility
    const iconString = icon.icon;
    const defaultColor = color || '#84db41'; // Use provided color or default green
    const generatedUrl = `https://api.iconify.design/${iconString}.svg?color=${encodeURIComponent(defaultColor)}`;
    
    console.log('[Icon] Generated URL for legacy icon:', {
      iconString,
      generatedUrl
    });

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

  // If no icon data at all, show fallback
  if (!icon || (!icon.metadata?.url && !icon.icon)) {
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  // For inline SVG (if plugin provides it)
  if (icon.metadata.inlineSvg) {
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

  // For URL-based icons - just use the URL as-is from the plugin
  // The plugin already includes color parameters in the URL
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
        console.error('[Icon] Failed to load:', icon.metadata.url);
        // Hide broken images
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

// Re-export helper functions for compatibility
export { hasValidIcon, preloadIcons, preloadIcon } from './DynamicIcon';