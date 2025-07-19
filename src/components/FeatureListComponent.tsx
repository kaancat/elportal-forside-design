import React, { useEffect } from 'react';
import { DynamicIcon, hasValidIcon, preloadIcons } from './DynamicIcon';
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
  console.log('[FeatureListComponent] Rendered with block:', block);
  
  if (!block || !block.features) return null;

  // Preload all feature icons on component mount
  useEffect(() => {
    const icons = block.features.map(f => f.icon).filter(Boolean);
    console.log('[FeatureListComponent] Icons to preload:', icons);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 justify-items-center">
          {/* TEMPORARY TEST: Force render first icon without validation */}
          {block.features.length > 0 && (
            <div className="border-4 border-red-500 p-4">
              <h3>TEST ICON (bypassing validation):</h3>
              <DynamicIcon
                icon={block.features[0].icon}
                size={48}
                color="white"
              />
            </div>
          )}
          
          {block.features.map((feature, index) => (
            <div key={feature._key} className="flex flex-col items-center text-center max-w-sm">
              <div className="flex items-center justify-center h-20 w-20 mb-6 rounded-full bg-brand-primary-light/10">
                {(() => {
                  const isValid = hasValidIcon(feature.icon);
                  console.log('[FeatureListComponent] Icon check for feature:', { 
                    feature: feature.title, 
                    icon: feature.icon, 
                    isValid 
                  });
                  return isValid && (
                    <DynamicIcon
                      icon={feature.icon}
                      size={48}
                      color="white"
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
          ))}
        </div>
      </div>
    </section>
  );
}; 