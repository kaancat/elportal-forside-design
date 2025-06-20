import React from 'react';
import { MegaMenu, IconPicker } from '@/types/sanity';
import { NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Link as RouterLink } from 'react-router-dom';

// Step 1: Explicitly import every icon set we might need
import * as FaIcons from 'react-icons/fa';
import * as HiIcons from 'react-icons/hi';
import * as FiIcons from 'react-icons/fi';
import * as MdIcons from 'react-icons/md';
import * as SiIcons from 'react-icons/si';

// Step 2: Create a static map from the provider code to the imported library
const iconLibraries: { [key: string]: any } = {
  fa: FaIcons,
  hi: HiIcons,
  fi: FiIcons,
  md: MdIcons,
  si: SiIcons, // Note: The provider 'sa' from your data likely maps to 'si' (Simple Icons)
};

interface IconProps {
  iconData?: IconPicker;
  className?: string;
}

interface MegaMenuContentProps {
  menu: MegaMenu;
}

// Step 3: Enhanced Icon component with robust PascalCase conversion
const Icon: React.FC<IconProps> = ({ iconData, className }) => {
  if (!iconData?.provider || !iconData?.name) {
    return null;
  }
  
  // Look up the library from our static map
  const library = iconLibraries[iconData.provider];
  if (!library) {
    console.warn(`Icon library for provider "${iconData.provider}" not found.`);
    return null;
  }

  // Step 3: Much more robust PascalCase conversion function
  const toPascalCase = (str: string) => {
    return (' ' + str).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => {
      return chr.toUpperCase();
    });
  };
  
  const iconName = toPascalCase(iconData.name);

  const IconComponent = library[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in provider "${iconData.provider}". Raw name: "${iconData.name}"`);
    return null;
  }

  return <IconComponent className={className} />;
};

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 md:w-auto lg:min-w-[700px] xl:min-w-[800px]">
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
                      className="flex items-start text-left p-3 rounded-lg hover:bg-brand-green/20 transition-colors duration-200"
                    >
                      <Icon iconData={item.icon} className="h-5 w-5 mt-0.5 mr-4 text-brand-green flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white leading-tight">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-neutral-400 mt-1 font-normal leading-snug">
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