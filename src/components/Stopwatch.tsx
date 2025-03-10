
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/timerUtils';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from 'lucide-react';

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

  // Initialize or restore timer
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    if (initialTime > 0 && isWorkoutStarted && !isRestoringState) {
      startTimeRef.current = Date.now() - initialTime;
      setTime(initialTime);
      startTimer();
    }
    
    isInitializedRef.current = true;
  }, [initialTime, isWorkoutStarted, isRestoringState]);

  // Auto-start when workout begins or when restored
  useEffect(() => {
    if (isWorkoutStarted && !isRunning && !isRestoringState) {
      if (initialTime > 0) {
        startTimeRef.current = Date.now() - initialTime;
      } else {
        startTimeRef.current = Date.now();
      }
      startTimer();
    }
  }, [isWorkoutStarted, isRunning, initialTime, isRestoringState]);

  const startTimer = () => {
    if (intervalRef.current) return; // Prevent multiple intervals
    
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
  };

  const pauseTimer = () => {
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-fade-in">
      <div className="text-center">
        <div className="text-5xl font-semibold tracking-tight timer-text mb-4 text-gym-900">
          {formatTime(time)}
        </div>
        
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button 
              onClick={startTimer} 
              variant="default" 
              size="sm" 
              className="rounded-full h-12 w-12 p-0 shadow-md"
              disabled={isRestoringState}
            >
              <Play size={20} />
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              variant="outline" 
              size="sm" 
              className="rounded-full h-12 w-12 p-0 shadow-md"
              disabled={isRestoringState}
            >
              <Pause size={20} />
            </Button>
          )}
          
          <Button 
            onClick={resetTimer} 
            variant="outline" 
            size="sm" 
            className="rounded-full h-12 w-12 p-0 shadow-md text-muted-foreground"
            disabled={isRestoringState}
          >
            <RotateCcw size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;
