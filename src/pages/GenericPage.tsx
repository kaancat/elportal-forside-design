import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SanityService } from '@/services/sanityService';
import { UnifiedPage } from '@/types/sanity';
import UnifiedContentBlocks from '@/components/UnifiedContentBlocks';
import { getSanityImageUrl } from '@/lib/sanityImage';
import StructuredData from '@/components/StructuredData';
import { FAQItem } from '@/utils/structuredData';

const GenericPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<UnifiedPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No page slug provided');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SanityService.getUnifiedPage(slug);
        
        if (!data) {
          setError(`Page "${slug}" not found`);
          setPageData(null);
        } else {
          // Ensure content blocks are properly initialized
          if (data.contentBlocks && !Array.isArray(data.contentBlocks)) {
            console.error('Invalid contentBlocks structure:', data.contentBlocks);
            data.contentBlocks = [];
          }
          setPageData(data);
        }
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page data');
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  // Update page metadata when page data is loaded
  useEffect(() => {
    if (pageData) {
      // Update page title
      document.title = pageData.seoMetaTitle || pageData.title || 'ElPortal'
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription && pageData.seoMetaDescription) {
        metaDescription.setAttribute('content', pageData.seoMetaDescription)
      }

      // Update Open Graph image if available
      if (pageData.ogImage?.asset) {
        const ogImageMeta = document.querySelector('meta[property="og:image"]')
        if (ogImageMeta) {
          const imageUrl = getSanityImageUrl(pageData.ogImage.asset._ref, {
            width: 1200,
            height: 630,
            format: 'jpg'
          })
          ogImageMeta.setAttribute('content', imageUrl)
        }
      }

      // Handle noIndex
      if (pageData.noIndex) {
        const existingRobotsMeta = document.querySelector('meta[name="robots"]')
        if (existingRobotsMeta) {
          existingRobotsMeta.setAttribute('content', 'noindex, nofollow')
        } else {
          const robotsMeta = document.createElement('meta')
          robotsMeta.name = 'robots'
          robotsMeta.content = 'noindex, nofollow'
          document.head.appendChild(robotsMeta)
        }
      } else {
        // Remove noindex if it was previously set
        const existingRobotsMeta = document.querySelector('meta[name="robots"]')
        if (existingRobotsMeta && existingRobotsMeta.getAttribute('content') === 'noindex, nofollow') {
          existingRobotsMeta.remove()
        }
      }
    }
  }, [pageData]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {error.includes('not found') ? '404 - Side ikke fundet' : 'Der opstod en fejl'}
        </h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500 mb-8">
          {error.includes('not found') 
            ? 'Siden du leder efter eksisterer ikke eller er blevet flyttet.' 
            : 'Prøv venligst at genindlæse siden.'}
        </p>
        <Link to="/" className="text-brand-green hover:text-brand-green/80 font-medium">
          Tilbage til forsiden
        </Link>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Intet indhold tilgængeligt</h1>
        <p className="text-gray-600 mb-8">Der er ikke noget indhold at vise på denne side.</p>
        <Link to="/" className="text-brand-green hover:text-brand-green/80 font-medium">
          Tilbage til forsiden
        </Link>
      </div>
    );
  }


  // Extract FAQ items from content blocks if they exist
  const faqItems: FAQItem[] = [];
  if (pageData.contentBlocks && Array.isArray(pageData.contentBlocks)) {
    pageData.contentBlocks.forEach((block: any) => {
      if (block._type === 'faqGroup' && block.items) {
        block.items.forEach((item: any) => {
          if (item.question && item.answer) {
            faqItems.push({
              question: item.question,
              answer: typeof item.answer === 'string' 
                ? item.answer 
                : item.answer?.[0]?.children?.[0]?.text || ''
            });
          }
        });
      }
    });
  }

  // Determine page type based on content
  const pageType = faqItems.length > 0 ? 'faq' : 'webpage';

  return (
    <>
      <StructuredData
        pageTitle={pageData.seoMetaTitle || pageData.title}
        pageDescription={pageData.seoMetaDescription || pageData.description}
        pageType={pageType}
        faqItems={faqItems}
        breadcrumbs={[
          {
            name: pageData.title || slug || 'Side',
            url: `https://elportal.dk/${slug}`
          }
        ]}
      />
      {pageData.contentBlocks && Array.isArray(pageData.contentBlocks) && pageData.contentBlocks.length > 0 ? (
        <UnifiedContentBlocks page={pageData} enableBreadcrumbs={true} />
      ) : (
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {pageData.title || 'Side under opbygning'}
            </h1>
            <p className="text-gray-600 text-lg">
              Denne side er under opbygning. Kom tilbage snart for at se indholdet.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GenericPage; 