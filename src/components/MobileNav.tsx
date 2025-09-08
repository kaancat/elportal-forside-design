'use client'

// src/components/MobileNav.tsx
import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import UniversalLink from './UniversalLink';
import { usePathname } from 'next/navigation';
import { Link as LinkType, MegaMenu, MegaMenuColumn } from '@/types/sanity';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Icon, hasValidIcon } from './Icon';
import Logo from './Logo';
import { FALLBACK_ALT } from '@/constants/branding';

// Helper for the rich, icon-driven link style
const RichLinkCard: React.FC<{ item: any, resolveLink: (link: LinkType) => string }> = ({ item, resolveLink }) => (
  <UniversalLink
    href={resolveLink(item.link)}
    className="flex items-start text-left p-3 rounded-lg hover:bg-brand-green/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-inset"
  >
    {hasValidIcon(item.icon) && (
      <Icon
        icon={item.icon}
        size={24}
        className="mr-4 mt-1 flex-shrink-0"
      />
    )}
    <div>
      <p className="font-display font-semibold text-white">{item.title}</p>
      {item.description && <p className="text-sm text-neutral-400 mt-0.5">{item.description}</p>}
    </div>
  </UniversalLink>
);

// This component renders an entire column as a collapsible accordion item
const MobileNavAccordionGroup: React.FC<{ column: MegaMenuColumn, resolveLink: (link: LinkType) => string }> = ({ column, resolveLink }) => (
  <AccordionItem value={column._key} className="border-b-0">
    <AccordionTrigger className="text-lg font-display font-semibold py-3 hover:no-underline rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-inset">
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
  const pathname = usePathname();


  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Additional keyboard shortcuts
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      // Close on Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Clean up: Removed debug scroll listener since we fixed the root cause
  // The issue was the global transform rule breaking fixed positioning

  // Scroll lock is handled automatically by Radix UI Sheet component
  // No manual implementation needed - this prevents conflicts

  const simpleLinks = navItems.filter(item => item._type === 'link') as LinkType[];
  const megaMenu = navItems.find(item => item._type === 'megaMenu') as MegaMenu | undefined;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">{isOpen ? 'Close' : 'Open'} navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        id="mobile-navigation"
        side="left" 
        className="bg-brand-dark border-l border-neutral-800 text-white w-full max-w-sm p-0 [&>button]:hidden z-[9999] flex flex-col h-full"
        aria-label="Mobile navigation"
        aria-modal="true"
        role="dialog"
      >
        {/* Accessibility: Required by Radix UI Dialog/Sheet to prevent content hiding */}
        <SheetTitle style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
          Navigation Menu
        </SheetTitle>
        <SheetDescription style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
          Main navigation menu with links and product categories
        </SheetDescription>
        
        {/* Fixed header */}
        <div className="flex-shrink-0 bg-brand-dark p-4 flex justify-between items-center border-b border-neutral-800">
          <UniversalLink href="/" className="flex items-center relative" onClick={() => setIsOpen(false)}>
            <Logo 
              src={logoSrc}
              alt={logoAlt || FALLBACK_ALT}
              className="h-8"
            />
          </UniversalLink>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-brand-dark"
          >
              <X className="h-6 w-6" />
              <span className="sr-only">Close navigation menu</span>
          </Button>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-2 relative z-10">
            
            {/* Render Simple Links First */}
            {simpleLinks.map(item => (
               <div key={item._key} onClick={() => setIsOpen(false)}>
                 <UniversalLink 
                   href={resolveLink(item)} 
                   className="block text-lg font-display font-semibold p-3 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-inset"
                 >
                   {item.title}
                 </UniversalLink>
               </div>
            ))}
            
            {/* Separator and Category Heading */}
            {megaMenu && (
              <>
                <div className="pt-4">
                  <div className="h-px bg-brand-green/20" />
                </div>
                <div className="px-3 pt-4 pb-2">
                  <h3 className="text-base font-display font-semibold text-neutral-400 uppercase tracking-wider">{megaMenu.title}</h3>
                </div>
                <Accordion type="multiple" className="w-full" defaultValue={[megaMenu.content.find(col => col.title === 'Priser')?._key || '']}>
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
            
            {/* Empty state check */}
            {simpleLinks.length === 0 && !megaMenu && (
              <div className="p-4 text-white">
                <p>No navigation items available</p>
              </div>
            )}
            
            {/* Bottom padding to ensure last items are accessible */}
            <div className="h-20" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav; 