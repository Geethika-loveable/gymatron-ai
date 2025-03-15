
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { isPwaInstallable, setupPwaInstall } from '@/utils/pwaUtils';
import { toast } from "@/components/ui/use-toast";
import { useAnalytics } from '@/hooks/useAnalytics';

const PwaInstallButton: React.FC = () => {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Check if the app is installable on page load
    const initialInstallable = isPwaInstallable();
    setCanInstall(initialInstallable);
    
    // Set up the install prompt handler
    const triggerInstall = setupPwaInstall(
      // When installation becomes available
      () => {
        console.log('Installation is available');
        setCanInstall(true);
      },
      // When installation is accepted
      () => {
        trackEvent('pwa_installed');
        toast({
          title: "App installed",
          description: "GYMA has been added to your home screen",
        });
      }
    );
    
    // Store the trigger function in the component
    (window as any).triggerPwaInstall = triggerInstall;
    
    return () => {
      // Clean up
      delete (window as any).triggerPwaInstall;
    };
  }, [trackEvent]);
  
  // Don't render if installation is not possible
  if (!canInstall) return null;
  
  const handleInstallClick = () => {
    // Track attempt to install
    trackEvent('pwa_install_clicked');
    
    // Trigger the installation
    if ((window as any).triggerPwaInstall) {
      (window as any).triggerPwaInstall();
    }
  };
  
  return (
    <Button 
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download size={16} />
      <span>Install App</span>
    </Button>
  );
};

export default PwaInstallButton;
