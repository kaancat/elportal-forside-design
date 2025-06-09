import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Standard-width, centered container
export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
};

// Wide-width container
export const WideContainer: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl', className)}>
      {children}
    </div>
  );
};

// Full-bleed, edge-to-edge container
export const FullBleedContainer: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}; 