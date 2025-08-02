import React, { useState, useEffect } from 'react';
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

const NAVIGATION_STORAGE_KEY = 'elportal_navigation_cache';

const Navigation = () => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const { refreshNavigation } = useNavigationRefresh();

  // Try to get cached navigation data from localStorage
  const getCachedNavigation = (): SiteSettings | null => {
    try {
      const cached = localStorage.getItem(NAVIGATION_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 1 hour old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.error('[Navigation] Failed to parse cached data:', e);
    }
    return null;
  };

  // Use React Query for navigation data fetching
  const { data: settings, isLoading, error, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['navigation', 'site-settings'],
    queryFn: async () => {
      console.log('[Navigation] Fetching navigation data...');
      const data = await SanityService.getSiteSettings();
      
      // Cache successful response
      if (data) {
        console.log('[Navigation] Successfully fetched navigation data');
        try {
          localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
          console.log('[Navigation] Cached navigation data to localStorage');
        } catch (e) {
          console.error('[Navigation] Failed to cache data:', e);
        }
      } else {
        console.warn('[Navigation] Received null navigation data from Sanity');
      }
      
      // Health check navigation links in development
      if (process.env.NODE_ENV === 'development' && data?.headerLinks) {
        checkLinksHealth(data.headerLinks, 'Navigation');
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes (increased)
    gcTime: 1000 * 60 * 60, // Keep in cache for 60 minutes (increased)
    refetchOnWindowFocus: false, // Disable auto-refetch on focus
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: (failureCount, error) => {
      // Custom retry logic with exponential backoff
      if (failureCount < 3) {
        setTimeout(() => {
          console.log(`[Navigation] Retrying fetch (attempt ${failureCount + 1})`);
        }, Math.min(1000 * Math.pow(2, failureCount), 10000));
        return true;
      }
      return false;
    },
    initialData: getCachedNavigation, // Use cached data as initial data
    placeholderData: getCachedNavigation, // Keep showing previous data while fetching
  });

  // Get fallback data if available
  const fallbackSettings = getCachedNavigation();
  const navigationData = settings || fallbackSettings;

  // Log navigation state changes
  useEffect(() => {
    console.log('[Navigation] State:', {
      isLoading,
      isFetching,
      hasError: !!error,
      hasSettings: !!settings,
      hasFallback: !!fallbackSettings,
      hasNavigationData: !!navigationData,
    });
  }, [isLoading, isFetching, error, settings, fallbackSettings, navigationData]);

  // Show loading skeleton with structure
  if (isLoading && !navigationData) {
    return (
      <header className="sticky top-0 z-50 w-full bg-brand-dark h-16">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
          <div className="hidden md:flex items-center space-x-8">
            <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-yellow-400/20 rounded-full animate-pulse" />
            <div className="md:hidden h-8 w-8 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  // Handle error state but still show cached navigation if available
  if (error && !navigationData) {
    console.error('[Navigation] Error loading navigation:', error);
    // Return minimal navigation structure
    return (
      <header className="sticky top-0 z-50 w-full bg-brand-dark h-16">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <RouterLink to="/" className="flex-shrink-0">
            <img 
              src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png"
              alt="ElPortal.dk" 
              className="h-8 sm:h-10" 
            />
          </RouterLink>
          <div className="text-white text-sm">Navigation unavailable</div>
        </div>
      </header>
    );
  }

  // If no data at all (shouldn't happen with fallbacks)
  if (!navigationData) {
    console.error('[Navigation] No navigation data available');
    return <header className="sticky top-0 z-50 w-full bg-brand-dark h-16" />;
  }
  
  const ctaButton = navigationData.headerLinks.find(link => link._type === 'link' && link.isButton) as LinkType | undefined;
  const navItems = navigationData.headerLinks.filter(link => !(link._type === 'link' && link.isButton));
  const megaMenu = navItems.find(item => item._type === 'megaMenu') as MegaMenu | undefined;

  return (
    <header 
      className="sticky top-0 z-50 w-full bg-brand-dark shadow-md"
      onMouseLeave={() => setOpenMenuKey(null)}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <RouterLink to="/" className="flex-shrink-0">
          <img 
            src={navigationData.logo?.asset?._ref ? 
              `https://cdn.sanity.io/images/yxesi03x/production/${navigationData.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}` :
              "/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png"
            } 
            alt={navigationData.title || "ElPortal.dk"} 
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
          <MobileNav 
            navItems={navItems} 
            resolveLink={(link: LinkType) => resolveLink(link, 'Navigation')}
            logoSrc={navigationData.logo?.asset?._ref ? 
              `https://cdn.sanity.io/images/yxesi03x/production/${navigationData.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}` :
              "/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png"
            }
            logoAlt={navigationData.title || "ElPortal.dk"}
          />
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
