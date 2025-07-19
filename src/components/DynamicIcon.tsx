import React from 'react';
import { HelpCircle } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface DynamicIconProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

// Simple component to handle image loading errors
const IconWithFallback: React.FC<{
  url: string;
  alt: string;
  size: number;
  className: string;
  fallback: React.ReactNode;
}> = ({ url, alt, size, className, fallback }) => {
  const [hasError, setHasError] = React.useState(false);
  const DEBUG_MODE = true;

  if (hasError) {
    if (DEBUG_MODE) {
      return (
        <div 
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            backgroundColor: 'purple', 
            color: 'white', 
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={`Failed to load: ${url}`}
        >
          ERROR
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        objectFit: 'contain',
        ...(DEBUG_MODE ? { border: '2px solid blue' } : {})
      }}
      onError={() => setHasError(true)}
      title={DEBUG_MODE ? `URL: ${url}` : undefined}
    />
  );
};

/**
 * Simplified, bulletproof icon component for Sanity icon-manager
 * No complex state management, just render what we have
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  icon,
  size = 24, 
  className = "",
  fallbackIcon
}) => {
  // Debug mode - set to true to see visual indicators
  const DEBUG_MODE = true;
  
  // Debug log to verify component is being called
  if (DEBUG_MODE) {
    console.log('[DynamicIcon] Rendering with:', { 
      hasIcon: !!icon,
      hasMetadata: !!icon?.metadata,
      url: icon?.metadata?.url,
      inlineSvg: !!icon?.metadata?.inlineSvg 
    });
  }

  // If no icon data, show fallback immediately
  if (!icon?.metadata) {
    if (DEBUG_MODE) {
      return (
        <div 
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            backgroundColor: 'red', 
            color: 'white', 
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="No icon metadata"
        >
          NO DATA
        </div>
      );
    }
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  const { inlineSvg, url, iconName } = icon.metadata;

  // Priority 1: Inline SVG (most reliable, no network request)
  if (inlineSvg) {
    return (
      <div
        className={className}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(DEBUG_MODE ? { border: '2px solid green' } : {})
        }}
        dangerouslySetInnerHTML={{ __html: inlineSvg }}
        title={DEBUG_MODE ? 'Inline SVG' : undefined}
      />
    );
  }

  // Priority 2: URL-based icon (simple img tag with React state for errors)
  if (url) {
    const iconUrl = url.includes('api.iconify.design') 
      ? `${url}&color=white`
      : url;

    return <IconWithFallback 
      url={iconUrl}
      alt={iconName || 'Icon'}
      size={size}
      className={className}
      fallback={fallbackIcon || <HelpCircle size={size} className={className} />}
    />;
  }

  // No valid icon data
  if (DEBUG_MODE) {
    return (
      <div 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          backgroundColor: 'orange', 
          color: 'white', 
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="No URL or SVG"
      >
        NO URL
      </div>
    );
  }
  return fallbackIcon || <HelpCircle size={size} className={className} />;
};

// Simple validation - just check if we have the required data
export const hasValidIcon = (iconData: any): iconData is IconManager => {
  return !!iconData?.metadata && !!(iconData.metadata.inlineSvg || iconData.metadata.url);
};

// Simplified preload - let browser handle caching
export const preloadIcons = (icons: Array<IconManager | undefined>) => {
  icons.forEach(icon => {
    if (icon?.metadata?.url) {
      const img = new Image();
      img.src = icon.metadata.url.includes('api.iconify.design') 
        ? `${icon.metadata.url}&color=white`
        : icon.metadata.url;
    }
  });
};

// Export for backwards compatibility
export const preloadIcon = (url: string) => {
  const img = new Image();
  img.src = url;
};