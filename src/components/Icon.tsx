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

  // Production-safe debug logging
  if (typeof window !== 'undefined' && icon) {
    window.console.log('[Icon] Render attempt:', {
      hasIcon: !!icon,
      hasSvg: !!icon.svg,
      svgContainsPlaceholder: icon.svg?.includes('Placeholder SVG'),
      hasMetadata: !!icon.metadata,
      metadataUrl: icon.metadata?.url,
      iconString: icon.icon?.substring(0, 30),
      className: className,
      size: size
    });
  }

  // Early return for no icon data
  if (!icon) {
    if (typeof window !== 'undefined') {
      window.console.log('[Icon] No icon data, showing fallback');
    }
    return fallbackIcon || <HelpCircle size={size} className={className} />;
  }

  // Priority 1: Non-placeholder SVG (highest quality)
  // BUT: Skip direct SVG if we have metadata URL as backup (VP2 case)
  if (icon.svg && !icon.svg.includes('Placeholder SVG') && !icon.metadata?.url) {
    if (typeof window !== 'undefined') {
      window.console.log('[Icon] Rendering direct SVG (no metadata URL backup)');
    }
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
    if (typeof window !== 'undefined') {
      window.console.log('[Icon] Rendering metadata URL:', icon.metadata.url);
    }
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
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.console.log('[Icon] ✅ Successfully loaded:', icon.metadata.url);
          }
        }}
        onError={(e) => {
          if (typeof window !== 'undefined') {
            window.console.error('[Icon] ❌ Failed to load metadata URL:', icon.metadata.url);
          }
          // Show fallback instead of hiding
          const fallbackElement = fallbackIcon || <HelpCircle size={size} className={className} />;
          e.currentTarget.style.display = 'none';
          // Try to insert fallback
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.innerHTML = '?';
            fallbackDiv.style.cssText = `
              width: ${size}px; 
              height: ${size}px; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              background: #f3f4f6; 
              border-radius: 4px; 
              color: #6b7280;
              font-weight: bold;
            `;
            parent.appendChild(fallbackDiv);
          }
        }}
      />
    );
  }

  // Priority 3: Inline SVG from metadata
  if (icon.metadata?.inlineSvg) {
    if (typeof window !== 'undefined') {
      window.console.log('[Icon] Rendering inline SVG from metadata');
    }
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
    
    if (typeof window !== 'undefined') {
      window.console.log('[Icon] Generating URL from icon string:', generatedUrl);
    }
    
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
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.console.log('[Icon] ✅ Generated URL loaded:', generatedUrl);
          }
        }}
        onError={(e) => {
          if (typeof window !== 'undefined') {
            window.console.error('[Icon] ❌ Generated URL failed:', generatedUrl);
          }
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Final fallback
  if (typeof window !== 'undefined') {
    window.console.log('[Icon] No valid icon data found, showing final fallback');
  }
  return fallbackIcon || <HelpCircle size={size} className={className} />;
};

// Helper functions
export const hasValidIcon = (iconData: any): iconData is IconManager => {
  // Check if we have direct SVG, icon string (for legacy) or proper metadata
  const isValid = !!iconData && (!!iconData.svg || !!iconData.icon || (!!iconData.metadata && !!(iconData.metadata.inlineSvg || iconData.metadata.url)));
  
  // Production-safe debug logging
  if (typeof window !== 'undefined' && iconData) {
    window.console.log('[hasValidIcon]', {
      hasIconData: !!iconData,
      hasSvg: !!iconData.svg,
      hasIconString: !!iconData.icon,
      hasMetadata: !!iconData.metadata,
      hasMetadataUrl: !!(iconData.metadata?.url),
      hasInlineSvg: !!(iconData.metadata?.inlineSvg),
      result: isValid,
      iconPreview: iconData.icon?.substring(0, 30)
    });
  }
  
  return isValid;
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