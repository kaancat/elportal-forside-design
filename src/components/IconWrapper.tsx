import React from 'react';
import { Icon } from './Icon';
import { IconManager } from '@/types/sanity';

interface IconWrapperProps {
  icon?: IconManager;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  color?: string;
}

/**
 * Wrapper component that ensures icon data is properly typed
 * and handles the color object structure from Sanity
 */
export const IconWrapper: React.FC<IconWrapperProps> = (props) => {
  // Ensure icon metadata is properly structured
  if (props.icon?.metadata?.color && typeof props.icon.metadata.color === 'object') {
    // Create a safe copy with the color normalized
    const safeIcon: IconManager = {
      ...props.icon,
      metadata: {
        ...props.icon.metadata,
        // Don't modify the color - let the plugin handle it via the URL
      }
    };
    
    return <Icon {...props} icon={safeIcon} />;
  }
  
  // For all other cases, just pass through
  return <Icon {...props} />;
};