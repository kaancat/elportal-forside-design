import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SanityService } from '@/services/sanityService';
import { UnifiedPage } from '@/types/sanity';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import UnifiedContentBlocks from '@/components/UnifiedContentBlocks';
import { getSanityImageUrl } from '@/lib/sanityImage';

const GenericPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<UnifiedPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SanityService.getUnifiedPage(slug);
        setPageData(data);
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError('Failed to load page data');
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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto py-12 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <a href="/" className="text-brand-green hover:text-brand-green/80 font-medium">
            Return to Home
          </a>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        {pageData.contentBlocks && pageData.contentBlocks.length > 0 ? (
          <UnifiedContentBlocks page={pageData} enableBreadcrumbs={true} />
        ) : (
          <div className="container mx-auto py-12 px-4">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600">
                No content blocks available for this page.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GenericPage; 