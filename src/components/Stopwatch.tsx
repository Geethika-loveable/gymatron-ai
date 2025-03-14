
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/timerUtils';

interface StopwatchProps {
  isWorkoutStarted: boolean;
  initialTime?: number;
  onTimeUpdate?: (time: number) => void;
  isRestoringState?: boolean;
}

const Stopwatch: React.FC<StopwatchProps> = ({ 
  isWorkoutStarted, 
  initialTime = 0,
  onTimeUpdate,
  isRestoringState = false
}) => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const previousIsWorkoutStartedRef = useRef<boolean>(false);

  // Initialize or restore timer
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    console.log(`Initializing stopwatch with initialTime=${initialTime}, isWorkoutStarted=${isWorkoutStarted}, isRestoringState=${isRestoringState}`);
    
    // Set the time to initialTime regardless of workout state
    // This ensures the stopwatch shows the correct time after reload
    setTime(initialTime);
    
    // Calculate the correct start time to maintain stopwatch continuity
    if (initialTime > 0) {
      startTimeRef.current = Date.now() - initialTime;
    }
    
    // Only start the timer if workout is active
    if (isWorkoutStarted && !isRestoringState) {
      startTimer();
    }
    
    isInitializedRef.current = true;
  }, [initialTime, isWorkoutStarted, isRestoringState]);

  // Track workout started changes
  useEffect(() => {
    console.log(`Workout started: ${isWorkoutStarted}, Previous: ${previousIsWorkoutStartedRef.current}, isRestoringState: ${isRestoringState}`);
    
    // Skip this effect during initial state restoration
    if (isRestoringState) return;
    
    // If workout is newly started (transitioning from false to true)
    if (isWorkoutStarted && !previousIsWorkoutStartedRef.current) {
      console.log("Starting a new workout - resetting and starting timer");
      // Reset the timer and start it from 0
      resetTimer();
      startTimeRef.current = Date.now();
      startTimer();
    } 
    // If workout has ended (transitioning from true to false)
    else if (!isWorkoutStarted && previousIsWorkoutStartedRef.current) {
      console.log("Workout ended - pausing timer but preserving time");
      // Stop the timer but don't reset it
      pauseTimer();
    }

    // Update reference for next check
    previousIsWorkoutStartedRef.current = isWorkoutStarted;
  }, [isWorkoutStarted, isRestoringState]);

  // Auto-start when workout begins or when restored state becomes active
  useEffect(() => {
    // Skip during initial restoration
    if (isRestoringState) return;
    
    if (isWorkoutStarted && !isRunning) {
      console.log(`Auto-starting timer, initialTime=${initialTime}, isRunning=${isRunning}`);
      
      if (startTimeRef.current === 0) {
        if (initialTime > 0) {
          startTimeRef.current = Date.now() - initialTime;
        } else {
          startTimeRef.current = Date.now();
        }
      }
      
      startTimer();
    }
  }, [isWorkoutStarted, isRunning, initialTime, isRestoringState]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsRunning(true);
    
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now() - time;
    }
    
    intervalRef.current = window.setInterval(() => {
      const newTime = Date.now() - startTimeRef.current;
      setTime(newTime);
      
      if (onTimeUpdate) {
        onTimeUpdate(newTime);
      }
    }, 10);
    
    console.log("Stopwatch started with interval ID:", intervalRef.current, "startTime:", startTimeRef.current);
  };

  const pauseTimer = () => {
    console.log("Pausing timer, interval ID:", intervalRef.current);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTime(0);
    startTimeRef.current = 0;
    
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      console.log("Stopwatch unmounting, cleaning up interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Debug timer state changes
  useEffect(() => {
    console.log(`Stopwatch time updated: ${formatTime(time)}, isRunning: ${isRunning}`);
  }, [time, isRunning]);

  return (
    <div className="glass-panel p-6 w-full mb-6 animate-fade-in">
      <div className="text-center">
        <div className="text-5xl font-semibold tracking-tight timer-text mb-2 text-gym-900">
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;
