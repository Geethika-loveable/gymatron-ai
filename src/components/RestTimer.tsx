
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
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Reset the timer when the component mounts or when duration changes
    setTimeLeft(duration);
    setProgress(100);
    startTimeRef.current = Date.now();

    // Update function for the timer
    const updateTimer = () => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = elapsedMs / 1000;
      const newTimeLeft = Math.max(0, duration - Math.floor(elapsedSeconds));
      const newProgress = (newTimeLeft / duration) * 100;
      
      setTimeLeft(newTimeLeft);
      setProgress(newProgress);
      
      if (newTimeLeft <= 0) {
        // Timer is complete
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        playBellSound();
        onComplete();
      } else {
        // Continue the timer
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };
    
    // Start the timer
    animationFrameRef.current = requestAnimationFrame(updateTimer);
    
    // Cleanup on unmount or when duration changes
    return () => {
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
