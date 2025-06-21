import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SanityService } from '@/services/sanityService';
import { SiteSettings, Link as LinkType, MegaMenu } from '@/types/sanity';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import MegaMenuContent from './MegaMenuContent';
import MobileNav from './MobileNav';

const Navigation = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await SanityService.getSiteSettings();
      setSettings(data);
      
      // --- DIAGNOSTIC: Verify icon data is arriving ---
      console.log('Fetched Site Settings:', data);
    };
    fetchSettings();
  }, []);

  const resolveLink = (link: LinkType) => {
    if (link.linkType === 'external') return link.externalUrl || '#';
    if (!link.internalLink?.slug) return '/';
    return `/${link.internalLink.slug}`;
  };

  if (!settings) {
    // Optional: return a loading skeleton or a simplified header
    return <header className="sticky top-0 z-50 w-full bg-brand-dark h-16" />;
  }
  
  const ctaButton = settings.headerLinks.find(link => link._type === 'link' && link.isButton) as LinkType;
  const navItems = settings.headerLinks.filter(link => !(link._type === 'link' && link.isButton));

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-dark shadow-md">
      <NavigationMenu className="w-full max-w-none mx-auto">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center">
            <img src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" alt="ElPortal.dk Logo" className="h-8 sm:h-10" />
          </a>
          <nav className="hidden md:flex items-center space-x-6">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item._key}>
                  {item._type === 'link' ? (
                    <NavigationMenuLink asChild>
                      <RouterLink 
                        to={resolveLink(item as LinkType)}
                        className="text-white hover:text-brand-green font-medium px-4 py-2 transition-colors"
                      >
                        {item.title}
                      </RouterLink>
                    </NavigationMenuLink>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="text-white hover:text-brand-green font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent px-4 py-2 text-base border-0">
                        {(item as MegaMenu).title}
                      </NavigationMenuTrigger>
                      <MegaMenuContent menu={item as MegaMenu} />
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </nav>
          <div className="hidden md:flex">
            {ctaButton && (
              <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-medium rounded-full px-6">
                <RouterLink to={resolveLink(ctaButton)}>
                  {ctaButton.title}
                </RouterLink>
              </Button>
            )}
          </div>
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              {ctaButton && (
                <Button asChild size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-medium rounded-full px-4">
                  <RouterLink to={resolveLink(ctaButton)}>
                    {ctaButton.title}
                  </RouterLink>
                </Button>
              )}
              <MobileNav navItems={navItems} resolveLink={resolveLink} />
            </div>
          </div>
        </div>

        {/* This is the new full-width viewport container */}
        <div className="absolute top-full left-0 w-full">
          <div className="container mx-auto px-4">
             <NavigationMenuViewport className="bg-brand-dark border border-t-0 border-neutral-700 shadow-lg rounded-b-lg" />
          </div>
        </div>
      </NavigationMenu>
    </header>
  );
};

export default Navigation;
