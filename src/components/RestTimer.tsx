
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
  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  // Setup and start the timer when the component mounts
  useEffect(() => {
    // Initialize timer state
    setTimeLeft(duration);
    setProgress(100);
    completedRef.current = false;
    
    // Calculate the exact end time
    const now = Date.now();
    endTimeRef.current = now + (duration * 1000);
    
    // Clear any existing interval
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Start a new timer that checks the remaining time every 100ms
    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      const remaining = Math.max(0, Math.floor((endTimeRef.current - currentTime) / 1000));
      
      setTimeLeft(remaining);
      setProgress((remaining / duration) * 100);
      
      // Check if timer has completed
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        playBellSound();
        
        // Clean up interval before calling onComplete to prevent any race conditions
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        onComplete();
      }
    }, 100);
    
    timerRef.current = interval;
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
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
