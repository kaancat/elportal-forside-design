'use client'

import React, { useEffect } from 'react';
import { Icon, hasValidIcon, preloadIcons } from './Icon';
import { FeatureListBlock } from '@/types/sanity';
import { ArrowRight } from 'lucide-react';

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
          <h3 className="text-3xl lg:text-4xl font-display font-bold text-center text-brand-dark mb-4">
            {block.title}
          </h3>
        )}
        
        {/* Grid layout with modern card design */}
        <div className="max-w-6xl mx-auto">
          <div className={`grid grid-cols-1 gap-6 ${
            block.features.length === 2 ? 'md:grid-cols-2' :
            block.features.length === 3 ? 'md:grid-cols-3' :
            block.features.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
            block.features.length === 5 ? 'md:grid-cols-2 lg:grid-cols-3' :
            'md:grid-cols-3'
          }`}>
            {block.features.map((feature, index) => {
              return (
                <div 
                  key={feature._key} 
                  className="group relative bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Numbered badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center text-lg font-bold shadow-md group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-brand-green/10 group-hover:bg-brand-green/20 transition-colors">
                    {typeof feature.icon !== 'string' && hasValidIcon(feature.icon as any) ? (
                      <Icon
                        icon={feature.icon as any}
                        size={32}
                        className="text-brand-green"
                        color="#84db41"
                      />
                    ) : (
                      <span className="text-brand-green font-bold text-2xl">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <h4 className="text-lg font-display font-bold text-brand-dark mb-2 group-hover:text-brand-green transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-green/0 via-brand-green to-brand-green/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};