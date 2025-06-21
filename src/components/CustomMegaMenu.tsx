import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MegaMenuContent from './MegaMenuContent';
import { MegaMenu as MegaMenuType } from '@/types/sanity';

interface CustomMegaMenuProps {
  item: MegaMenuType;
}

const CustomMegaMenu: React.FC<CustomMegaMenuProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-white hover:text-brand-green font-medium transition-colors duration-200 text-base flex items-center py-2">
        {item.title}
        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen z-50"
            style={{ maxWidth: '100vw' }}
          >
            <div className="bg-brand-dark shadow-2xl mt-2 border border-neutral-700">
              <MegaMenuContent menu={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomMegaMenu; 