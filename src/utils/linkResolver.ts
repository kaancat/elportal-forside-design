import { Link as LinkType } from '@/types/sanity';

/**
 * Safely resolves navigation links from Sanity
 * Provides error logging and fallbacks for broken references
 */
export const resolveLink = (link: LinkType | any, componentName: string = 'Component'): string => {
  // Safety check
  if (!link) {
    console.warn(`[${componentName}] Link is null or undefined`);
    return '/';
  }

  // Handle external links
  if (link.linkType === 'external') {
    if (!link.externalUrl) {
      console.warn(`[${componentName}] External link missing URL:`, {
        link,
        title: link.title,
        _key: link._key
      });
    }
    return link.externalUrl || '#';
  }
  
  // Handle internal links
  if (link.linkType === 'internal') {
    if (!link.internalLink) {
      console.error(`[${componentName}] Broken internal link - missing reference:`, {
        link,
        title: link.title,
        _key: link._key,
        _ref: link._ref,
        message: 'This usually happens when a referenced page has been deleted'
      });
      // Return home as fallback, but log the error
      return '/';
    }
    
    if (!link.internalLink.slug) {
      console.error(`[${componentName}] Internal link missing slug:`, {
        link,
        internalLink: link.internalLink,
        title: link.title,
        message: 'Referenced document exists but has no slug'
      });
      return '/';
    }
    
    // Success - return the slug
    return `/${link.internalLink.slug}`;
  }
  
  // Unknown link type
  console.warn(`[${componentName}] Unknown link type:`, {
    link,
    linkType: link.linkType,
    message: 'Expected linkType to be "internal" or "external"'
  });
  return '/';
};

/**
 * Batch check links for broken references
 * Useful for health checks and debugging
 */
export const checkLinksHealth = (links: (LinkType | any)[], componentName: string = 'Component'): {
  total: number;
  valid: number;
  broken: Array<{
    link: any;
    issue: string;
  }>;
} => {
  const brokenLinks: Array<{ link: any; issue: string }> = [];
  let validCount = 0;

  links.forEach(link => {
    if (!link) {
      brokenLinks.push({ link: null, issue: 'Link is null' });
      return;
    }

    if (link.linkType === 'external') {
      if (link.externalUrl) {
        validCount++;
      } else {
        brokenLinks.push({ link, issue: 'External link missing URL' });
      }
    } else if (link.linkType === 'internal') {
      if (link.internalLink && link.internalLink.slug) {
        validCount++;
      } else if (!link.internalLink) {
        brokenLinks.push({ link, issue: 'Broken reference (page deleted?)' });
      } else {
        brokenLinks.push({ link, issue: 'Referenced page missing slug' });
      }
    } else {
      brokenLinks.push({ link, issue: `Unknown link type: ${link.linkType}` });
    }
  });

  if (brokenLinks.length > 0) {
    console.error(`[${componentName}] Link health check found issues:`, {
      total: links.length,
      valid: validCount,
      broken: brokenLinks.length,
      issues: brokenLinks
    });
  }

  return {
    total: links.length,
    valid: validCount,
    broken: brokenLinks
  };
};