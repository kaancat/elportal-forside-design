import React from 'react';
import { MegaMenu } from '@/types/sanity';
import { NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Link as RouterLink } from 'react-router-dom';

interface MegaMenuContentProps {
  menu: MegaMenu;
}

const MegaMenuContent: React.FC<MegaMenuContentProps> = ({ menu }) => {
  // Helper function to resolve internal links
  const resolveLink = (link: any) => {
    if (link.linkType === 'external') return link.externalUrl || '#';
    if (!link.internalLink?.slug) return '/';
    
    // You might want to expand this based on the _type of internalLink
    return `/${link.internalLink.slug}`;
  };

  return (
    <NavigationMenuContent className="!bg-brand-dark !border-brand-green/30">
      {/* Grid layout for the columns - removed extra container to fix layout issues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 p-8 w-[800px] max-w-[90vw]">
        {menu.content.map((column) => (
          <div key={column._key} className="flex flex-col">
            {column.title && (
              <h3 className="text-lg font-bold text-white mb-4 tracking-wide border-b border-brand-green/30 pb-2">
                {column.title}
              </h3>
            )}
            <ul className="space-y-3">
              {column.items.map((item) => (
                <li key={item._key}>
                  <RouterLink
                    to={resolveLink(item.link)}
                    className="block p-3 rounded-md hover:bg-brand-green/20 transition-all duration-200 group"
                  >
                    <p className="font-semibold text-white group-hover:text-brand-green transition-colors">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-300 mt-1 font-light leading-snug">
                        {item.description}
                      </p>
                    )}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </NavigationMenuContent>
  );
};

export default MegaMenuContent; 