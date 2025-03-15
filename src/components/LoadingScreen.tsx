
import React from 'react';
import { RotateCw } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="flex flex-col items-center max-w-xs text-center p-6">
        <div className="h-28 w-28 relative mb-6 overflow-hidden rounded-2xl shadow-lg border border-primary/20">
          <img 
            src="/gyma-icon.jpg" 
            alt="Gyma" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <RotateCw className="h-8 w-8 text-primary animate-spin opacity-70" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">GYMA</h1>
        
        <p className="text-md font-medium text-primary mb-6">
          Save 40% of Gym time, Same workout Results.
        </p>
        
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-100"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-200"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-300"></div>
        </div>
        
        <blockquote className="border-l-2 border-primary/40 pl-3 italic text-sm text-muted-foreground">
          "Discipline Works Miracles"
        </blockquote>
      </div>
    </div>
  );
};

export default LoadingScreen;
