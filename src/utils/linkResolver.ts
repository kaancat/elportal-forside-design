import { Link as LinkType } from '@/types/sanity';

/**
 * Safely resolves navigation links from Sanity
 * Returns string or null for broken links - never throws
 */
export const resolveLink = (link: LinkType | any, componentName: string = 'Component'): string => {
  // Safety check
  if (!link) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${componentName}] Link is null or undefined`);
    }
    return '/';
  }

  // Normalize historic shapes: some documents use `linkType: 'link'` with nested internal/external
  const linkType = link.linkType === 'link' ? (link.internalLink ? 'internal' : (link.externalUrl ? 'external' : 'unknown')) : link.linkType

  // Handle external links
  if (linkType === 'external') {
    if (!link.externalUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[${componentName}] External link missing URL - skipping:`, {
          title: link.title,
          _key: link._key
        });
      }
      return '/'; // Safe fallback instead of '#'
    }
    return link.externalUrl;
  }
  
  // Handle internal links
  if (linkType === 'internal') {
    if (!link.internalLink) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[${componentName}] Broken internal link reference - using fallback:`, {
          title: link.title,
          _key: link._key
        });
      }
      return '/';
    }
    
    if (!link.internalLink.slug) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[${componentName}] Internal link missing slug - using fallback:`, {
          title: link.title,
          _key: link._key
        });
      }
      return '/';
    }
    
    // Success - return the slug with leading slash
    return `/${link.internalLink.slug}`;
  }
  
  // Unknown link type - return safe fallback
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[${componentName}] Unknown link type - using fallback:`, {
      linkType: link.linkType,
      title: link.title
    });
  }
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

  // Only log in development and only if there are actual issues
  if (brokenLinks.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(`[${componentName}] Link health check found ${brokenLinks.length} issues:`, {
      total: links.length,
      valid: validCount,
      broken: brokenLinks.length,
      issues: brokenLinks.slice(0, 3) // Show only first 3 issues to avoid log spam
    });
  }

  return {
    total: links.length,
    valid: validCount,
    broken: brokenLinks
  };
};