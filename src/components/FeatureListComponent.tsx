import React from 'react';
import type { FeatureListBlock } from '@/types/sanity'; // Assuming this type will be created
import * as Icons from 'lucide-react';

// A helper to safely get an icon component by name
const getIcon = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent ? <IconComponent className="h-5 w-5 text-brand-green" /> : null;
};

interface FeatureListComponentProps {
  block: FeatureListBlock;
}

export const FeatureListComponent: React.FC<FeatureListComponentProps> = ({ block }) => {
  if (!block || !block.features) return null;

  return (
    <section className="py-8 lg:py-12 bg-white">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className="text-xl font-bold text-center text-brand-dark mb-6">
            {block.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
          {block.features.map((feature, index) => (
            <div key={feature._key} className="flex flex-col items-center">
              <div className="flex items-center justify-center h-10 w-10 mb-3 rounded-full bg-brand-green/20">
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-base font-bold text-brand-dark mb-1">
                {`${index + 1}. ${feature.title}`}
              </h3>
              <p className="text-xs text-gray-600 leading-tight">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 