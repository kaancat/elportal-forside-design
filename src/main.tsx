import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { registerIconCacheServiceWorker } from './utils/registerIconCache'

// Deployment verification
console.log('[ElPortal] App initialized - Build timestamp:', new Date().toISOString());
console.log('[ElPortal] Build version: 2025-07-17-icon-reliability-fix');

// Register icon cache service worker
registerIconCacheServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary level="app">
    <App />
  </ErrorBoundary>
);
