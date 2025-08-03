import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as LinkType, MegaMenu } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import MegaMenuContent from './MegaMenuContent';
import MobileNav from './MobileNav';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveLink, checkLinksHealth } from '@/utils/linkResolver';
import { useNavigationRefresh } from '@/hooks/useNavigationRefresh';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FALLBACK_LOGO, FALLBACK_ALT } from '@/constants/branding';

const Navigation = () => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const { refreshNavigation } = useNavigationRefresh();
  
  // Use the unified site settings hook
  const { settings, isLoading, isFetching, error } = useSiteSettings();

  // Health check navigation links in development
  if (process.env.NODE_ENV === 'development' && settings?.headerLinks) {
    checkLinksHealth(settings.headerLinks, 'Navigation');
  }

  // Show loading skeleton only when initially loading without data (not during background refetch)
  if (isLoading && !settings) {
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

  // Handle error state
  if (error && !settings) {
    console.error('[Navigation] Error loading navigation:', error);
    // Return minimal navigation structure
    return (
      <header className="sticky top-0 z-50 w-full bg-brand-dark h-16">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <RouterLink to="/" className="flex-shrink-0">
            <img 
              src={FALLBACK_LOGO}
              alt={FALLBACK_ALT} 
              className="h-8 sm:h-10"
              onError={(e) => {
                console.error('Navigation logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </RouterLink>
          <div className="text-white text-sm">Navigation unavailable</div>
        </div>
      </header>
    );
  }

  // If no data at all (shouldn't happen with proper error handling)
  if (!settings) {
    console.error('[Navigation] No navigation data available', {
      isLoading,
      isFetching,
      error
    });
    return <header className="sticky top-0 z-50 w-full bg-brand-dark h-16" />;
  }
  
  // Debug logging to trace the scroll issue
  console.log('[Navigation] Data state:', {
    hasSettings: !!settings,
    headerLinksLength: settings?.headerLinks?.length || 0,
    headerLinks: settings?.headerLinks,
    isLoading,
    isFetching
  });

  // Defensive check for headerLinks
  if (!settings?.headerLinks || !Array.isArray(settings.headerLinks) || settings.headerLinks.length === 0) {
    console.error('[Navigation] headerLinks is missing or empty:', settings);
    return <header className="sticky top-0 z-50 w-full bg-brand-dark h-16" />;
  }

  const ctaButton = settings.headerLinks.find(link => link._type === 'link' && link.isButton) as LinkType | undefined;
  const navItems = (settings?.headerLinks || []).filter(link => 
    link && link._type && !(link._type === 'link' && link.isButton)
  );
  
  // Add validation after filtering
  if (navItems.length === 0) {
    console.warn('[Navigation] No nav items after filtering:', {
      originalLength: settings?.headerLinks?.length,
      headerLinks: settings?.headerLinks
    });
  }
  
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
              FALLBACK_LOGO
            } 
            alt={settings.title || FALLBACK_ALT} 
            className="h-8 sm:h-10"
            onError={(e) => {
              console.error('Navigation logo failed to load');
              e.currentTarget.style.display = 'none';
            }}
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
            logoSrc={settings.logo?.asset?._ref ? 
              `https://cdn.sanity.io/images/yxesi03x/production/${settings.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}` :
              FALLBACK_LOGO
            }
            logoAlt={settings.title || FALLBACK_ALT}
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

      {/* Development helper - refresh button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs z-50">
          <div className="flex items-center gap-3">
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
