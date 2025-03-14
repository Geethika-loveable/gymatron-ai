
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
  const initialTimeRef = useRef<number>(initialTime);
  const previousIsWorkoutStartedRef = useRef<boolean>(isWorkoutStarted);

  // Initialize timer with initialTime on mount and when initialTime changes
  useEffect(() => {
    console.log(`Initializing stopwatch with initialTime=${initialTime}, isWorkoutStarted=${isWorkoutStarted}`);
    
    // Set the time state and ref to initialTime
    setTime(initialTime);
    initialTimeRef.current = initialTime;
    
    // If stopwatch has time and we're restoring state, set the correct start time
    if (initialTime > 0) {
      startTimeRef.current = Date.now() - initialTime;
      console.log(`Restored startTimeRef to ${startTimeRef.current}`);
    }
  }, [initialTime]);

  // Handle workout state changes
  useEffect(() => {
    console.log(`Workout state changed to: ${isWorkoutStarted}, previous: ${previousIsWorkoutStartedRef.current}, time: ${time}`);
    
    // If workout was just started (and was not active before)
    if (isWorkoutStarted && !previousIsWorkoutStartedRef.current) {
      // Only reset timer if this is a brand new workout (not restoring)
      if (!isRestoringState && initialTimeRef.current === 0) {
        console.log("Starting fresh workout - resetting timer");
        resetTimer();
        startTimeRef.current = Date.now();
      } else {
        console.log(`Continuing workout - using existing time: ${time}ms`);
        // Ensure start time is correctly set based on current time value
        startTimeRef.current = Date.now() - time;
      }
      startTimer();
    } 
    // If workout was just stopped
    else if (!isWorkoutStarted && previousIsWorkoutStartedRef.current) {
      console.log("Workout stopped - pausing timer");
      pauseTimer();
    }

    previousIsWorkoutStartedRef.current = isWorkoutStarted;
  }, [isWorkoutStarted, time, isRestoringState]);

  // Auto-start when workout is active
  useEffect(() => {
    if (isWorkoutStarted && !isRunning) {
      console.log(`Auto-starting timer, time=${time}, isRunning=${isRunning}`);
      
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now() - time;
      }
      
      startTimer();
    }
  }, [isWorkoutStarted, isRunning, time]);

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
