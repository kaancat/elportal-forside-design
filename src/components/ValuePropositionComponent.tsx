import React from 'react';
import type { ValuePropositionBlock } from '@/types/sanity'; // Assuming this type will be created
import { Check, Info } from 'lucide-react';

interface ValuePropositionComponentProps {
  block: ValuePropositionBlock;
}

export const ValuePropositionComponent: React.FC<ValuePropositionComponentProps> = ({ block }) => {
  if (!block || !block.propositions) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto p-8 bg-gray-50/70 rounded-2xl border border-gray-200">
          {block.title && (
            <div className="flex items-center mb-6">
              <Info className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-brand-dark">{block.title}</h2>
            </div>
          )}
          <ul className="space-y-4">
            {block.propositions.map((proposition, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{proposition}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}; 