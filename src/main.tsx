
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mount the React application
createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // The service worker registration is handled by vite-plugin-pwa
    console.log('App loaded, service worker will be registered by vite-plugin-pwa');
  });
}
