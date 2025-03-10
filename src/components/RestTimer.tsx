
import React, { useState, useEffect, useRef, useId } from 'react';
import { formatRestTime } from '../utils/timerUtils';
import { playBellSound } from '../utils/soundUtils';
import { Progress } from "@/components/ui/progress";
import { TimerManager } from '../utils/TimerManager';

interface RestTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  label: string;
  // Add a key prop to ensure proper component mounting/unmounting
  timerKey?: string;
}

const RestTimer: React.FC<RestTimerProps> = ({ 
  duration, 
  onComplete, 
  label,
  timerKey 
}) => {
  // Generate a stable ID for this timer instance
  const id = useId();
  const timerId = useRef(`rest-timer-${timerKey || id}`);
  
  // State variables for UI updates only
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [progress, setProgress] = useState<number>(100);
  
  // Flag to track if timer was started
  const timerStartedRef = useRef(false);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    timerId: timerId.current,
    startedAt: new Date().toISOString(),
    renderCount: 0
  });
  
  // Increment render count on each render
  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1
    }));
  });
  
  // Handle timer setup and cleanup
  useEffect(() => {
    console.log(`RestTimer: Component mounted with duration ${duration}s, timerId: ${timerId.current}`);
    
    // Start the timer if not already running
    if (!timerStartedRef.current) {
      console.log(`RestTimer: Starting timer ${timerId.current}`);
      timerStartedRef.current = true;
      
      // Start timer with TimerManager
      TimerManager.startTimer(
        timerId.current,
        duration,
        // onTick callback - updates UI
        (remainingTime, progressValue) => {
          setTimeLeft(remainingTime);
          setProgress(progressValue);
        },
        // onComplete callback
        () => {
          console.log(`RestTimer: Timer completed, playing sound and calling onComplete`);
          playBellSound();
          onComplete();
        }
      );
    }
    
    // Cleanup function
    return () => {
      console.log(`RestTimer: Component unmounting, timerId: ${timerId.current}`);
      // We don't stop the timer here because we want it to persist through re-renders
      // It will be cleaned up if a new timer with the same ID is started
    };
  }, [duration, onComplete]);
  
  // Force debug display for monitoring
  const debugDisplay = (
    <div className="text-xs text-gray-400 mt-2 text-center">
      <div>Timer ID: {debugInfo.timerId}</div>
      <div>Started: {debugInfo.startedAt}</div>
      <div>Render count: {debugInfo.renderCount}</div>
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
      
      {process.env.NODE_ENV !== 'production' && debugDisplay}
    </div>
  );
};

export default React.memo(RestTimer);
