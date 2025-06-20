import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as LinkType, MegaMenu } from '@/types/sanity';
import { IconManager } from '@/types/sanity';

interface MobileNavProps {
  navItems: (LinkType | MegaMenu)[];
  resolveLink: (link: LinkType) => string;
}

const MobileNavItem: React.FC<{item: LinkType | MegaMenu, resolveLink: (link: LinkType) => string}> = ({ item, resolveLink }) => {
  if (item._type === 'link') {
    return (
      <RouterLink to={resolveLink(item)} className="block text-lg font-semibold p-4 rounded-md hover:bg-neutral-800">
        {item.title}
      </RouterLink>
    );
  }

  if (item._type === 'megaMenu') {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-bold px-4 pt-4">{item.title}</h3>
        <div className="flex flex-col space-y-1">
          {item.content.flatMap(col => col.items).map(menuItem => (
            <RouterLink
              key={menuItem._key}
              to={resolveLink(menuItem.link)}
              className="flex items-center p-4 rounded-md hover:bg-neutral-800"
            >
              {menuItem.icon?.metadata?.url && (
                <img 
                  src={menuItem.icon.metadata.url} 
                  alt=""
                  className="h-6 w-6 mr-4 flex-shrink-0"
                  style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(1067%) hue-rotate(85deg) brightness(98%) contrast(92%)' }}
                />
              )}
              <div>
                <p className="font-semibold">{menuItem.title}</p>
                {menuItem.description && <p className="text-sm text-neutral-400">{menuItem.description}</p>}
              </div>
            </RouterLink>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


const MobileNav: React.FC<MobileNavProps> = ({ navItems, resolveLink }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-brand-dark border-neutral-800 text-white w-full sm:w-3/4 p-0">
        <div className="p-6 flex justify-between items-center border-b border-neutral-800">
          <a href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" alt="ElPortal.dk Logo" className="h-8" />
          </a>
          <SheetTrigger asChild>
             <Button variant="ghost" size="icon">
                <X className="h-6 w-6" />
             </Button>
          </SheetTrigger>
        </div>
        <div className="p-4 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item._key} onClick={() => setIsOpen(false)}>
              <MobileNavItem item={item} resolveLink={resolveLink} />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav; 