// src/components/MobileNav.tsx
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as LinkType, MegaMenu, MegaMenuColumn } from '@/types/sanity';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Icon, hasValidIcon } from './Icon';

// Helper for the rich, icon-driven link style
const RichLinkCard: React.FC<{ item: any, resolveLink: (link: LinkType) => string }> = ({ item, resolveLink }) => (
  <RouterLink
    to={resolveLink(item.link)}
    className="flex items-start text-left p-3 rounded-lg hover:bg-brand-green/10 transition-colors duration-200"
  >
    {hasValidIcon(item.icon) && (
      <Icon
        icon={item.icon}
        size={24}
        className="mr-4 mt-1 flex-shrink-0"
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
  <AccordionItem value={column._key} className="border-b-0">
    <AccordionTrigger className="text-lg font-semibold py-3 hover:no-underline rounded-md px-3">
      {column.title}
    </AccordionTrigger>
    <AccordionContent className="pb-1 pl-3">
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
  logoSrc?: string;
  logoAlt?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ navItems, resolveLink, logoSrc, logoAlt }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const simpleLinks = navItems.filter(item => item._type === 'link') as LinkType[];
  const megaMenu = navItems.find(item => item._type === 'megaMenu') as MegaMenu | undefined;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-brand-dark border-l border-neutral-800 text-white w-full max-w-sm p-0 flex flex-col h-full [&>button]:hidden">
        <div className="p-4 flex justify-between items-center border-b border-neutral-800 flex-shrink-0">
          <RouterLink to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img 
              src={logoSrc || "/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png"} 
              alt={logoAlt || "ElPortal.dk Logo"} 
              className="h-8" 
            />
          </RouterLink>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="p-4 space-y-2 pb-8">
            {/* Render Simple Links First */}
            {simpleLinks.map(item => (
               <div key={item._key} onClick={() => setIsOpen(false)}>
                 <RouterLink to={resolveLink(item)} className="block text-lg font-semibold p-3 rounded-md hover:bg-neutral-800">
                   {item.title}
                 </RouterLink>
               </div>
            ))}
            
            {/* Separator and Category Heading */}
            {megaMenu && (
              <>
                <div className="pt-4">
                  <div className="h-px bg-brand-green/20" />
                </div>
                <div className="px-3 pt-4 pb-2">
                  <h3 className="text-base font-semibold text-neutral-400 uppercase tracking-wider">{megaMenu.title}</h3>
                </div>
                <Accordion type="multiple" className="w-full pb-4">
                  {megaMenu.content.map(column => (
                     <div key={column._key} onClick={(e) => {
                       // This prevents the whole accordion from closing when a link inside is clicked
                       if ((e.target as HTMLElement).closest('a')) {
                         setIsOpen(false);
                       }
                     }}>
                      <MobileNavAccordionGroup column={column} resolveLink={resolveLink} />
                     </div>
                  ))}
                </Accordion>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav; 