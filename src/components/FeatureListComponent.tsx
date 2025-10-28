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

  // Determine if this looks like a step-by-step guide based on title content
  const isStepByStep = block.title?.toLowerCase().includes('sådan') || 
                       block.title?.toLowerCase().includes('skift') ||
                       block.features.some(f => /^\d+\./.test(f.title));

  if (isStepByStep) {
    // Modern step-by-step design with flowing layout
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {block.title && (
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-center text-brand-dark mb-4">
              {block.title}
            </h3>
          )}
          {block.subtitle && (
            <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
              {block.subtitle}
            </p>
          )}

          <div className="max-w-5xl mx-auto">
            {block.features.map((feature, index) => {
              const isLast = index === block.features.length - 1;
              
              return (
                <div key={feature._key} className="relative">
                  {/* Card */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 mb-6">
                    {/* Step number badge */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-brand-green/80 flex items-center justify-center shadow-lg">
                        {typeof feature.icon !== 'string' && hasValidIcon(feature.icon as any) ? (
                          <Icon
                            icon={feature.icon as any}
                            size={32}
                            className="text-white"
                            color="#ffffff"
                          />
                        ) : (
                          <span className="text-white font-bold text-2xl">{index + 1}</span>
                        )}
                      </div>
                      {/* Step number overlay */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-sm font-bold shadow-md">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="text-xl md:text-2xl font-display font-bold text-brand-dark mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector arrow (not on last item) */}
                  {!isLast && (
                    <div className="flex justify-center my-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10">
                        <ArrowRight className="text-brand-green" size={24} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Optional CTA at bottom */}
          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg">
              Klar til at skifte? Start med vores gratis beregner
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Original design for non-step features
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {block.title && (
          <h3 className="text-2xl lg:text-3xl font-display font-bold text-center text-brand-dark mb-16">
            {block.title}
          </h3>
        )}
        <div className={`grid grid-cols-1 gap-8 md:gap-12 justify-items-center ${block.features.length === 2 ? 'md:grid-cols-2' :
            block.features.length === 3 ? 'md:grid-cols-3' :
              block.features.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                'md:grid-cols-3'
          }`}>
          {block.features.map((feature, index) => {
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
                <h4 className="text-xl font-display font-bold text-brand-dark mb-3">
                  {feature.title}
                </h4>
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