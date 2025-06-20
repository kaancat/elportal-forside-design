import React from 'react';
import { MegaMenu, IconPicker } from '@/types/sanity';
import { NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Link as RouterLink } from 'react-router-dom';

// Step 1: Import icon libraries (maintaining verified working imports)
import * as FaIcons from 'react-icons/fa';
import * as HiIcons from 'react-icons/hi';
import * as FiIcons from 'react-icons/fi';
import * as MdIcons from 'react-icons/md';
import * as SiIcons from 'react-icons/si';

// Step 2: Create library mapping
const iconLibraries: { [key: string]: any } = {
  fa: FaIcons,
  hi: HiIcons,
  fi: FiIcons,
  md: MdIcons,
  mdi: MdIcons,  // Map Material Design Icons (mdi) to Material Design (md)
  si: SiIcons,
};

// Step 3: Create prefix mapping for each provider
const providerPrefixes: { [key: string]: string } = {
  fa: 'Fa',   // FontAwesome
  hi: 'Hi',   // HeroIcons
  fi: 'Fi',   // Feather Icons
  md: 'Md',   // Material Design
  mdi: 'Md',  // Material Design Icons (alternative naming)
  si: 'Si',   // Simple Icons
};

interface IconProps {
  iconData?: IconPicker;
  className?: string;
}

interface MegaMenuContentProps {
  menu: MegaMenu;
}

// Step 4: Enhanced Icon component with SMART PREFIX STRIPPING
const Icon: React.FC<IconProps> = ({ iconData, className }) => {
  if (!iconData?.provider || !iconData?.name) {
    return null;
  }
  
  // Check for unsupported providers
  const unsupportedProviders = ['f7', 'sa'];
  if (unsupportedProviders.includes(iconData.provider)) {
    console.warn(`Icon provider "${iconData.provider}" is not supported. Supported providers: fa, hi, fi, md, mdi, si`);
    return null;
  }
  
  // Look up the library from our static map
  const library = iconLibraries[iconData.provider];
  if (!library) {
    console.warn(`Icon library for provider "${iconData.provider}" not found.`);
    return null;
  }

  // Get the correct prefix for this provider
  const prefix = providerPrefixes[iconData.provider];
  if (!prefix) {
    console.warn(`No prefix found for provider "${iconData.provider}".`);
    return null;
  }

  // CRITICAL FIX: Smart prefix stripping for double-prefix issue
  let cleanIconName = iconData.name;
  
  // ENHANCED: Handle FontAwesome icons that already have "fa-" prefix
  if (iconData.provider === 'fa') {
    // Remove "fa-" prefix if present
    if (cleanIconName.startsWith('fa-')) {
      cleanIconName = cleanIconName.substring(3);
    }
    // Also handle double prefix issue: "fa-fa-tasks" -> "tasks"
    while (cleanIconName.startsWith('fa-')) {
      cleanIconName = cleanIconName.substring(3);
    }
  }
  
  // Handle other providers that might have their own prefixes
  if (iconData.provider === 'hi') {
    while (cleanIconName.startsWith('hi-')) {
      cleanIconName = cleanIconName.substring(3);
    }
  }
  
  if (iconData.provider === 'fi') {
    while (cleanIconName.startsWith('fi-')) {
      cleanIconName = cleanIconName.substring(3);
    }
  }
  
  if (iconData.provider === 'md' || iconData.provider === 'mdi') {
    while (cleanIconName.startsWith('md-') || cleanIconName.startsWith('mdi-')) {
      if (cleanIconName.startsWith('mdi-')) {
        cleanIconName = cleanIconName.substring(4);
      } else {
        cleanIconName = cleanIconName.substring(3);
      }
    }
  }
  
  if (iconData.provider === 'si') {
    while (cleanIconName.startsWith('si-')) {
      cleanIconName = cleanIconName.substring(3);
    }
  }

  // Convert to PascalCase: "tasks" -> "Tasks" or "balance-scale" -> "BalanceScale"
  const toPascalCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^(.)/, (match, chr) => chr.toUpperCase());
  };
  
  // Build the full component name: "Fa" + "Tasks" = "FaTasks"
  const iconName = prefix + toPascalCase(cleanIconName);

  console.log(`DEBUG: Icon transformation: "${iconData.name}" -> "${cleanIconName}" -> "${iconName}"`);

  const IconComponent = library[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in provider "${iconData.provider}". Raw name: "${iconData.name}", Clean name: "${cleanIconName}"`);
    return null;
  }

  return <IconComponent className={className} />;
};

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
