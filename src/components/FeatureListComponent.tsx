import React from 'react';

interface FeatureListComponentProps {
  block: any;
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
          {block.features.map((feature: any, index: number) => (
            <div key={feature._key} className="flex flex-col items-center text-center max-w-sm">
              <div className="flex items-center justify-center h-20 w-20 mb-6 rounded-full bg-brand-primary-light/10">
                {feature.icon?.metadata?.url && (
                  <img 
                    src={feature.icon.metadata.url}
                    alt=""
                    className="h-12 w-12"
                  />
                )}
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