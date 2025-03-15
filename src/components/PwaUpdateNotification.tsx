
import React, { useState, useEffect } from 'react';
import { setupPwaUpdates } from '@/utils/pwaUtils';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const PwaUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  
  useEffect(() => {
    // Set up update detection
    setupPwaUpdates(() => {
      console.log('Update available, showing notification');
      setUpdateAvailable(true);
    });
  }, []);
  
  // Don't render anything if no update is available
  if (!updateAvailable) return null;
  
  const handleUpdateClick = () => {
    // Reload the page to apply the update
    window.location.reload();
  };
  
  return (
    <Alert className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 shadow-lg animate-fade-in">
      <AlertTitle className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        App Update Available
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">A new version of GYMA is available. Refresh to update the app with the latest features and fixes.</p>
        <Button 
          onClick={handleUpdateClick}
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Update Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default PwaUpdateNotification;
