import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { reportWebVitals } from './utils/reportWebVitals'

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      // Silently fail - PWA is optional
      console.log('Service Worker registration failed:', error);
    });
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Start measuring performance (non-blocking)
if (import.meta.env.PROD) {
  setTimeout(() => {
    reportWebVitals();
  }, 0);
}
