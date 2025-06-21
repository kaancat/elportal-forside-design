import React from 'react';
import { Check, Info } from 'lucide-react';

interface ValuePropositionComponentProps {
  block: any;
}

export const ValuePropositionComponent: React.FC<ValuePropositionComponentProps> = ({ block }) => {
  if (!block || !block.items) return null;

    return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto p-8 bg-green-50/60 rounded-2xl border border-green-200/60">
          {block.title && (
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-green-100 border border-green-200 mr-3">
                <Info className="h-5 w-5 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-dark">{block.title}</h2>
            </div>
          )}
          <ul className="space-y-3 pl-1">
            {block.items.map((item: any, index: number) => (
              <li key={item._key || index} className="flex items-center">
                {item.icon?.metadata?.url ? (
                  <img 
                    src={item.icon.metadata.url}
                    alt=""
                    className="h-6 w-6 mr-3 flex-shrink-0"
                  />
                ) : (
                  <Check className="h-6 w-6 text-brand-primary mr-3 flex-shrink-0" />
                )}
                <span className="text-lg text-gray-800">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}; 