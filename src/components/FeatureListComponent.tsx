import React from 'react';
import type { FeatureListBlock } from '@/types/sanity'; // Assuming this type will be created
import * as Icons from 'lucide-react';

// A helper to safely get an icon component by name
const getIcon = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent ? <IconComponent className="h-8 w-8 text-brand-green" /> : null;
};

interface FeatureListComponentProps {
  block: FeatureListBlock;
}

export const FeatureListComponent: React.FC<FeatureListComponentProps> = ({ block }) => {
  if (!block || !block.features) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className="text-3xl font-display font-bold text-center text-brand-dark mb-16">
            {block.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 justify-items-center">
          {block.features.map((feature, index) => (
            <div key={feature._key} className="flex flex-col items-center text-center max-w-sm">
              <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-brand-primary-light/10">
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">
                {`${index + 1}. ${feature.title}`}
              </h3>
              {/* Constrain the paragraph width for a compact look */}
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