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
    <NavigationMenuContent>
      {/* Container with background, padding, border, and shadow */}
      <div className="bg-brand-dark p-8 border border-brand-green/50 rounded-lg shadow-2xl">
        {/* Grid layout for the columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8 md:w-auto lg:max-w-5xl">
          {menu.content.map((column) => (
            <div key={column._key} className="flex flex-col">
              {column.title && (
                <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
                  {column.title}
                </h3>
              )}
              <ul className="space-y-3">
                {column.items.map((item) => (
                  <li key={item._key}>
                    <RouterLink
                      to={resolveLink(item.link)}
                      className="block p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
                    >
                      <p className="font-semibold text-white">{item.title}</p>
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
      </div>
    </NavigationMenuContent>
  );
};

export default MegaMenuContent; 