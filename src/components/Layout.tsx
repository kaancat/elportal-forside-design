import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ReadingProgress from '@/components/ReadingProgress';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Persistent layout component following Sanity/Next.js best practices
 * Prevents navigation remounting on route changes
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { showReadingProgress } = useReadingProgress();
  
  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary level="component">
        <Navigation />
      </ErrorBoundary>
      
      {/* Reading Progress Indicator */}
      {showReadingProgress && (
        <ReadingProgress />
      )}
      
      <main>
        {children}
      </main>
      
      <ErrorBoundary level="component">
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default Layout;