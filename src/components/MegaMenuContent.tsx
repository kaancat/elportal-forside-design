import React from 'react';
import { MegaMenu } from '@/types/sanity';
import { NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Link } from 'react-router-dom';

interface MegaMenuContentProps {
  menu: MegaMenu;
}

const MegaMenuContent: React.FC<MegaMenuContentProps> = ({ menu }) => {
  // Helper function to resolve internal links
  const resolveLink = (link: any) => {
    if (link.linkType === 'external') return link.externalUrl;
    if (!link.internalLink?.slug) return '/';
    
    // You might want to expand this based on the _type of internalLink
    return `/${link.internalLink.slug}`;
  };

  return (
    <NavigationMenuContent className="bg-brand-dark border-gray-700">
      <div className="grid grid-cols-3 gap-8 p-6 md:w-[600px] lg:w-[800px]">
        {menu.content.map((column) => (
          <div key={column._key} className="flex flex-col space-y-4">
            {column.title && (
              <h3 className="font-bold text-white text-lg">{column.title}</h3>
            )}
            <ul className="space-y-2">
              {column.items.map((item) => (
                <li key={item._key}>
                  <Link
                    to={resolveLink(item.link)}
                    className="block p-3 rounded-md hover:bg-brand-green/20 transition-colors"
                  >
                    <p className="font-semibold text-white">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-300">{item.description}</p>
                    )}
                  </Link>
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