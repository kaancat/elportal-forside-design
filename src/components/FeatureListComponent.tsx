import React, { useEffect } from 'react';
import { Icon, hasValidIcon, preloadIcons } from './Icon';
import { IconManager } from '@/types/sanity';

interface Feature {
  _key: string;
  title: string;
  description: string;
  icon?: IconManager;
}

interface FeatureListBlock {
  title?: string;
  features: Feature[];
}

interface FeatureListComponentProps {
  block: FeatureListBlock;
}

export const FeatureListComponent: React.FC<FeatureListComponentProps> = ({ block }) => {
  if (!block || !block.features) return null;

  // Preload all feature icons on component mount
  useEffect(() => {
    const icons = block.features.map(f => f.icon).filter(Boolean);
    preloadIcons(icons);
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
                hasMetadata: !!feature.icon?.metadata,
                url: feature.icon?.metadata?.url
              });
            }
            
            return (
              <div key={feature._key} className="flex flex-col items-center text-center max-w-sm">
                <div className="flex items-center justify-center h-20 w-20 mb-6 rounded-full bg-brand-primary-light/10">
                  {(() => {
                    const isValid = hasValidIcon(feature.icon);
                    return isValid && (
                      <Icon
                        icon={feature.icon}
                        size={48}
                        className="feature-list-icon"
                      />
                    );
                  })()}
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