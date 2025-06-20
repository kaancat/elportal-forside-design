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
      <div className="bg-brand-dark p-6 md:p-8 border border-neutral-700 rounded-lg shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 min-w-[600px] max-w-[90vw] lg:min-w-[800px] lg:max-w-[1000px]">
          {menu.content.map((column) => (
            <div key={column._key} className="flex flex-col">
              {column.title && (
                <h3 className="text-sm font-semibold text-neutral-400 mb-3 px-3 tracking-wider uppercase">
                  {column.title}
                </h3>
              )}
              <ul className="space-y-1">
                {column.items.map((item) => (
                  <li key={item._key}>
                    <RouterLink
                      to={resolveLink(item.link)}
                      className="flex items-start text-left p-3 md:p-4 rounded-lg hover:bg-brand-green/20 transition-colors duration-200"
                    >
                      {item.icon?.metadata?.url && (
                        <img 
                          src={item.icon.metadata.url} 
                          alt="" 
                          className="h-5 w-5 md:h-6 md:w-6 mr-3 md:mr-4 flex-shrink-0"
                          style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(1067%) hue-rotate(85deg) brightness(98%) contrast(92%)' }}
                        />
                      )}
                      <div>
                        <p className="font-semibold text-white leading-tight text-sm md:text-base">{item.title}</p>
                        {item.description && (
                          <p className="text-xs md:text-sm text-neutral-400 mt-1 font-normal leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>
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
