/**
 * Structured Data (JSON-LD) Schema Generators
 * Implements schema.org markup for better SEO and rich snippets
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
  sameAs?: string[]; // Social media profiles
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleSchema {
  headline: string;
  description?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string | string[];
  keywords?: string[];
}

export interface LocalBusinessSchema extends OrganizationSchema {
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface WebPageSchema {
  name: string;
  description?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  keywords?: string[];
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(data: OrganizationSchema): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.name,
    "url": data.url,
  };

  if (data.logo) {
    schema.logo = data.logo;
  }

  if (data.description) {
    schema.description = data.description;
  }

  if (data.address) {
    schema.address = {
      "@type": "PostalAddress",
      ...data.address,
      "addressCountry": data.address.addressCountry || "DK"
    };
  }

  if (data.contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      ...data.contactPoint,
      "contactType": data.contactPoint.contactType || "customer service",
      "areaServed": "DK",
      "availableLanguage": ["Danish", "English"]
    };
  }

  if (data.sameAs && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs;
  }

  return schema;
}

/**
 * Generate LocalBusiness schema (extends Organization)
 */
export function generateLocalBusinessSchema(data: LocalBusinessSchema): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": data.url,
    "name": data.name,
    "url": data.url,
  };

  // Add all organization properties
  const orgSchema = generateOrganizationSchema(data);
  Object.assign(schema, orgSchema);

  // Override type
  schema["@type"] = "LocalBusiness";

  if (data.priceRange) {
    schema.priceRange = data.priceRange;
  }

  if (data.openingHours && data.openingHours.length > 0) {
    schema.openingHoursSpecification = data.openingHours.map(hours => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hours,
      "opens": "00:00",
      "closes": "23:59"
    }));
  }

  if (data.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": data.geo.latitude,
      "longitude": data.geo.longitude
    };
  }

  if (data.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": data.aggregateRating.ratingValue,
      "reviewCount": data.aggregateRating.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(data: ArticleSchema): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.headline,
    "inLanguage": "da-DK"
  };

  if (data.description) {
    schema.description = data.description;
  }

  if (data.author) {
    schema.author = {
      "@type": "Person",
      "name": data.author
    };
  }

  if (data.datePublished) {
    schema.datePublished = data.datePublished;
  }

  if (data.dateModified) {
    schema.dateModified = data.dateModified;
  }

  if (data.image) {
    schema.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.keywords && data.keywords.length > 0) {
    schema.keywords = data.keywords.join(", ");
  }

  schema.publisher = {
    "@type": "Organization",
    "name": "ElPortal",
    "url": "https://elportal.dk"
  };

  return schema;
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(data: WebPageSchema): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.name,
    "url": data.url,
    "inLanguage": data.inLanguage || "da-DK",
  };

  if (data.description) {
    schema.description = data.description;
  }

  if (data.datePublished) {
    schema.datePublished = data.datePublished;
  }

  if (data.dateModified) {
    schema.dateModified = data.dateModified;
  }

  if (data.keywords && data.keywords.length > 0) {
    schema.keywords = data.keywords.join(", ");
  }

  // Add breadcrumb reference
  schema.breadcrumb = {
    "@id": "#breadcrumb"
  };

  // Add main entity reference for articles
  schema.mainEntity = {
    "@id": "#main-content"
  };

  return schema;
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(items: FAQItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

/**
 * Generate Energy Utility Company schema (specific for ElPortal)
 */
export function generateEnergyCompanySchema(data: {
  name: string;
  url: string;
  description?: string;
  pricePerKwh?: number;
  greenEnergy?: boolean;
  customerReviews?: number;
  rating?: number;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "EnergySupplier",
    "name": data.name,
    "url": data.url,
    "description": data.description,
    "areaServed": {
      "@type": "Country",
      "name": "Denmark",
      "identifier": "DK"
    },
    "offers": data.pricePerKwh ? {
      "@type": "Offer",
      "priceCurrency": "DKK",
      "price": data.pricePerKwh,
      "unitCode": "KWH",
      "description": "Pris per kWh"
    } : undefined,
    "additionalProperty": data.greenEnergy ? {
      "@type": "PropertyValue",
      "name": "Grøn energi",
      "value": "Ja"
    } : undefined,
    "aggregateRating": data.rating ? {
      "@type": "AggregateRating",
      "ratingValue": data.rating,
      "reviewCount": data.customerReviews || 0,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  };
}

/**
 * Generate Product schema for electricity plans
 */
export function generateElectricityPlanSchema(data: {
  name: string;
  description: string;
  provider: string;
  price: number;
  features?: string[];
  url?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "description": data.description,
    "brand": {
      "@type": "Brand",
      "name": data.provider
    },
    "offers": {
      "@type": "Offer",
      "price": data.price,
      "priceCurrency": "DKK",
      "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "url": data.url || window.location.href
    },
    "additionalProperty": data.features?.map(feature => ({
      "@type": "PropertyValue",
      "name": "Feature",
      "value": feature
    }))
  };
}

/**
 * Combine multiple schemas into a graph
 */
export function combineSchemas(...schemas: object[]): object {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map(schema => {
      // Remove duplicate @context from individual schemas
      const { "@context": _, ...rest } = schema as any;
      return rest;
    })
  };
}

/**
 * Inject JSON-LD script into the document head
 */
export function injectJsonLd(schema: object, id?: string): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  if (id) {
    script.id = `jsonld-${id}`;
    // Remove existing script with same ID
    const existing = document.getElementById(`jsonld-${id}`);
    if (existing) {
      existing.remove();
    }
  }
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

/**
 * Remove JSON-LD script from the document head
 */
export function removeJsonLd(id: string): void {
  const script = document.getElementById(`jsonld-${id}`);
  if (script) {
    script.remove();
  }
}