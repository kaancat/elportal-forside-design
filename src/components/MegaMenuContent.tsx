import React from 'react';
import { MegaMenu } from '@/types/sanity';
import { Link as RouterLink } from 'react-router-dom';
import { Icon, hasValidIcon } from './Icon';
import { resolveLink } from '@/utils/linkResolver';

interface MegaMenuContentProps {
  menu: MegaMenu;
}

const MegaMenuContent: React.FC<MegaMenuContentProps> = ({ menu }) => {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        {menu.content.map((column) => (
          <div key={column._key}>
            <h3 className="text-sm font-semibold text-neutral-400 mb-4 tracking-wider uppercase">{column.title}</h3>
            <ul className="space-y-2">
              {column.items.map((item) => {
                // Debug logging
                if (process.env.NODE_ENV === 'development' && item.icon) {
                  console.log('[MegaMenu] Item icon data:', {
                    title: item.title,
                    icon: item.icon,
                    hasMetadata: !!item.icon?.metadata,
                    url: item.icon?.metadata?.url
                  });
                }
                
                return (
                  <li key={item._key}>
                    <RouterLink to={resolveLink(item.link, 'MegaMenu')} className="flex items-start p-2 rounded-lg hover:bg-brand-green/10">
                      {hasValidIcon(item.icon) && (
                        <Icon
                          icon={item.icon}
                          size={24}
                          className="mr-4 flex-shrink-0"
                          color="#84db41"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-neutral-400 mt-1">{item.description}</p>
                      </div>
                    </RouterLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MegaMenuContent;
