/**
 * Comprehensive Meta Tags Management System
 * Handles all meta tags for SEO, social media, and search engines
 */

export interface MetaTagsConfig {
  // Basic meta tags
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  language?: string;
  
  // Open Graph (Facebook, LinkedIn)
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogSiteName?: string;
  ogLocale?: string;
  ogLocaleAlternate?: string[];
  ogArticlePublishedTime?: string;
  ogArticleModifiedTime?: string;
  ogArticleAuthor?: string;
  ogArticleSection?: string;
  ogArticleTags?: string[];
  
  // Twitter Card
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  
  // Additional SEO tags
  canonical?: string;
  alternates?: Array<{ href: string; hreflang: string }>;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  
  // Schema.org specific
  schemaType?: string;
  
  // App-specific meta tags
  appleTouchIcon?: string;
  manifest?: string;
  themeColor?: string;
  msApplicationTileColor?: string;
  msApplicationConfig?: string;
}

/**
 * Default meta tags for DinElportal
 */
export const DEFAULT_META_TAGS: Partial<MetaTagsConfig> = {
  charset: 'UTF-8',
  viewport: 'width=device-width, initial-scale=1.0',
  language: 'da',
  robots: 'index, follow',
  author: 'DinElportal',
  ogType: 'website',
  ogSiteName: 'DinElportal - Din Elportal',
  ogLocale: 'da_DK',
  twitterCard: 'summary_large_image',
  twitterSite: '@elportal',
  themeColor: '#00CD52'
};

/**
 * Generates a meta tag element
 */
function createMetaTag(
  attribute: 'name' | 'property' | 'http-equiv',
  key: string,
  content: string
): HTMLMetaElement {
  const meta = document.createElement('meta');
  meta.setAttribute(attribute, key);
  meta.content = content;
  return meta;
}

/**
 * Removes existing meta tags
 */
function removeMetaTags(selector: string): void {
  const tags = document.querySelectorAll(selector);
  tags.forEach(tag => tag.remove());
}

/**
 * Updates or creates a meta tag
 */
function updateMetaTag(
  attribute: 'name' | 'property' | 'http-equiv',
  key: string,
  content: string
): void {
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.querySelector(selector);
  
  if (tag) {
    tag.setAttribute('content', content);
  } else {
    tag = createMetaTag(attribute, key, content);
    document.head.appendChild(tag);
  }
}

/**
 * Injects comprehensive meta tags into the document head
 */
export function injectMetaTags(config: MetaTagsConfig): void {
  const finalConfig = { ...DEFAULT_META_TAGS, ...config };
  
  // Basic meta tags
  if (finalConfig.title) {
    document.title = finalConfig.title;
  }
  
  if (finalConfig.description) {
    updateMetaTag('name', 'description', finalConfig.description);
  }
  
  if (finalConfig.keywords && finalConfig.keywords.length > 0) {
    updateMetaTag('name', 'keywords', finalConfig.keywords.join(', '));
  }
  
  if (finalConfig.author) {
    updateMetaTag('name', 'author', finalConfig.author);
  }
  
  if (finalConfig.robots) {
    updateMetaTag('name', 'robots', finalConfig.robots);
  }
  
  if (finalConfig.viewport) {
    updateMetaTag('name', 'viewport', finalConfig.viewport);
  }
  
  // Language and locale
  if (finalConfig.language) {
    document.documentElement.lang = finalConfig.language;
    updateMetaTag('http-equiv', 'content-language', finalConfig.language);
  }
  
  // Open Graph tags
  if (finalConfig.ogTitle) {
    updateMetaTag('property', 'og:title', finalConfig.ogTitle);
  }
  
  if (finalConfig.ogDescription) {
    updateMetaTag('property', 'og:description', finalConfig.ogDescription);
  }
  
  if (finalConfig.ogImage) {
    updateMetaTag('property', 'og:image', finalConfig.ogImage);
    
    if (finalConfig.ogImageWidth) {
      updateMetaTag('property', 'og:image:width', String(finalConfig.ogImageWidth));
    }
    
    if (finalConfig.ogImageHeight) {
      updateMetaTag('property', 'og:image:height', String(finalConfig.ogImageHeight));
    }
    
    if (finalConfig.ogImageAlt) {
      updateMetaTag('property', 'og:image:alt', finalConfig.ogImageAlt);
    }
  }
  
  if (finalConfig.ogUrl) {
    updateMetaTag('property', 'og:url', finalConfig.ogUrl);
  }
  
  if (finalConfig.ogType) {
    updateMetaTag('property', 'og:type', finalConfig.ogType);
  }
  
  if (finalConfig.ogSiteName) {
    updateMetaTag('property', 'og:site_name', finalConfig.ogSiteName);
  }
  
  if (finalConfig.ogLocale) {
    updateMetaTag('property', 'og:locale', finalConfig.ogLocale);
  }
  
  // Article-specific Open Graph tags
  if (finalConfig.ogType === 'article') {
    if (finalConfig.ogArticlePublishedTime) {
      updateMetaTag('property', 'article:published_time', finalConfig.ogArticlePublishedTime);
    }
    
    if (finalConfig.ogArticleModifiedTime) {
      updateMetaTag('property', 'article:modified_time', finalConfig.ogArticleModifiedTime);
    }
    
    if (finalConfig.ogArticleAuthor) {
      updateMetaTag('property', 'article:author', finalConfig.ogArticleAuthor);
    }
    
    if (finalConfig.ogArticleSection) {
      updateMetaTag('property', 'article:section', finalConfig.ogArticleSection);
    }
    
    if (finalConfig.ogArticleTags && finalConfig.ogArticleTags.length > 0) {
      finalConfig.ogArticleTags.forEach(tag => {
        const tagElement = createMetaTag('property', 'article:tag', tag);
        document.head.appendChild(tagElement);
      });
    }
  }
  
  // Twitter Card tags
  if (finalConfig.twitterCard) {
    updateMetaTag('name', 'twitter:card', finalConfig.twitterCard);
  }
  
  if (finalConfig.twitterSite) {
    updateMetaTag('name', 'twitter:site', finalConfig.twitterSite);
  }
  
  if (finalConfig.twitterCreator) {
    updateMetaTag('name', 'twitter:creator', finalConfig.twitterCreator);
  }
  
  if (finalConfig.twitterTitle) {
    updateMetaTag('name', 'twitter:title', finalConfig.twitterTitle);
  }
  
  if (finalConfig.twitterDescription) {
    updateMetaTag('name', 'twitter:description', finalConfig.twitterDescription);
  }
  
  if (finalConfig.twitterImage) {
    updateMetaTag('name', 'twitter:image', finalConfig.twitterImage);
    
    if (finalConfig.twitterImageAlt) {
      updateMetaTag('name', 'twitter:image:alt', finalConfig.twitterImageAlt);
    }
  }
  
  // App-specific meta tags
  if (finalConfig.themeColor) {
    updateMetaTag('name', 'theme-color', finalConfig.themeColor);
  }
  
  if (finalConfig.manifest) {
    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = finalConfig.manifest;
  }
  
  if (finalConfig.appleTouchIcon) {
    let link = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      document.head.appendChild(link);
    }
    link.href = finalConfig.appleTouchIcon;
  }
  
  // Alternate language links
  if (finalConfig.alternates && finalConfig.alternates.length > 0) {
    // Remove existing alternate links
    const existingAlternates = document.querySelectorAll('link[rel="alternate"]');
    existingAlternates.forEach(link => link.remove());
    
    // Add new alternate links
    finalConfig.alternates.forEach(alternate => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = alternate.hreflang;
      link.href = alternate.href;
      document.head.appendChild(link);
    });
  }
}

/**
 * Removes all SEO-related meta tags
 */
export function removeAllMetaTags(): void {
  // Remove name meta tags
  const nameMetaTags = [
    'description', 'keywords', 'author', 'robots', 'twitter:card',
    'twitter:site', 'twitter:creator', 'twitter:title', 'twitter:description',
    'twitter:image', 'twitter:image:alt', 'theme-color'
  ];
  
  nameMetaTags.forEach(name => {
    removeMetaTags(`meta[name="${name}"]`);
  });
  
  // Remove property meta tags (Open Graph)
  const propertyMetaTags = document.querySelectorAll('meta[property^="og:"], meta[property^="article:"]');
  propertyMetaTags.forEach(tag => tag.remove());
  
  // Remove alternate links
  const alternateLinks = document.querySelectorAll('link[rel="alternate"]');
  alternateLinks.forEach(link => link.remove());
}

/**
 * Generates meta tags for Danish SEO
 */
export function generateDanishMetaTags(
  title: string,
  description: string,
  keywords?: string[]
): MetaTagsConfig {
  return {
    title: `${title} | DinElportal`,
    description,
    keywords: keywords || [
      'elpriser', 'strømpriser', 'elselskaber', 'elaftale',
      'sammenlign el', 'billig el', 'grøn energi', 'vindstød',
      'spotpris', 'elmarked', 'energi', 'strøm'
    ],
    language: 'da',
    ogLocale: 'da_DK',
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description
  };
}

/**
 * Validates meta tags configuration
 */
export function validateMetaTags(config: MetaTagsConfig): string[] {
  const errors: string[] = [];
  
  // Title validation
  if (!config.title) {
    errors.push('Title is required');
  } else if (config.title.length > 60) {
    errors.push('Title should be less than 60 characters');
  }
  
  // Description validation
  if (!config.description) {
    errors.push('Description is required');
  } else if (config.description.length > 160) {
    errors.push('Description should be less than 160 characters');
  }
  
  // OG Image validation
  if (config.ogImage && !config.ogImage.startsWith('http')) {
    errors.push('OG Image must be an absolute URL');
  }
  
  // Twitter Image validation
  if (config.twitterImage && !config.twitterImage.startsWith('http')) {
    errors.push('Twitter Image must be an absolute URL');
  }
  
  return errors;
}

/**
 * Gets current meta tags from the document
 */
export function getCurrentMetaTags(): Partial<MetaTagsConfig> {
  const config: Partial<MetaTagsConfig> = {};
  
  // Get title
  config.title = document.title;
  
  // Get meta tags by name
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) {
    config.description = descriptionTag.getAttribute('content') || '';
  }
  
  const keywordsTag = document.querySelector('meta[name="keywords"]');
  if (keywordsTag) {
    const keywords = keywordsTag.getAttribute('content');
    if (keywords) {
      config.keywords = keywords.split(',').map(k => k.trim());
    }
  }
  
  const authorTag = document.querySelector('meta[name="author"]');
  if (authorTag) {
    config.author = authorTag.getAttribute('content') || undefined;
  }
  
  const robotsTag = document.querySelector('meta[name="robots"]');
  if (robotsTag) {
    config.robots = robotsTag.getAttribute('content') || undefined;
  }
  
  // Get Open Graph tags
  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (ogTitleTag) {
    config.ogTitle = ogTitleTag.getAttribute('content') || undefined;
  }
  
  const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  if (ogDescriptionTag) {
    config.ogDescription = ogDescriptionTag.getAttribute('content') || undefined;
  }
  
  const ogImageTag = document.querySelector('meta[property="og:image"]');
  if (ogImageTag) {
    config.ogImage = ogImageTag.getAttribute('content') || undefined;
  }
  
  // Get Twitter Card tags
  const twitterCardTag = document.querySelector('meta[name="twitter:card"]');
  if (twitterCardTag) {
    config.twitterCard = twitterCardTag.getAttribute('content') as any;
  }
  
  const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitleTag) {
    config.twitterTitle = twitterTitleTag.getAttribute('content') || undefined;
  }
  
  const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescriptionTag) {
    config.twitterDescription = twitterDescriptionTag.getAttribute('content') || undefined;
  }
  
  return config;
}