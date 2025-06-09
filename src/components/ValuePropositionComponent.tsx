import React from 'react';
import type { ValuePropositionBlock } from '@/types/sanity'; // Assuming this type will be created
import { Check, Info } from 'lucide-react';

interface ValuePropositionComponentProps {
  block: ValuePropositionBlock;
}

export const ValuePropositionComponent: React.FC<ValuePropositionComponentProps> = ({ block }) => {
  if (!block || !block.propositions) return null;

  return (
    <section className="py-8 lg:py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto p-4 bg-brand-green/10 rounded-xl border border-brand-green/20">
          {block.title && (
            <div className="flex items-center mb-3">
              <Info className="h-4 w-4 text-brand-green mr-2" />
              <h2 className="text-lg font-bold text-brand-dark">{block.title}</h2>
            </div>
          )}
          <ul className="space-y-2">
            {block.propositions.map((proposition, index) => (
              <li key={index} className="flex items-start">
                                                    <Check className="h-4 w-4 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{proposition}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}; 