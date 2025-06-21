import React from 'react';
import { MegaMenu } from '@/types/sanity';
import { Link as RouterLink } from 'react-router-dom';

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
                    {item.icon?.metadata?.url && (
                      <img src={item.icon.metadata.url} alt="" className="h-6 w-6 mr-4 flex-shrink-0" style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(1067%) hue-rotate(85deg) brightness(98%) contrast(92%)' }}/>
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
