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

  // If no icon URL, show fallback
  if (!icon?.metadata?.url) {
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