
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
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsedSeconds);
      
      setTimeLeft(remaining);
      setProgress((remaining / duration) * 100);
      
      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        playBellSound();
        onComplete();
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
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
