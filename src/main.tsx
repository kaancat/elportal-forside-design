import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

// Deployment verification
console.log('[ElPortal] App initialized - Build timestamp:', new Date().toISOString());
console.log('[ElPortal] Build version: 2025-07-17-declarationgridmix-fix');

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary level="app">
    <App />
  </ErrorBoundary>
);
