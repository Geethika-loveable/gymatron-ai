
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const endTimeRef = useRef<number>(0);
  
  // For debugging
  const [debug, setDebug] = useState({ start: 0, current: 0, elapsed: 0 });

  // Effect to initialize and start the timer
  useEffect(() => {
    console.log(`Timer starting with duration: ${duration} seconds`);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Initialize timer state
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + (duration * 1000);
    setTimeLeft(duration);
    setProgress(100);
    
    // Set up interval that ticks every 100ms for smoother updates
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTimeRef.current - now);
      const elapsedMs = now - startTimeRef.current;
      const elapsedSeconds = elapsedMs / 1000;
      const remainingSeconds = Math.ceil(remaining / 1000); // Use ceil to avoid jumping to 0 too early
      const progressValue = (remainingSeconds / duration) * 100;
      
      // Update debug info
      setDebug({
        start: startTimeRef.current,
        current: now,
        elapsed: elapsedSeconds
      });
      
      console.log(`Timer update: ${remainingSeconds}s left, progress: ${progressValue}%`);
      
      // Update the UI
      setTimeLeft(remainingSeconds);
      setProgress(progressValue);
      
      // Check if timer is complete
      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        playBellSound();
        onComplete();
      }
    }, 100);
    
    // Cleanup function
    return () => {
      console.log('Timer cleanup');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duration, onComplete]); // Re-run effect if duration or onComplete changes
  
  // For debugging purposes - this will be visible in the DOM
  const debugInfo = (
    <div className="hidden">
      start: {debug.start}, current: {debug.current}, elapsed: {debug.elapsed.toFixed(1)}s
    </div>
  );

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-fade-in">
      <h3 className="text-center font-medium text-gym-600 mb-2">
        {label}
      </h3>
      
      <div className="text-4xl font-semibold text-center mb-4 text-primary timer-text">
        {formatRestTime(timeLeft)}
      </div>
      
      <Progress value={progress} className="h-2 bg-gray-200" />
      
      {debugInfo}
    </div>
  );
};

export default RestTimer;
