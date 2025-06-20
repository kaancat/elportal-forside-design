// src/components/MobileNav.tsx
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as LinkType, MegaMenu, MegaMenuColumn, IconManager } from '@/types/sanity';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Helper to render the rich menu item card
const RichLinkCard: React.FC<{ item: any, resolveLink: (link: LinkType) => string }> = ({ item, resolveLink }) => (
  <RouterLink
    to={resolveLink(item.link)}
    className="flex items-start text-left p-3 rounded-lg hover:bg-brand-green/10 transition-colors duration-200"
  >
    {item.icon?.metadata?.url && (
      <img 
        src={item.icon.metadata.url} 
        alt=""
        className="h-6 w-6 mr-4 mt-1 flex-shrink-0"
        style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(1067%) hue-rotate(85deg) brightness(98%) contrast(92%)' }}
      />
    )}
    <div>
      <p className="font-semibold text-white">{item.title}</p>
      {item.description && <p className="text-sm text-neutral-400 mt-0.5">{item.description}</p>}
    </div>
  </RouterLink>
);

// This component renders an entire column as a collapsible accordion item
const MobileNavAccordionGroup: React.FC<{ column: MegaMenuColumn, resolveLink: (link: LinkType) => string }> = ({ column, resolveLink }) => (
  <AccordionItem value={column._key} className="border-b border-neutral-800">
    <AccordionTrigger className="text-lg font-semibold py-4 hover:no-underline">
      {column.title}
    </AccordionTrigger>
    <AccordionContent className="pb-2">
      <div className="flex flex-col space-y-1">
        {column.items.map(item => (
          <RichLinkCard key={item._key} item={item} resolveLink={resolveLink} />
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
);

interface MobileNavProps {
  navItems: (LinkType | MegaMenu)[];
  resolveLink: (link: LinkType) => string;
}

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
      <SheetContent side="left" className="bg-brand-dark border-l border-neutral-800 text-white w-full max-w-sm p-0 flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-neutral-800 flex-shrink-0">
          <a href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" alt="ElPortal.dk Logo" className="h-8" />
          </a>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
          </Button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          <div className="p-2">
            {navItems.map((item) => (
              <div key={item._key} onClick={() => {if(item._type === 'link') setIsOpen(false)}}>
                {item._type === 'link' && (
                  <RouterLink to={resolveLink(item)} className="block text-lg font-semibold p-4 rounded-md hover:bg-neutral-800">
                    {item.title}
                  </RouterLink>
                )}
                {item._type === 'megaMenu' && (
                  <Accordion type="multiple" className="w-full">
                    {item.content.map(column => (
                      <MobileNavAccordionGroup key={column._key} column={column} resolveLink={resolveLink} />
                    ))}
                  </Accordion>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav; 