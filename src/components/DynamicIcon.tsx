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

  // Fallback to help circle if no SVG
  return <HelpCircle size={size} className={className} />;
};

// Helper function to check if icon data is valid
export const hasValidIcon = (iconData: any): boolean => {
  return iconData && (iconData.metadata?.inlineSvg || iconData.icon);
};