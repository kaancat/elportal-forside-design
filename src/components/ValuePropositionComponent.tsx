import React from 'react';
import type { ValuePropositionBlock } from '@/types/sanity'; // Assuming this type will be created
import { Check, Info } from 'lucide-react';

interface ValuePropositionComponentProps {
  block: ValuePropositionBlock;
}

export const ValuePropositionComponent: React.FC<ValuePropositionComponentProps> = ({ block }) => {
  if (!block || !block.propositions) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto p-6 bg-brand-green/10 rounded-2xl border border-brand-green/20">
          {block.title && (
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 text-brand-green mr-3" />
              <h2 className="text-xl font-bold text-brand-dark">{block.title}</h2>
            </div>
          )}
          <ul className="space-y-3">
            {block.propositions.map((proposition, index) => (
              <li key={index} className="flex items-start">
                                                    <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">{proposition}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}; 