/**
 * Safe icon exports that handle the Sanity icon-manager plugin data structure
 */

// Import the base components
import { Icon as BaseIcon } from '../Icon';
import { DynamicIcon as BaseDynamicIcon } from '../DynamicIcon';
import { IconManager } from '@/types/sanity';
import React from 'react';

// Create a type-safe wrapper that handles the color object
const createSafeIconComponent = <P extends { icon?: IconManager }>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    // If there's an icon with metadata, ensure it's properly structured
    if (props.icon?.metadata) {
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[SafeIcon Wrapper] Processing icon:', {
          iconName: props.icon.metadata.iconName,
          hasColor: !!props.icon.metadata.color,
          colorType: typeof props.icon.metadata.color,
          url: props.icon.metadata.url
        });
      }
      
      // The icon-manager plugin already includes color in the URL,
      // so we don't need to manipulate it
    }
    
    return <Component {...props} ref={ref} />;
  });
};

// Export safe versions
export const Icon = createSafeIconComponent(BaseIcon);
export const DynamicIcon = createSafeIconComponent(BaseDynamicIcon);

// Re-export utilities
export { hasValidIcon, preloadIcons, preloadIcon } from '../DynamicIcon';
export { getIconColor } from '../SafeIcon';