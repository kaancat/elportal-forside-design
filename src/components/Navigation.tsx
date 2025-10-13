'use client'

import React, { useState } from 'react';
import UniversalLink from './UniversalLink';
import { Link as LinkType, MegaMenu } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import MegaMenuContent from './MegaMenuContent';
import MobileNav from './MobileNav';
import Logo from './Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveLink, checkLinksHealth } from '@/utils/linkResolver';
import { useNavigationRefresh } from '@/hooks/useNavigationRefresh';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import type { SiteSettings } from '@/types/sanity';
import { FALLBACK_LOGO, FALLBACK_ALT } from '@/constants/branding';
import { envBool } from '@/lib/env'

function isLinkEntry(link: LinkType | MegaMenu): link is LinkType {
  return !!link && (link as any)._type === 'link';
}

interface NavigationProps {
  initialSettings?: SiteSettings | null;
}

const Navigation = ({ initialSettings }: NavigationProps) => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const { refreshNavigation } = useNavigationRefresh();

  // Use the unified site settings hook
  // If initialSettings provided from server, skip client fetch for instant header render
  const { settings: fetchedSettings, isLoading, isFetching, error } = useSiteSettings({ enabled: !initialSettings });
  const settings = initialSettings ?? fetchedSettings;

  // Health check navigation links in development (gated by verbose flag)
  const debugVerbose = envBool('NEXT_PUBLIC_DEBUG_VERBOSE', false)
  if (process.env.NODE_ENV === 'development' && debugVerbose && settings?.headerLinks) {
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
          <UniversalLink href="/" className="flex-shrink-0 relative">
            <Logo
              src={null}
              alt={FALLBACK_ALT}
              className="h-8 sm:h-10"
            />
          </UniversalLink>
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

  // Debug logging gated by verbose flag
  if (process.env.NODE_ENV === 'development' && debugVerbose) console.log('[Navigation] Data state:', {
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

  // Debug logging for filtering logic (gated)
  if (process.env.NODE_ENV === 'development' && debugVerbose) console.log('[Navigation] BEFORE filtering - headerLinks:', settings.headerLinks?.map(link => ({
    title: link.title,
    _type: link._type,
    isButton: isLinkEntry(link) ? link.isButton : undefined,
    linkType: isLinkEntry(link) ? link.linkType : undefined
  })));

  const ctaButton = settings.headerLinks.find(link => isLinkEntry(link) && link.isButton) as LinkType | undefined;
  if (process.env.NODE_ENV === 'development' && debugVerbose) console.log('[Navigation] CTA Button found:', ctaButton?.title || 'None');

  const navItems = (settings?.headerLinks || []).filter(link => {
    const shouldKeep = !!link && !!link._type && !(isLinkEntry(link) && link.isButton);
    if (process.env.NODE_ENV === 'development' && debugVerbose) console.log('[Navigation] Filter check:', {
      title: link?.title,
      _type: link?._type,
      isButton: isLinkEntry(link) ? link.isButton : undefined,
      shouldKeep
    });
    return shouldKeep;
  });

  if (process.env.NODE_ENV === 'development' && debugVerbose) console.log('[Navigation] AFTER filtering - navItems:', navItems.length, navItems.map(item => ({
    title: item.title,
    _type: item._type
  })));

  // Add validation after filtering
  if (navItems.length === 0) {
    console.warn('[Navigation] No nav items after filtering - CRITICAL ISSUE:', {
      originalLength: settings?.headerLinks?.length,
      headerLinks: settings?.headerLinks,
      allAreButtons: settings?.headerLinks?.every(link => isLinkEntry(link) && link.isButton)
    });
  }

  // Inject local "Blog" link between "Leverandører" and "Lær mere om" (non-destructive; does not mutate CMS)
  const displayItems: (LinkType | MegaMenu)[] = (() => {
    const copy = [...navItems];

    // Prevent duplicate if already present
    const alreadyHasBlog = copy.some(it => it._type === 'link' && (it as LinkType).internalLink?.slug === 'blogs');
    if (alreadyHasBlog) return copy;

    const blogLink: LinkType = {
      _key: 'local-blog-link',
      _type: 'link',
      title: 'Blog',
      linkType: 'internal',
      internalLink: { slug: 'blogs', _type: 'page' },
      isButton: false,
    } as LinkType;

    // Find reference positions
    const lower = (s?: string) => (s || '').trim().toLowerCase();
    const leverIndex = copy.findIndex(it => it._type === 'link' && lower((it as LinkType).title) === 'leverandører');
    const learnIndex = copy.findIndex(it => it._type === 'megaMenu' && lower((it as MegaMenu).title).includes('lær mere om'));

    let insertIndex = copy.length;
    if (learnIndex >= 0) insertIndex = learnIndex; // just before mega menu
    else if (leverIndex >= 0) insertIndex = leverIndex + 1; // after Leverandører

    copy.splice(Math.max(0, Math.min(insertIndex, copy.length)), 0, blogLink);
    return copy;
  })();

  const megaMenu = displayItems.find(item => item._type === 'megaMenu') as MegaMenu | undefined;

  // Helper to build a small, optimized Sanity image URL for fast header rendering
  const buildOptimizedSanityUrl = (ref?: string | null) => {
    if (!ref) return null;
    const base = ref
      .replace('image-', '')
      .replace('-png', '.png')
      .replace('-jpg', '.jpg')
      .replace('-webp', '.webp');
    return `https://cdn.sanity.io/images/yxesi03x/production/${base}?w=200&auto=format&fit=max`;
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-brand-dark shadow-md"
      onMouseLeave={() => setOpenMenuKey(null)}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <UniversalLink href="/" className="flex-shrink-0 relative">
          <Logo
            src={buildOptimizedSanityUrl(settings.logo?.asset && '_ref' in settings.logo.asset && settings.logo.asset._ref ? settings.logo.asset._ref : null)}
            alt={settings.title || FALLBACK_ALT}
            className="h-8 sm:h-10"
          />
        </UniversalLink>

        <nav className="hidden md:flex items-center justify-center space-x-8">
          {displayItems.map((item) => (
            <div
              key={item._key}
              onMouseEnter={() => item._type === 'megaMenu' && setOpenMenuKey(item._key)}
            >
              {item._type === 'link' ? (
                <UniversalLink href={resolveLink(item as LinkType, 'Navigation')} className="text-white hover:text-brand-green font-display font-medium transition-colors">
                  {item.title}
                </UniversalLink>
              ) : (
                <button className="text-white hover:text-brand-green font-display font-medium transition-colors flex items-center">
                  {(item as MegaMenu).title}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          {ctaButton && (
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-display font-medium rounded-full px-6">
              <UniversalLink href={resolveLink(ctaButton, 'Navigation')}>{ctaButton.title}</UniversalLink>
            </Button>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          {ctaButton && (
            <Button asChild size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-display font-medium rounded-full px-4">
              <UniversalLink href={resolveLink(ctaButton, 'Navigation')}>{ctaButton.title}</UniversalLink>
            </Button>
          )}
          <MobileNav
            navItems={displayItems}
            resolveLink={(link: LinkType) => resolveLink(link, 'Navigation')}
            logoSrc={buildOptimizedSanityUrl(settings.logo?.asset && '_ref' in settings.logo.asset && settings.logo.asset._ref ? settings.logo.asset._ref : null) || undefined}
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
