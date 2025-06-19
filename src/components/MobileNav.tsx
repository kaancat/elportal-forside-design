import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as LinkType, MegaMenu } from '@/types/sanity';

interface MobileNavProps {
  navItems: (LinkType | MegaMenu)[];
  resolveLink: (link: LinkType) => string;
}

const MobileNav: React.FC<MobileNavProps> = ({ navItems, resolveLink }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-brand-dark border-neutral-800 text-white">
        <div className="flex flex-col space-y-4 pt-8">
          {navItems.map((item) => {
            if (item._type === 'link') {
              return (
                <RouterLink key={item._key} to={resolveLink(item)} className="text-lg font-medium hover:text-brand-green">
                  {item.title}
                </RouterLink>
              );
            }
            if (item._type === 'megaMenu') {
              return (
                <div key={item._key}>
                  <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                  <div className="flex flex-col space-y-3 pl-4 border-l-2 border-neutral-700">
                    {item.content.flatMap(col => col.items).map(menuItem => (
                      <RouterLink key={menuItem._key} to={resolveLink(menuItem.link)} className="hover:text-brand-green">
                        {menuItem.title}
                      </RouterLink>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav; 