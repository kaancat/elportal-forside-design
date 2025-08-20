'use client'

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
  generateArticleSchema,
  combineSchemas,
  injectJsonLd,
  removeJsonLd,
  BreadcrumbItem,
  FAQItem
} from '@/utils/structuredData';

interface StructuredDataProps {
  pageTitle?: string;
  pageDescription?: string;
  pageType?: 'article' | 'webpage' | 'faq';
  breadcrumbs?: BreadcrumbItem[];
  faqItems?: FAQItem[];
  articleData?: {
    headline: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
    image?: string;
    keywords?: string[];
  };
}

const StructuredData: React.FC<StructuredDataProps> = ({
  pageTitle,
  pageDescription,
  pageType = 'webpage',
  breadcrumbs,
  faqItems,
  articleData
}) => {
  const location = useLocation();
  const baseUrl = 'https://elportal.dk'; // Update with actual domain

  useEffect(() => {
    const schemas: object[] = [];

    // Organization schema (on all pages)
    const organizationSchema = generateOrganizationSchema({
      name: 'DinElportal - Din Elportal',
      url: baseUrl,
      logo: `${baseUrl}/dinelportal-logo.png`,
      description: 'Danmarks førende platform for sammenligning af elpriser og elselskaber. Find den bedste elaftale og spar penge på din elregning.',
      address: {
        addressLocality: 'København',
        postalCode: '1000',
        addressCountry: 'DK'
      },
      contactPoint: {
        telephone: '+45 12 34 56 78', // Update with actual contact
        email: 'kontakt@elportal.dk',
        contactType: 'customer service'
      },
      sameAs: [
        'https://www.facebook.com/elportal',
        'https://www.linkedin.com/company/elportal',
        'https://twitter.com/elportal'
      ]
    });
    schemas.push(organizationSchema);

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Forside', url: baseUrl },
        ...breadcrumbs
      ]);
      schemas.push(breadcrumbSchema);
    } else if (location.pathname !== '/') {
      // Auto-generate breadcrumbs from URL
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const autoBreadcrumbs: BreadcrumbItem[] = [];
      let currentPath = '';
      
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        autoBreadcrumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          url: `${baseUrl}${currentPath}`
        });
      });

      if (autoBreadcrumbs.length > 0) {
        const breadcrumbSchema = generateBreadcrumbSchema([
          { name: 'Forside', url: baseUrl },
          ...autoBreadcrumbs
        ]);
        schemas.push(breadcrumbSchema);
      }
    }

    // Page-specific schema
    const currentUrl = `${baseUrl}${location.pathname}`;
    
    if (pageType === 'article' && articleData) {
      const articleSchema = generateArticleSchema({
        ...articleData,
        description: pageDescription
      });
      schemas.push(articleSchema);
    } else if (pageType === 'faq' && faqItems && faqItems.length > 0) {
      const faqSchema = generateFAQSchema(faqItems);
      schemas.push(faqSchema);
    }

    // WebPage schema (on all pages)
    const webPageSchema = generateWebPageSchema({
      name: pageTitle || 'DinElportal',
      description: pageDescription || 'Sammenlign elpriser og find den bedste elaftale',
      url: currentUrl,
      datePublished: '2024-01-01', // Update with actual date
      dateModified: new Date().toISOString(),
      inLanguage: 'da-DK',
      keywords: [
        'elpriser',
        'elselskaber',
        'elaftale',
        'strømpriser',
        'energipriser',
        'grøn energi',
        'vindstød',
        'spotpris',
        'elforbrug'
      ]
    });
    schemas.push(webPageSchema);

    // Combine all schemas and inject
    const combinedSchema = combineSchemas(...schemas);
    injectJsonLd(combinedSchema, 'main-structured-data');

    // Cleanup on unmount
    return () => {
      removeJsonLd('main-structured-data');
    };
  }, [location, pageTitle, pageDescription, pageType, breadcrumbs, faqItems, articleData]);

  return null; // This component doesn't render anything
};

export default StructuredData;

/**
 * Hook to easily use structured data in pages
 */
export function useStructuredData(props: StructuredDataProps) {
  const location = useLocation();
  
  useEffect(() => {
    // This effect runs when the component using this hook mounts
    // The actual implementation is in the StructuredData component
    return () => {
      // Cleanup if needed
    };
  }, [location, props]);
  
  return <StructuredData {...props} />;
}