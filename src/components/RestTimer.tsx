
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
  const instanceId = useId();
  const timerId = useRef(`rest-timer-${timerKey || instanceId}`);
  
  // State variables for UI updates only
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [progress, setProgress] = useState<number>(100);
  
  // Flag to track if timer was started
  const timerStartedRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    timerId: timerId.current,
    startedAt: new Date().toISOString(),
    renderCount: 0,
    duration
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
    
    // Mark as mounted
    mountedRef.current = true;
    
    // Ensure we have the current timerId if timerKey changes
    timerId.current = `rest-timer-${timerKey || instanceId}`;
    
    // Start the timer if not already running
    if (!timerStartedRef.current) {
      console.log(`RestTimer: Starting timer ${timerId.current}, duration: ${duration}s`);
      timerStartedRef.current = true;
      
      // Start timer with TimerManager
      TimerManager.startTimer(
        timerId.current,
        duration,
        // onTick callback - updates UI only if component is still mounted
        (remainingTime, progressValue) => {
          if (mountedRef.current) {
            setTimeLeft(remainingTime);
            setProgress(progressValue);
          }
        },
        // onComplete callback
        () => {
          console.log(`RestTimer: Timer completed, playing sound and calling onComplete`);
          playBellSound();
          
          // Small delay to avoid state update conflicts
          setTimeout(() => {
            if (mountedRef.current) {
              onComplete();
            }
          }, 50);
        }
      );
    }
    
    // Cleanup function
    return () => {
      console.log(`RestTimer: Component unmounting, timerId: ${timerId.current}`);
      mountedRef.current = false;
      // We don't stop the timer here to allow it to continue running if needed
      // The TimerManager will handle cleanup when a new timer with the same ID is started
    };
  }, [duration, onComplete, instanceId, timerKey]);
  
  // Debug display
  const debugDisplay = (
    <div className="text-xs text-gray-400 mt-2 text-center">
      <div>Timer ID: {debugInfo.timerId}</div>
      <div>Duration: {debugInfo.duration}s</div>
      <div>Started: {debugInfo.startedAt}</div>
      <div>Render count: {debugInfo.renderCount}</div>
    </div>
  );

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full animate-fade-in">
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
