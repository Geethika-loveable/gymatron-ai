
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RocketIcon } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  const { trackEvent, initializeSession } = useAnalytics();
  
  useEffect(() => {
    if (isOpen) {
      // Track that this is the user's first visit
      initializeSession(true);
      trackEvent('welcome_popup_shown');
    }
  }, [isOpen, trackEvent, initializeSession]);
  
  const handleClosePopup = () => {
    trackEvent('welcome_popup_closed');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClosePopup()}>
      <DialogContent className="sm:max-w-md px-6 py-8 rounded-xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <RocketIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground">
            Welcome to GYMA App
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Train Smarter Finish Faster.
          </p>
          
          <div className="space-y-3 text-sm text-muted-foreground mt-3">
            <p>
              Add your Exercises & Start. Once you complete sets, tap "Complete Set". 
              This will give you 30 seconds to rest between sets.
            </p>
            <p>
              By following up, you can save time by up to 40% while achieving better results. 
              Ready to start training?
            </p>
            
            <p className="text-xs pt-2">
              Please read our <Link to="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link> to 
              understand what & how we collect user data to get feedback & improve. 
              By continuing you are agreeing to our privacy policy. We don't ever sell user data.
            </p>
          </div>
        </div>
        
        <DialogFooter className="mt-6 sm:justify-center">
          <Button onClick={handleClosePopup} className="w-full sm:w-auto gap-2">
            <span>Let's Rock!</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
