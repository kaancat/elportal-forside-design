'use client'

import React from 'react';
import Image from 'next/image';
import { HelpCircle, PiggyBank, Leaf, ShieldCheck, Zap, Info } from 'lucide-react';
import { IconManager } from '@/types/sanity';

interface IconProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  color?: string;
}

/**
 * Icon component that displays icons from sanity-plugin-icon-manager v1.5.2
 * 
 * CRITICAL: The plugin has strict validation requirements in Sanity Studio.
 * Icons MUST have the following structure:
 * 
 * {
 *   _type: 'icon.manager',
 *   icon: 'provider:icon-name',  // e.g., 'lucide:sun'
 *   metadata: {
 *     iconName: string,          // REQUIRED
 *     size: {                    // REQUIRED OBJECT (not direct width/height)
 *       width: number,
 *       height: number
 *     },
 *     hFlip: boolean,
 *     vFlip: boolean,
 *     rotate: 0 | 1 | 2 | 3,
 *     color?: {                  // Optional, but if present must have both:
 *       hex: string,
 *       rgba: { r, g, b, a }
 *     }
 *   }
 * }
 * 
 * Common errors:
 * - "Cannot read properties of undefined (reading 'width')": Missing size object
 * - Direct width/height properties instead of size object
 * - Manual color manipulation without rgba structure
 * 
 * @see /docs/ICON-USAGE-GUIDE.md for full documentation
 */
// Map common icon names to Lucide React components
const getLucideIcon = (iconName?: string) => {
  if (!iconName) return null;

  const iconMap: Record<string, any> = {
    'piggy-bank': PiggyBank,
    'piggybank': PiggyBank,
    'money': PiggyBank,
    'savings': PiggyBank,
    'leaf': Leaf,
    'eco': Leaf,
    'green': Leaf,
    'shield-check': ShieldCheck,
    'shield': ShieldCheck,
    'security': ShieldCheck,
    'protection': ShieldCheck,
    'zap': Zap,
    'lightning': Zap,
    'bolt': Zap,
    'energy': Zap,
    'info': Info,
    'information': Info,
  };

  const normalizedName = iconName.toLowerCase().trim();
  return iconMap[normalizedName];
};

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

  // Try to get Lucide icon from metadata
  const LucideIcon = getLucideIcon(icon.metadata?.iconName || icon.icon);
  if (LucideIcon) {
    return <LucideIcon size={size} className={className} style={{ color: color || 'currentColor' }} />;
  }

  // Development warning for malformed icons
  if (process.env.NODE_ENV === 'development') {
    if (icon.metadata) {
      // Check for common structural issues
      const meta = icon.metadata as any;
      if (!meta.size && (meta.width || meta.height)) {
        console.warn(
          '[Icon Component] Malformed icon structure detected:',
          icon.metadata.iconName || 'unknown',
          '- Has direct width/height instead of size object. This will break in Sanity Studio!'
        );
      }
      if (!icon.metadata.iconName) {
        console.warn(
          '[Icon Component] Missing required iconName in metadata for icon:',
          icon.icon || 'unknown'
        );
      }
    }
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
      <Image
        src={icon.metadata.url}
        alt={icon.metadata.iconName || 'Icon'}
        width={size || 24}
        height={size || 24}
        className={className}
        style={{
          objectFit: 'contain'
        }}
        onError={(e) => {
          // Show fallback icon instead of hiding
          const parent = e.currentTarget.parentElement;
          if (parent) {
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            fallback.className = className;
            parent.appendChild(fallback);
          }
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
      <Image
        src={generatedUrl}
        alt={icon.icon || 'Icon'}
        width={size || 24}
        height={size || 24}
        className={className}
        style={{
          objectFit: 'contain'
        }}
        onError={(e) => {
          // Show fallback icon instead of hiding
          const parent = e.currentTarget.parentElement;
          if (parent) {
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            fallback.className = className;
            parent.appendChild(fallback);
          }
        }}
      />
    );
  }

  // Final fallback
  return fallbackIcon || <HelpCircle size={size} className={className} style={{ color: color || 'currentColor' }} />;
};

// Helper functions
export const hasValidIcon = (iconData: any): iconData is IconManager => {
  // Check if we have direct SVG, icon string (for legacy) or proper metadata
  return !!iconData && (!!iconData.svg || !!iconData.icon || (!!iconData.metadata && !!(iconData.metadata.inlineSvg || iconData.metadata.url)));
};

export const preloadIcons = (icons: Array<IconManager | undefined>) => {
  // Only preload icons on the client side
  if (typeof window === 'undefined') return;

  icons.forEach(icon => {
    if (icon?.metadata?.url) {
      const img = new (window as any).Image();
      img.src = icon.metadata.url;
    } else if (icon?.icon) {
      // Preload legacy icon URLs
      const img = new (window as any).Image();
      img.src = `https://api.iconify.design/${icon.icon}.svg`;
    }
  });
};

export const preloadIcon = (url: string) => {
  // Only preload icons on the client side
  if (typeof window === 'undefined') return;

  const img = new (window as any).Image();
  img.src = url;
};