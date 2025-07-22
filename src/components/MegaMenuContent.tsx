import React from 'react';
import { MegaMenu } from '@/types/sanity';
import { Link as RouterLink } from 'react-router-dom';
import { Icon, hasValidIcon } from './Icon';

interface MegaMenuContentProps {
  menu: MegaMenu;
}

const MegaMenuContent: React.FC<MegaMenuContentProps> = ({ menu }) => {
  const resolveLink = (link: any) => {
    if (link.linkType === 'external') return link.externalUrl || '#';
    if (link.internalLink?.slug) return `/${link.internalLink.slug}`;
    return '/';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        {menu.content.map((column) => (
          <div key={column._key}>
            <h3 className="text-sm font-semibold text-neutral-400 mb-4 tracking-wider uppercase">{column.title}</h3>
            <ul className="space-y-2">
              {column.items.map((item) => (
                <li key={item._key}>
                  <RouterLink to={resolveLink(item.link)} className="flex items-start p-2 rounded-lg hover:bg-brand-green/10">
                    {hasValidIcon(item.icon) && (
                      <Icon
                        icon={item.icon}
                        size={24}
                        className="mr-4 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-neutral-400 mt-1">{item.description}</p>
                    </div>
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MegaMenuContent;
