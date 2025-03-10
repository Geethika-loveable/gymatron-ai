
import React, { useState, useEffect, useRef } from 'react';
import { formatRestTime } from '../utils/timerUtils';
import { playBellSound } from '../utils/soundUtils';
import { Progress } from "@/components/ui/progress";

interface RestTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  label: string;
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete, label }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [progress, setProgress] = useState<number>(100);
  
  const endTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const completedRef = useRef<boolean>(false);

  // Setup and start the timer when the component mounts
  useEffect(() => {
    console.log("RestTimer mounted with duration:", duration);
    
    // Initialize timer state
    setTimeLeft(duration);
    setProgress(100);
    completedRef.current = false;
    
    // Calculate the exact end time
    const now = performance.now();
    endTimeRef.current = now + (duration * 1000);
    
    // Define the animation frame callback
    const updateTimer = (timestamp: number) => {
      if (!endTimeRef.current) return;
      
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - timestamp) / 1000));
      const newProgress = (remaining / duration) * 100;
      
      setTimeLeft(remaining);
      setProgress(newProgress);
      
      // Check if timer has completed
      if (remaining <= 0 && !completedRef.current) {
        console.log("Timer complete!");
        completedRef.current = true;
        playBellSound();
        
        if (typeof onComplete === 'function') {
          onComplete();
        }
        return; // Stop requesting animation frames
      }
      
      // Continue the animation
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateTimer);
    
    // Cleanup on unmount
    return () => {
      console.log("RestTimer unmounting, cleaning up");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [duration, onComplete]);

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-fade-in">
      <h3 className="text-center font-medium text-gym-600 mb-2">
        {label}
      </h3>
      
      <div className="text-4xl font-semibold text-center mb-4 text-primary timer-text">
        {formatRestTime(timeLeft)}
      </div>
      
      <Progress value={progress} className="h-2 bg-gray-200" />
    </div>
  );
};

export default RestTimer;
