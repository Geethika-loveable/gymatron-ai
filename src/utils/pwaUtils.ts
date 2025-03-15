
// PWA installation and update utilities

// Check if the app can be installed (not already installed and not iOS in-browser)
export const isPwaInstallable = (): boolean => {
  // @ts-ignore: beforeinstallprompt is not in the standard
  const isInstallPromptSupported = 'onbeforeinstallprompt' in window;
  
  // iOS devices can't show install prompt, but can add to home screen manually
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Check if already installed (display-mode: standalone)
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                            (navigator.standalone === true);
  
  return isInstallPromptSupported && !isInStandaloneMode && !isIOS;
};

// Register event listener for install prompt and return a function to trigger it
export const setupPwaInstall = (
  onCanInstall: () => void, 
  onInstallAccepted: () => void
): (() => void) => {
  // Store the deferred prompt for later use
  let deferredPrompt: any = null;
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Signal that installation is possible
    onCanInstall();
  });
  
  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    // Clear the deferred prompt
    deferredPrompt = null;
    
    // Track successful installation
    if (window.analytics) {
      window.analytics.trackEvent('pwa_installed');
    }
    
    console.log('PWA was installed');
  });
  
  // Return function to trigger install prompt
  return () => {
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return;
    }
    
    // Show installation prompt
    deferredPrompt.prompt();
    
    // Wait for user decision
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstallAccepted();
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the prompt reference
      deferredPrompt = null;
    });
  };
};

// Detect updates for the PWA
export const setupPwaUpdates = (onUpdateAvailable: () => void): void => {
  // Only run in production mode
  if (process.env.NODE_ENV !== 'production') return;
  
  // Check if service worker is supported
  if ('serviceWorker' in navigator) {
    // When a new service worker is waiting
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker controller, app updated');
    });
    
    // Custom update detection (specific to vite-plugin-pwa)
    const cb = () => {
      const event = new Event('pwa-update');
      window.dispatchEvent(event);
    };
    
    window.addEventListener('pwa-update', () => {
      onUpdateAvailable();
    });
    
    // Get PWA registration exposed by vite-plugin-pwa
    // @ts-ignore: The registerSW function is added by the PWA plugin
    if (import.meta.env.PROD && typeof window.__vite_plugin_pwa !== 'undefined') {
      // @ts-ignore: The registerSW function is added by the PWA plugin
      window.__vite_plugin_pwa.registerSW({ immediate: true, onRegistered(r: any) {
        console.log('Service worker registered');
      }, onNeedRefresh() {
        console.log('New content available, refresh needed');
        onUpdateAvailable();
      }});
    }
  }
};
