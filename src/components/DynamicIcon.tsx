import React from 'react';
import { HelpCircle } from 'lucide-react';

interface DynamicIconProps {
  icon?: {
    icon?: string;
    metadata?: {
      inlineSvg?: string;
      iconName?: string;
    };
  };
  size?: number;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  icon,
  size = 24, 
  className = "" 
}) => {
  // If no icon data, show fallback
  if (!icon) {
    return <HelpCircle size={size} className={className} />;
  }

  // If icon has inline SVG data (from IconManager plugin)
  if (icon.metadata?.inlineSvg) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: icon.metadata.inlineSvg }}
      />
    );
  }

  // Fallback to URL-based icon if available
  if (icon.metadata?.url) {
    // Add color parameter to Iconify URLs to make them white
    const iconUrl = icon.metadata.url.includes('api.iconify.design') 
      ? `${icon.metadata.url}&color=white`
      : icon.metadata.url;
    
    return (
      <img
        src={iconUrl}
        alt={icon.metadata?.iconName || 'Icon'}
        className={className}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  // Final fallback to help circle
  return <HelpCircle size={size} className={className} />;
};

// Helper function to check if icon data is valid
export const hasValidIcon = (iconData: any): boolean => {
  return iconData && (iconData.metadata?.inlineSvg || iconData.metadata?.url || iconData.icon);
};