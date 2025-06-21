import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SanityService } from '@/services/sanityService';
import { SanityPage } from '@/types/sanity';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContentBlocks from '@/components/ContentBlocks';

const GenericPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<SanityPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SanityService.getPageBySlug(slug);
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
          <ContentBlocks blocks={pageData.contentBlocks} />
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