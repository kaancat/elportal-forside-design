
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import GenericPage from "./pages/GenericPage";
import NotFound from "./pages/NotFound";
import { EnergyTips } from "./pages/EnergyTips";
import IconTest from "./pages/IconTest";
import { useSiteMetadata } from "@/hooks/useSiteMetadata";

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
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent = () => {
  // Initialize site metadata (favicon, title, etc.)
  useSiteMetadata();
  
  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen w-full">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary level="page">
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/energispareraad" element={<EnergyTips />} />
              <Route path="/icon-test" element={<IconTest />} />
              
              {/* Dynamic route for generic pages - must be before the 404 catch-all */}
              <Route path="/:slug" element={<GenericPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
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
