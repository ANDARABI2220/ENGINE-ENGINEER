import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker with Stale-While-Revalidate caching strategy
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration notice:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
