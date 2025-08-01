import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContentBlocks from '@/components/ContentBlocks';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorTestComponent from '@/components/ErrorTestComponent';
import { ApiErrorFallback } from '@/components/ErrorFallbacks';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { SanityService } from '@/services/sanityService';
import { HomePage } from '@/types/sanity';
import { getSanityImageUrl } from '@/lib/sanityImage';

const Index = () => {
  const [homepageData, setHomepageData] = useState<HomePage | null>(null)
  const [loading, setLoading] = useState(true)
  const { errorState, clearError, withApiErrorHandling } = useApiErrorHandler()

  useEffect(() => {
    const fetchHomepageData = withApiErrorHandling(async () => {
      const data = await SanityService.getHomePage()
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
      <div className="min-h-screen bg-white">
        <ErrorBoundary level="component">
          <Navigation />
        </ErrorBoundary>
        <main>
          <ApiErrorFallback 
            onRetry={() => {
              clearError()
              window.location.reload()
            }}
            message="Kunne ikke indlæse forsiden"
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary level="component">
        <Navigation />
      </ErrorBoundary>
      
      <main>
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
        
        {/* Render Sanity content blocks with error boundaries */}
        {!loading && homepageData?.contentBlocks && homepageData.contentBlocks.length > 0 && (
          <ContentBlocks blocks={homepageData.contentBlocks} enableErrorBoundaries={true} />
        )}
        
        {/* No content fallback */}
        {!loading && (!homepageData?.contentBlocks || homepageData.contentBlocks.length === 0) && (
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-gray-600">Intet indhold tilgængeligt.</p>
          </div>
        )}
      </main>
      
      <ErrorBoundary level="component">
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
