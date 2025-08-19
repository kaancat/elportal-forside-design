import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const isSSR = typeof window !== 'undefined' && window.__NEXT_DATA__;
  if (isSSR) {
    // During SSR, hydrate the existing HTML
    ReactDOM.hydrateRoot(container, <App />);
  } else {
    // Normal client-side rendering
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}