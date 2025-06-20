import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as LinkType, MegaMenu } from '@/types/sanity';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface MobileNavProps {
  navItems: (LinkType | MegaMenu)[];
  ctaButton?: LinkType; // Add the CTA button as a prop
  resolveLink: (link: LinkType) => string;
}

const MobileNavItem: React.FC<{item: LinkType | MegaMenu, resolveLink: (link: LinkType) => string}> = ({ item, resolveLink }) => {
  // Simple Link
  if (item._type === 'link') {
    return (
      <RouterLink to={resolveLink(item)} className="block text-lg font-semibold p-4 rounded-md hover:bg-neutral-800">
        {item.title}
      </RouterLink>
    );
  }

  // Accordion for Mega Menu
  if (item._type === 'megaMenu') {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={item._key} className="border-b-0">
          <AccordionTrigger className="text-lg font-semibold p-4 hover:no-underline hover:bg-neutral-800 rounded-md">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            <div className="flex flex-col space-y-1 mt-2">
              {item.content.flatMap(col => col.items).map(menuItem => (
                <RouterLink
                  key={menuItem._key}
                  to={resolveLink(menuItem.link)}
                  className="flex items-center p-3 rounded-md hover:bg-neutral-800"
                >
                  {/* We'll add the icon back in a separate, verified step if needed */}
                  <p className="font-semibold">{menuItem.title}</p>
                </RouterLink>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  return null;
};

const MobileNav: React.FC<MobileNavProps> = ({ navItems, ctaButton, resolveLink }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-brand-dark border-neutral-800 text-white w-full max-w-sm p-0 flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-neutral-800 flex-shrink-0">
          <a href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" alt="ElPortal.dk Logo" className="h-8" />
          </a>
          {/* This is now the ONLY close button */}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
          </Button>
        </div>
        {/* This div is now scrollable */}
        <div className="flex-grow p-4 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item._key} onClick={() => {if(item._type === 'link') setIsOpen(false)}}>
              <MobileNavItem item={item} resolveLink={resolveLink} />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav; 