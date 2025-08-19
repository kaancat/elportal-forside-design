import React, { useEffect } from 'react';
import { Icon, hasValidIcon, preloadIcons } from './Icon';
import { FeatureListBlock } from '@/types/sanity';

interface FeatureListComponentProps {
  block: FeatureListBlock;
}

export const FeatureListComponent: React.FC<FeatureListComponentProps> = ({ block }) => {
  if (!block || !block.features) return null;

  // Preload all feature icons on component mount
  useEffect(() => {
    const icons = block.features.map(f => 
      typeof f.icon === 'string' ? undefined : f.icon
    ).filter(Boolean);
    preloadIcons(icons as any);
  }, [block.features]);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className="text-3xl font-display font-bold text-center text-brand-dark mb-16">
            {block.title}
          </h2>
        )}
        <div className={`grid grid-cols-1 gap-8 md:gap-12 justify-items-center ${
          block.features.length === 2 ? 'md:grid-cols-2' : 
          block.features.length === 3 ? 'md:grid-cols-3' : 
          block.features.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 
          'md:grid-cols-3'
        }`}>
          {block.features.map((feature, index) => {
            // Debug logging
            if (process.env.NODE_ENV === 'development' && feature.icon) {
              console.log('[FeatureList] Item icon data:', {
                title: feature.title,
                icon: feature.icon,
                hasMetadata: typeof feature.icon === 'object' && !!(feature.icon as any)?.metadata,
                url: typeof feature.icon === 'object' && (feature.icon as any)?.metadata?.url
              });
            }
            
            return (
              <div key={feature._key} className="flex flex-col items-center text-center max-w-sm">
                <div className="flex items-center justify-center h-20 w-20 mb-6 rounded-full bg-brand-primary-light/10">
                  {typeof feature.icon !== 'string' && hasValidIcon(feature.icon as any) ? (
                    <Icon
                      icon={feature.icon as any}
                      size={48}
                      className="feature-list-icon"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">?</span>
                    </div>
                  )}
                </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}; 