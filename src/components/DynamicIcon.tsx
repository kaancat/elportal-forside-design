import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface DynamicIconProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

// Cache for preloaded icons to prevent re-fetching
const iconCache = new Map<string, boolean>();

// Preload critical icons to improve perceived performance
export const preloadIcon = (url: string) => {
  if (!iconCache.has(url)) {
    const img = new Image();
    img.src = url;
    img.onload = () => iconCache.set(url, true);
    img.onerror = () => iconCache.set(url, false);
  }
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  icon,
  size = 24, 
  className = "",
  fallbackIcon
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // COMPREHENSIVE DEBUG LOGGING
  console.log('[DynamicIcon] Received icon prop:', {
    raw: icon,
    stringified: JSON.stringify(icon, null, 2),
    hasIcon: !!icon,
    hasMetadata: !!icon?.metadata,
    hasInlineSvg: !!icon?.metadata?.inlineSvg,
    hasUrl: !!icon?.metadata?.url,
    iconName: icon?.metadata?.iconName
  });

  // Reset error state when icon changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [icon?.metadata?.url, icon?.metadata?.iconName]);

  // Log icon loading issues for debugging in development
  const logIconError = (error: string) => {
    console.warn(`[DynamicIcon] ${error}`, {
      iconName: icon?.metadata?.iconName,
      url: icon?.metadata?.url,
      hasInlineSvg: !!icon?.metadata?.inlineSvg,
      fullIcon: icon
    });
  };

  // If no icon data, show fallback
  if (!icon || !icon.metadata) {
    console.warn('[DynamicIcon] No icon data provided, using fallback', { icon, fallbackIcon });
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  // Priority 1: Use inline SVG if available (most reliable, no network request)
  if (icon.metadata.inlineSvg) {
    return (
      <div
        className={className}
        style={{ 
          width: size, 
          height: size, 
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        dangerouslySetInnerHTML={{ __html: icon.metadata.inlineSvg }}
      />
    );
  }

  // Priority 2: Use URL-based icon if available (requires network request)
  if (icon.metadata.url && !imageError) {
    // Add color parameter to Iconify URLs to make them white
    const iconUrl = icon.metadata.url.includes('api.iconify.design') 
      ? `${icon.metadata.url}&color=white`
      : icon.metadata.url;
    
    // Check cache
    const isCached = iconCache.get(iconUrl);
    if (isCached === false) {
      // Known failed icon, skip to fallback
      return fallbackIcon || <HelpCircle size={size} className={className} />;
    }
    
    return (
      <>
        {/* Show fallback while loading */}
        {isLoading && (
          <div style={{ width: size, height: size }} className={className}>
            {fallbackIcon || <HelpCircle size={size} className={className} />}
          </div>
        )}
        <img
          src={iconUrl}
          alt={icon.metadata.iconName || 'Icon'}
          className={className}
          style={{ 
            width: size, 
            height: size, 
            flexShrink: 0,
            display: isLoading ? 'none' : 'inline-block',
            objectFit: 'contain'
          }}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setIsLoading(false);
            iconCache.set(iconUrl, true);
          }}
          onError={(e) => {
            setImageError(true);
            setIsLoading(false);
            logIconError(`Failed to load icon from URL: ${iconUrl}`);
            iconCache.set(iconUrl, false);
          }}
        />
      </>
    );
  }

  // Final fallback to help circle
  logIconError('No valid icon data found, using fallback');
  return fallbackIcon || <HelpCircle size={size} className={className} />;
};

// Helper function to check if icon data is valid
export const hasValidIcon = (iconData: any): iconData is IconManager => {
  return iconData && 
    iconData.metadata && 
    (iconData.metadata.inlineSvg || iconData.metadata.url);
};

// Helper to preload multiple icons
export const preloadIcons = (icons: Array<IconManager | undefined>) => {
  icons.forEach(icon => {
    if (icon?.metadata?.url && !icon.metadata.inlineSvg) {
      const url = icon.metadata.url.includes('api.iconify.design') 
        ? `${icon.metadata.url}&color=white`
        : icon.metadata.url;
      preloadIcon(url);
    }
  });
};