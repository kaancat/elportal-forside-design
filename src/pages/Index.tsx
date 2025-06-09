import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import InfoSection from '@/components/InfoSection';
import Footer from '@/components/Footer';
import ContentBlocks from '@/components/ContentBlocks';
import { SanityService } from '@/services/sanityService';
import { HomePage } from '@/types/sanity';

const Index = () => {
  const [homepageData, setHomepageData] = useState<HomePage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const data = await SanityService.getHomePage()
        console.log('Homepage Data fetched from Sanity:', data)
        setHomepageData(data)
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  // Debug log when homepageData changes
  useEffect(() => {
    if (homepageData) {
      console.log('Homepage Data state updated:', homepageData)
      console.log('Content blocks from homepage data:', homepageData.contentBlocks)
    }
  }, [homepageData])

  // Update page title and meta description if Sanity data is available
  useEffect(() => {
    if (homepageData) {
      document.title = homepageData.seoMetaTitle || 'Sammenlign Elpriser - Find Billigste Elaftale'
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription && homepageData.seoMetaDescription) {
        metaDescription.setAttribute('content', homepageData.seoMetaDescription)
      }
    }
  }, [homepageData])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="space-y-8">
        <HeroSection />
        <InfoSection />
        
        {/* Render Sanity content blocks with reduced spacing */}
        {!loading && homepageData?.contentBlocks && homepageData.contentBlocks.length > 0 && (
          <ContentBlocks blocks={homepageData.contentBlocks} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
