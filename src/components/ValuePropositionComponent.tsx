import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { Icon, hasValidIcon } from './Icon';
import { IconManager } from '@/types/sanity';
import { useScrollAnimation, staggerContainer } from '@/hooks/useScrollAnimation';

interface ValuePropositionItem {
  _key: string;
  text?: string; // Legacy support
  heading?: string;
  description?: string;
  icon?: IconManager;
}

interface ValuePropositionBlock {
  // Current fields
  heading?: string;
  subheading?: string;
  content?: any[];
  valueItems?: ValuePropositionItem[];
  // Deprecated fields (for backward compatibility)
  title?: string;
  items?: ValuePropositionItem[];
  propositions?: string[]; // Legacy support
}

interface ValuePropositionComponentProps {
  block: ValuePropositionBlock;
}

export const ValuePropositionComponent: React.FC<ValuePropositionComponentProps> = ({ block }) => {
  try {
    if (!block) {
      return null;
    }
    
    // Handle data from both new and legacy structures
    // Priority: valueItems (new) > items (deprecated) > propositions (legacy)
    const items = block.valueItems || block.items || (block.propositions ? 
      block.propositions.map((text: string, index: number) => ({ 
        _key: `legacy-${index}`, 
        text, 
        icon: null 
      })) : 
      []
    );
    
    if (!items || items.length === 0) {
      return null;
    }

    return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto p-8 bg-green-50/60 rounded-2xl border border-green-200/60"
          {...useScrollAnimation({ duration: 0.6, type: 'fadeUp' })}
        >
          {(block.heading || block.title) && (
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-green-100 border border-green-200 mr-3">
                <Info className="h-5 w-5 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-dark">{block.heading || block.title}</h2>
            </div>
          )}
          {block.subheading && (
            <p className="text-lg text-gray-600 mb-6">{block.subheading}</p>
          )}
          <motion.ul 
            className="space-y-4 pl-1"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {items.map((item, index) => {
              // Get the display text from either new or legacy format
              const displayText = item.heading || item.text || '';
              const hasDescription = item.description && item.description.length > 0;
              
              return (
                <motion.li 
                  key={item._key || index} 
                  className="flex items-start"
                  {...useScrollAnimation({ 
                    type: 'stagger', 
                    index,
                    duration: 0.5,
                    staggerDelay: 0.08 
                  })}
                >
                  {hasValidIcon(item.icon) ? (
                    <Icon
                      icon={item.icon}
                      size={24}
                      className="mr-3 flex-shrink-0 mt-0.5 value-proposition-icon"
                    />
                  ) : (
                    <Check className="h-6 w-6 text-brand-primary mr-3 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-800 block">{displayText}</span>
                    {hasDescription && (
                      <span className="text-base text-gray-600 mt-1 block">{item.description}</span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
  } catch (error) {
    return null;
  }
}; 