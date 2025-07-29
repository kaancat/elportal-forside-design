import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SanityService } from '@/services/sanityService';
import { SiteSettings, Link as LinkType, MegaMenu } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import MegaMenuContent from './MegaMenuContent';
import MobileNav from './MobileNav';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveLink, checkLinksHealth } from '@/utils/linkResolver';
import { useNavigationRefresh } from '@/hooks/useNavigationRefresh';

const Navigation = () => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const { refreshNavigation } = useNavigationRefresh();

  // Use React Query for navigation data fetching
  const { data: settings, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['navigation', 'site-settings'],
    queryFn: async () => {
      const data = await SanityService.getSiteSettings();
      
      // Health check navigation links in development
      if (process.env.NODE_ENV === 'development' && data?.headerLinks) {
        checkLinksHealth(data.headerLinks, 'Navigation');
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 3, // Retry failed requests 3 times
  });

  // Show loading state
  if (isLoading) {
    return <header className="sticky top-0 z-50 w-full bg-brand-dark h-16" />;
  }

  // Handle error state
  if (error || !settings) {
    console.error('Navigation error:', error);
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
          <img 
            src={settings.logo?.asset?._ref ? 
              `https://cdn.sanity.io/images/yxesi03x/production/${settings.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}` :
              "/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png"
            } 
            alt={settings.title || "ElPortal.dk"} 
            className="h-8 sm:h-10" 
          />
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

      {/* Development helper - shows last update time and refresh button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs z-50">
          <div className="flex items-center gap-3">
            <div>
              <div>Navigation Updated:</div>
              <div className="text-gray-400">
                {new Date(dataUpdatedAt).toLocaleTimeString()}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => refreshNavigation()}
              className="text-xs"
            >
              Refresh Nav
            </Button>
          </div>
          <div className="text-gray-500 mt-1">
            Shortcut: Ctrl+Shift+N
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
