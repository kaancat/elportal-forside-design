import React, { useEffect, useState } from 'react';
import UnifiedContentBlocks from '@/components/UnifiedContentBlocks';
import ErrorTestComponent from '@/components/ErrorTestComponent';
import { ApiErrorFallback } from '@/components/ErrorFallbacks';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { SanityService } from '@/services/sanityService';
import { UnifiedPage } from '@/types/sanity';
import { getSanityImageUrl } from '@/lib/sanityImage';
import StructuredData from '@/components/StructuredData';
import { FAQItem } from '@/utils/structuredData';

const Index = () => {
  const [homepageData, setHomepageData] = useState<UnifiedPage | null>(null)
  const [loading, setLoading] = useState(true)
  const { errorState, clearError, withApiErrorHandling } = useApiErrorHandler()

  useEffect(() => {
    const fetchHomepageData = withApiErrorHandling(async () => {
      const data = await SanityService.getUnifiedHomePage()
      
      // Ensure content blocks are properly initialized
      if (data) {
        if (data.contentBlocks && !Array.isArray(data.contentBlocks)) {
          console.error('Invalid contentBlocks structure:', data.contentBlocks);
          data.contentBlocks = [];
        }
      }
      
      setHomepageData(data)
      setLoading(false)
    }, 'homepage-data')

    fetchHomepageData()
  }, [withApiErrorHandling])


  // Update page title and meta description if Sanity data is available
  useEffect(() => {
    if (homepageData) {
      document.title = homepageData.seoMetaTitle || 'Sammenlign Elpriser - Find Billigste Elaftale'
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription && homepageData.seoMetaDescription) {
        metaDescription.setAttribute('content', homepageData.seoMetaDescription)
      }

      // Update Open Graph image if available
      if (homepageData.ogImage?.asset) {
        const ogImageMeta = document.querySelector('meta[property="og:image"]')
        if (ogImageMeta) {
          // Construct Sanity image URL with proper dimensions for Open Graph
          const imageUrl = getSanityImageUrl(homepageData.ogImage.asset._ref, {
            width: 1200,
            height: 630,
            format: 'jpg'
          })
          ogImageMeta.setAttribute('content', imageUrl)
        }
      }

      // Handle noIndex
      if (homepageData.noIndex) {
        const existingRobotsMeta = document.querySelector('meta[name="robots"]')
        if (existingRobotsMeta) {
          existingRobotsMeta.setAttribute('content', 'noindex, nofollow')
        } else {
          const robotsMeta = document.createElement('meta')
          robotsMeta.name = 'robots'
          robotsMeta.content = 'noindex, nofollow'
          document.head.appendChild(robotsMeta)
        }
      }
    }
  }, [homepageData])

  // Show API error if there's an error state
  if (errorState.hasError && !loading) {
    return (
      <ApiErrorFallback 
        onRetry={() => {
          clearError()
          window.location.reload()
        }}
        message="Kunne ikke indlæse forsiden"
      />
    )
  }

  // Extract FAQ items from content blocks if they exist
  const faqItems: FAQItem[] = [];
  if (homepageData?.contentBlocks && Array.isArray(homepageData.contentBlocks)) {
    homepageData.contentBlocks.forEach((block: any) => {
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

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData
        pageTitle={homepageData?.seoMetaTitle || 'Sammenlign Elpriser - Find Billigste Elaftale'}
        pageDescription={homepageData?.seoMetaDescription || 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.'}
        pageType={faqItems.length > 0 ? 'faq' : 'webpage'}
        faqItems={faqItems}
      />
      
      {/* Error Test Component - only in development */}
      <ErrorTestComponent />
      
      {/* Loading state */}
      {loading && (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      )}
      
      {/* Render Sanity content blocks with unified wrapper */}
      {!loading && homepageData && homepageData.contentBlocks && Array.isArray(homepageData.contentBlocks) && homepageData.contentBlocks.length > 0 && (
        <UnifiedContentBlocks page={homepageData} enableBreadcrumbs={false} />
      )}
      
      {/* No content fallback */}
      {!loading && (!homepageData || !homepageData.contentBlocks || !Array.isArray(homepageData.contentBlocks) || homepageData.contentBlocks.length === 0) && (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Intet indhold tilgængeligt.</p>
        </div>
      )}
    </>
  );
};

export default Index;
