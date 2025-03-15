
import React from 'react';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkoutCompleteNotificationProps {
  isVisible: boolean;
  duration: number;
  onClose: () => void;
}

const WorkoutCompleteNotification: React.FC<WorkoutCompleteNotificationProps> = ({
  isVisible,
  duration,
  onClose
}) => {
  if (!isVisible) return null;
  
  // Format duration in minutes and seconds
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const formattedTime = `${minutes}m ${seconds}s`;
  
  return (
    <div className="fixed bottom-4 left-0 right-0 z-30 px-4 animate-fade-in">
      <div className="relative mx-auto max-w-md overflow-hidden">
        <div className="relative rounded-lg border bg-card p-6 shadow-xl">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 opacity-50" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Content */}
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Workout Complete!
            </h3>
            
            <p className="text-muted-foreground mb-3">
              You crushed your workout in {formattedTime}
            </p>
            
            <div className="w-full bg-muted h-1.5 rounded-full mb-4">
              <div className="bg-primary h-1.5 rounded-full w-full" />
            </div>
            
            <Button
              onClick={onClose}
              className="w-full"
            >
              Awesome! Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCompleteNotification;
