import React, { useState, useEffect, useRef } from 'react';
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
  const imgRef = useRef<HTMLImageElement>(null);

  // Debug log - expand the object to see actual values
  if (icon) {
    console.log('[DynamicIcon] Rendered with icon:', JSON.stringify(icon, null, 2));
  } else {
    console.log('[DynamicIcon] Rendered with no icon');
  }

  // Get the icon URL if available
  const iconUrl = icon?.metadata?.url && !imageError
    ? (icon.metadata.url.includes('api.iconify.design') 
        ? `${icon.metadata.url}&color=white`
        : icon.metadata.url)
    : null;

  // Reset states when icon changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [icon?.metadata?.url, icon?.metadata?.iconName]);

  // Handle image loading with race condition fix
  useEffect(() => {
    if (!imgRef.current || !iconUrl) {
      console.log('[DynamicIcon] useEffect skipped:', { hasRef: !!imgRef.current, iconUrl });
      return;
    }

    const img = imgRef.current;
    console.log('[DynamicIcon] Checking image:', { 
      complete: img.complete, 
      naturalWidth: img.naturalWidth,
      src: img.src 
    });

    // CRITICAL FIX: Check if image is already loaded from cache
    if (img.complete && img.naturalWidth > 0) {
      console.log('[DynamicIcon] Image already loaded from cache');
      setIsLoading(false);
      iconCache.set(iconUrl, true);
      return;
    }

    const handleLoad = () => {
      setIsLoading(false);
      iconCache.set(iconUrl, true);
    };

    const handleError = () => {
      setImageError(true);
      setIsLoading(false);
      logIconError(`Failed to load icon from URL: ${iconUrl}`);
      iconCache.set(iconUrl, false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [iconUrl]);

  // Log icon loading issues for debugging
  const logIconError = (error: string) => {
    console.warn(`[DynamicIcon] ${error}`, {
      iconName: icon?.metadata?.iconName,
      url: icon?.metadata?.url,
      hasInlineSvg: !!icon?.metadata?.inlineSvg
    });
  };

  // If no icon data, show fallback
  if (!icon || !icon.metadata) {
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

  // Priority 2: Use URL-based icon if available
  if (iconUrl) {
    // Check cache for known failed icons
    const isCached = iconCache.get(iconUrl);
    if (isCached === false) {
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
          ref={imgRef}
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
          loading="eager" // Changed from lazy to ensure immediate loading
          decoding="async"
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