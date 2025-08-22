'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import StickyImageSection from './StickyImageSection'
import type { PageSection } from '@/types/sanity'
import { cn } from '@/lib/utils'

interface PageSectionProps {
  section: PageSection;
}

// Simple fade-up animation variant
const fadeUpVariant = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      delay: 0.05
    }
  }
}

// Container variant to gently stagger child elements for a refined feel
const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
}

// Subtle item fade-and-lift
const itemVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

// Image: very soft slide + tiny scale ease-in
const imageVariant = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const PageSectionComponent: React.FC<PageSectionProps> = ({ section }) => {
  const { title, content, image, imagePosition = 'left', theme, cta, settings, headerAlignment } = section;
  const prefersReducedMotion = useReducedMotion();
  const sectionMotionProps = prefersReducedMotion
    ? {}
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, margin: '0px 0px -50px 0px', amount: 0.1 } as const,
      };
  
  // Extract layout settings with defaults
  const layoutRatio = settings?.layoutRatio || '50/50';
  const verticalAlign = settings?.verticalAlign || 'start';
  const stickyImage = settings?.stickyImage || false;

  // Define custom components for Portable Text
  const customComponents = {
    block: {
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className={cn(
          "text-3xl md:text-4xl font-bold mb-6 leading-tight",
          themeColors.heading
        )}>{children}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 className={cn(
          "text-2xl md:text-3xl font-bold mb-4 leading-tight",
          themeColors.heading
        )}>{children}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className={cn(
          "text-xl md:text-2xl font-bold mb-3 leading-tight",
          themeColors.heading
        )}>{children}</h3>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className={cn(
          "relative border-l-4 border-brand-green pl-6 py-2 italic mb-6 rounded-r-lg",
          isDarkTheme() 
            ? "text-gray-200 bg-white/10" 
            : "text-neutral-700 bg-brand-green/5"
        )}>
          {children}
        </blockquote>
      ),
      normal: ({ children }: { children?: React.ReactNode }) => (
        <p className={cn(
          "mb-6 leading-relaxed text-lg",
          themeColors.body
        )}>{children}</p>
      ),
    },
    marks: {
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className={cn(
          "font-semibold",
          themeColors.strong
        )}>{children}</strong>
      ),
      em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
      link: ({ value, children }: { value?: { href: string }, children?: React.ReactNode }) => (
        <a 
          href={value?.href} 
          className={cn("underline transition-colors duration-200", themeColors.link)}
          target={value?.href?.startsWith('http') ? '_blank' : undefined}
          rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      ),
    },
  }
  
  // Simplified theme system with 5 themes
  const getThemeClasses = () => {
    const themeType = settings?.theme || 'default';
    const themes = {
      default: 'bg-white',
      light: 'bg-gray-50',
      subtle: 'bg-green-50/60',
      dark: 'bg-brand-dark text-white',
      primary: 'bg-brand-green'
    }
    return themes[themeType as keyof typeof themes] || themes.default;
  };

  // Subtle background overlay to add enterprise-grade depth per theme
  const getBackgroundOverlayClasses = () => {
    const themeType = settings?.theme || 'default';
    switch (themeType) {
      case 'dark':
        return 'from-transparent to-white/[0.04]';
      case 'primary':
        return 'from-transparent to-white/10';
      case 'subtle':
        return 'from-transparent to-brand-green/10';
      case 'light':
        return 'from-transparent to-gray-100';
      case 'default':
      default:
        return 'from-transparent to-gray-50';
    }
  }

  // Utility: detect if a hex color is dark
  const isHexDark = (hex?: string) => {
    if (!hex || typeof hex !== 'string') return false;
    const h = hex.replace('#', '');
    if (!(h.length === 3 || h.length === 6)) return false;
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const r = parseInt(full.substring(0, 2), 16) / 255;
    const g = parseInt(full.substring(2, 4), 16) / 255;
    const b = parseInt(full.substring(4, 6), 16) / 255;
    // Relative luminance (sRGB)
    const srgb = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return luminance < 0.45; // threshold for dark backgrounds
  }

  // Check if theme has dark background (needs light text)
  const isDarkTheme = () => {
    const themeType = settings?.theme;
    if (themeType === 'dark') return true;
    // If a custom color theme is applied via theme.background, detect darkness
    if (theme?.background && isHexDark(theme.background)) return true;
    return false;
  };

  // Get consistent text colors for each theme
  const getThemeTextColors = () => {
    const themeType = settings?.theme || 'default';
    
    const computedDark = isDarkTheme();
    switch (computedDark ? 'dark' : themeType) {
      case 'dark':
        return {
          heading: 'text-white',
          body: 'text-gray-100',
          strong: 'text-white',
          link: 'text-brand-green hover:text-brand-green-light'
        };
      case 'primary':
        return {
          heading: 'text-brand-dark',
          body: 'text-brand-dark',
          strong: 'text-brand-dark',
          link: 'text-brand-dark hover:text-brand-dark'
        };
      case 'subtle':
        return {
          heading: 'text-brand-dark',
          body: 'text-neutral-700',
          strong: 'text-brand-dark',
          link: 'text-brand-green-dark hover:text-brand-dark'
        };
      case 'light':
      case 'default':
      default:
        return {
          heading: 'text-brand-dark',
          body: 'text-neutral-600',
          strong: 'text-brand-dark',
          link: 'text-brand-green hover:text-brand-green-dark'
        };
    }
  };

  const themeColors = getThemeTextColors();

  // Get button styling based on theme
  const getButtonClasses = () => {
    const themeType = settings?.theme || 'default';
    
    switch (themeType) {
      case 'dark':
        return "bg-brand-green text-brand-dark hover:bg-brand-green-light";
      case 'primary':
        return "bg-brand-dark text-white hover:bg-brand-dark-light";
      case 'subtle':
        return "bg-brand-green text-white hover:bg-brand-green-dark";
      case 'light':
      case 'default':
      default:
        return "bg-brand-green text-white hover:bg-brand-green-dark";
    }
  };

  // Get padding classes based on settings
  const getPaddingClasses = () => {
    const padding = settings?.padding || 'medium';
    const paddings = {
      none: 'py-0',
      small: 'py-8 md:py-12',
      medium: 'py-16 md:py-24',
      large: 'py-24 md:py-32',
    }
    return paddings[padding] || paddings.medium;
  };

  // Get text alignment class
  const getTextAlignClass = () => {
    const alignment = headerAlignment || settings?.textAlignment;
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };
  
  const textAlignClass = getTextAlignClass();

  // Container width control (supports fullWidth from Sanity settings)
  const isFullWidth = settings?.fullWidth === true;
  const getContainerClasses = () => {
    if (isFullWidth) {
      return 'mx-auto w-full px-0';
    }
    return 'container mx-auto px-4';
  }

  // Heading accent alignment helper
  const getHeadingAccentAlign = () => {
    if (textAlignClass === 'text-left') return 'ml-0';
    if (textAlignClass === 'text-right') return 'mr-0 ml-auto';
    return 'mx-auto';
  }

  // Check if this is a text-only section (no image)
  const isTextOnly = !image;
  
  // If sticky image is enabled and there's an image, use the StickyImageSection component
  if (stickyImage && image) {
    return (
      <motion.section 
        {...sectionMotionProps}
        variants={fadeUpVariant}
        className={cn(
          "relative", // Remove overflow-hidden for sticky to work
          getThemeClasses(),
          getPaddingClasses()
        )}
        style={theme?.background ? { backgroundColor: theme.background } : {}}
      >
        {/* Wrap the sticky section in a motion container for consistent staggering when visible */}
        <motion.div variants={containerVariant}>
          <StickyImageSection section={section} customComponents={customComponents} />
        </motion.div>
      </motion.section>
    );
  }
  
  // Get grid layout classes based on ratio
  const getGridClasses = () => {
    switch (layoutRatio) {
      case '60/40':
        return 'md:grid-cols-12';
      case '40/60':
        return 'md:grid-cols-12';
      case '50/50':
      default:
        return 'md:grid-cols-2';
    }
  };
  
  // Get column span classes for text
  const getTextColumnClasses = () => {
    switch (layoutRatio) {
      case '60/40':
        return 'md:col-span-7';
      case '40/60':
        return 'md:col-span-5';
      case '50/50':
      default:
        return '';
    }
  };
  
  // Get column span classes for image
  const getImageColumnClasses = () => {
    switch (layoutRatio) {
      case '60/40':
        return 'md:col-span-5';
      case '40/60':
        return 'md:col-span-7';
      case '50/50':
      default:
        return '';
    }
  };
  
  // Get vertical alignment class
  const getVerticalAlignClass = () => {
    switch (verticalAlign) {
      case 'center':
        return 'md:items-center';
      case 'end':
        return 'md:items-end';
      case 'start':
      default:
        return 'md:items-start';
    }
  };

  return (
    <motion.section 
      {...sectionMotionProps}
      variants={fadeUpVariant}
      className={cn(
        "relative", // Removed overflow-hidden to fix sticky navigation conflict
        getThemeClasses(),
        getPaddingClasses()
      )}
      style={theme?.background ? { backgroundColor: theme.background } : {}}
    >
      {/* Subtle gradient overlay for depth (always behind content) */}
      <div className={cn('pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b', getBackgroundOverlayClasses())} />
      <motion.div className={cn('relative z-[1]', getContainerClasses())} variants={containerVariant}>
        {isTextOnly ? (
          // Text-only layout
          <div className={`max-w-4xl mx-auto ${textAlignClass}`}>
            {title && (
              <motion.h2 variants={itemVariant} className={cn(
                "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8",
                themeColors.heading
              )}>
                {title}
              </motion.h2>
            )}
            {title && (
              <motion.div variants={itemVariant} className={cn('h-1 w-16 rounded-full bg-gradient-to-r from-brand-green to-emerald-400', getHeadingAccentAlign(), 'mb-8')} />
            )}
            <motion.div variants={itemVariant} className={cn(
              "prose prose-lg max-w-none space-y-6",
              isDarkTheme() && "prose-invert"
            )}>
              {content && Array.isArray(content) && content.length > 0 && (
                <PortableText value={content} components={customComponents} />
              )}
            </motion.div>
            {cta && cta.text && cta.url && (
              <motion.div variants={itemVariant} className={`mt-10 ${textAlignClass === 'text-center' ? 'flex justify-center' : textAlignClass === 'text-right' ? 'flex justify-end' : ''}`}>
                <a 
                  href={cta.url} 
                  className={cn(
                    "inline-flex items-center px-8 py-4 font-semibold rounded-full transition-all duration-200",
                    "shadow-lg ring-1 ring-black/10 dark:ring-white/10 hover:shadow-xl hover:-translate-y-0.5",
                    getButtonClasses()
                  )}
                >
                  {cta.text}
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </motion.div>
            )}
          </div>
        ) : (
          // Image + text layout
          <div className={cn(
            "grid gap-12 md:gap-16 lg:gap-20",
            getGridClasses(),
            getVerticalAlignClass()
          )}>
            {/* Image Column */}
            <motion.div variants={imageVariant} className={cn(
              "order-1 group",
              imagePosition === 'right' ? 'md:order-2' : '',
              getImageColumnClasses()
            )}>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/0 to-black/[0.03] dark:from-white/0 dark:to-white/[0.06]" />
                <img
                  src={urlFor(image).width(800).quality(70).url()}
                  alt={image.alt || title}
                  className={cn(
                    "w-full h-auto rounded-2xl object-cover",
                    "shadow-xl shadow-black/5",
                    "transition-transform duration-500 group-hover:scale-[1.01]"
                  )}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>

            {/* Text Column */}
            <div className={cn(
              "order-2",
              imagePosition === 'right' ? 'md:order-1' : '',
              textAlignClass,
              getTextColumnClasses()
            )}>
              {title && (
                <motion.h2 variants={itemVariant} className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6",
                  themeColors.heading
                )}>
                  {title}
                </motion.h2>
              )}
              {title && (
                <motion.div variants={itemVariant} className={cn('h-1 w-16 rounded-full bg-gradient-to-r from-brand-green to-emerald-400', getHeadingAccentAlign(), 'mb-6')} />
              )}
              <motion.div variants={itemVariant} className={cn(
                "prose prose-lg space-y-6",
                layoutRatio === '60/40' ? 'max-w-prose' : 'max-w-none',
                isDarkTheme() && "prose-invert"
              )}>
                {content && Array.isArray(content) && content.length > 0 && (
                <PortableText value={content} components={customComponents} />
              )}
              </motion.div>
              {cta && cta.text && cta.url && (
                <motion.div variants={itemVariant} className={`mt-10 ${textAlignClass === 'text-center' ? 'flex justify-center' : textAlignClass === 'text-right' ? 'flex justify-end' : ''}`}>
                  <a 
                    href={cta.url} 
                    className={cn(
                      "inline-flex items-center px-8 py-4 font-semibold rounded-full transition-all duration-200",
                      "shadow-lg ring-1 ring-black/10 dark:ring-white/10 hover:shadow-xl hover:-translate-y-0.5",
                      getButtonClasses()
                    )}
                  >
                    {cta.text}
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        )}
        {settings?.separator && (
          <div className="mt-12 border-t border-black/5 dark:border-white/10" />
        )}
      </motion.div>
    </motion.section>
  );
}

export default PageSectionComponent