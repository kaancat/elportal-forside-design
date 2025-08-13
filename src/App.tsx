
import React, { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import { useSiteMetadata } from "@/hooks/useSiteMetadata";
import ScrollToTop from "@/components/ScrollToTop";
import { initWebVitals, observePerformance } from "@/utils/webVitals";
import CanonicalUrl from "@/components/CanonicalUrl";
import { ReadingProgressProvider } from "@/contexts/ReadingProgressContext";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const GenericPage = lazy(() => import("./pages/GenericPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EnergyTips = lazy(() => import("./pages/EnergyTips").then(m => ({ default: m.EnergyTips })));
const IconTest = lazy(() => import("./pages/IconTest"));
const TestEloverblik = lazy(() => import("./pages/TestEloverblik").then(m => ({ default: m.TestEloverblik })));
const TestTracking = lazy(() => import("./pages/TestTracking"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AdminWrapper = lazy(() => import("./pages/admin/AdminWrapper"));
const SimpleAdmin = lazy(() => import("./pages/admin/SimpleAdmin"));
const AdminV2 = lazy(() => import("./pages/admin/AdminV2"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on certain error types
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Add gcTime to prevent garbage collection too early
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent = () => {
  // Initialize site metadata (favicon, title, etc.)
  useSiteMetadata();
  
  // Initialize Core Web Vitals monitoring
  useEffect(() => {
    initWebVitals();
    observePerformance();
  }, []);
  
  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen w-full">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <CanonicalUrl />
          <ErrorBoundary level="page">
            <ReadingProgressProvider>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="/energispareraad" element={<EnergyTips />} />
                    <Route path="/icon-test" element={<IconTest />} />
                    <Route path="/test-eloverblik" element={<TestEloverblik />} />
                    <Route path="/test-tracking" element={<TestTracking />} />
                    <Route path="/privatlivspolitik" element={<PrivacyPolicy />} />
                    <Route path="/admin/dashboard" element={<AdminWrapper />} />
                    <Route path="/admin/simple" element={<SimpleAdmin />} />
                    <Route path="/admin/v2" element={<AdminV2 />} />
                    
                    {/* Dynamic route for generic pages - must be before the 404 catch-all */}
                    <Route path="/:slug" element={<GenericPage />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ReadingProgressProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary level="app">
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
