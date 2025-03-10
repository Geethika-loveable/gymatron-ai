
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/timerUtils';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from 'lucide-react';

interface StopwatchProps {
  isWorkoutStarted: boolean;
  onTimeUpdate?: (time: number) => void;
  initialTime?: number;
}

const Stopwatch: React.FC<StopwatchProps> = ({ 
  isWorkoutStarted, 
  onTimeUpdate,
  initialTime = 0
}) => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now() - initialTime);

  // Initialize with initialTime
  useEffect(() => {
    setTime(initialTime);
    startTimeRef.current = Date.now() - initialTime;
  }, [initialTime]);

  // Auto-start when workout begins
  useEffect(() => {
    if (isWorkoutStarted && !isRunning) {
      startTimer();
    }
  }, [isWorkoutStarted]);

  // Report time updates to parent
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }, [time, onTimeUpdate]);

  const startTimer = () => {
    setIsRunning(true);
    // Use the current startTimeRef which may have been adjusted for initialTime
    
    intervalRef.current = window.setInterval(() => {
      const currentTime = Date.now() - startTimeRef.current;
      setTime(currentTime);
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
    startTimeRef.current = Date.now();
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
            >
              <Play size={20} />
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              variant="outline" 
              size="sm" 
              className="rounded-full h-12 w-12 p-0 shadow-md"
            >
              <Pause size={20} />
            </Button>
          )}
          
          <Button 
            onClick={resetTimer} 
            variant="outline" 
            size="sm" 
            className="rounded-full h-12 w-12 p-0 shadow-md text-muted-foreground"
          >
            <RotateCcw size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;
