import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SanityService } from '@/services/sanityService';
import { SiteSettings, Link as LinkType, MegaMenu } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import MegaMenuContent from './MegaMenuContent';
import MobileNav from './MobileNav';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveLink, checkLinksHealth } from '@/utils/linkResolver';

const Navigation = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await SanityService.getSiteSettings();
      setSettings(data);
      
      // Health check navigation links in development
      if (process.env.NODE_ENV === 'development' && data?.headerLinks) {
        checkLinksHealth(data.headerLinks, 'Navigation');
      }
    };
    fetchSettings();
  }, []);
  

  if (!settings) {
    return <header className="sticky top-0 z-50 w-full bg-brand-dark h-16" />;
  }
  
  const ctaButton = settings.headerLinks.find(link => link._type === 'link' && link.isButton) as LinkType | undefined;
  const navItems = settings.headerLinks.filter(link => !(link._type === 'link' && link.isButton));
  const megaMenu = navItems.find(item => item._type === 'megaMenu') as MegaMenu | undefined;

  return (
    <header 
      className="sticky top-0 z-50 w-full bg-brand-dark shadow-md"
      onMouseLeave={() => setOpenMenuKey(null)}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <RouterLink to="/" className="flex-shrink-0">
          <img src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" alt="ElPortal.dk Logo" className="h-8 sm:h-10" />
        </RouterLink>
        
        <nav className="hidden md:flex items-center justify-center space-x-8">
          {navItems.map((item) => (
            <div 
              key={item._key}
              onMouseEnter={() => item._type === 'megaMenu' && setOpenMenuKey(item._key)}
            >
              {item._type === 'link' ? (
                <RouterLink to={resolveLink(item as LinkType, 'Navigation')} className="text-white hover:text-brand-green font-medium transition-colors">
                  {item.title}
                </RouterLink>
              ) : (
                <button className="text-white hover:text-brand-green font-medium transition-colors flex items-center">
                  {(item as MegaMenu).title}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          {ctaButton && (
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-medium rounded-full px-6">
              <RouterLink to={resolveLink(ctaButton, 'Navigation')}>{ctaButton.title}</RouterLink>
            </Button>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          {ctaButton && (
            <Button asChild size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-medium rounded-full px-4">
              <RouterLink to={resolveLink(ctaButton, 'Navigation')}>{ctaButton.title}</RouterLink>
            </Button>
          )}
          <MobileNav navItems={navItems} resolveLink={(link: LinkType) => resolveLink(link, 'Navigation')} />
        </div>
      </div>

      <AnimatePresence>
        {megaMenu && openMenuKey === megaMenu._key && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-brand-dark border-t border-neutral-800 shadow-xl"
          >
            <MegaMenuContent menu={megaMenu} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
