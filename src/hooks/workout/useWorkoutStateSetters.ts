
import { useState, useCallback } from 'react';

export const useWorkoutStateSetters = () => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerType, setTimerType] = useState<'set' | 'exercise'>('set');
  const [workoutStartTime, setWorkoutStartTime] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRestoringState, setIsRestoringState] = useState(true);
  const [savedExercises, setSavedExercises] = useState<any[]>([]);
  
  const safeSetShowRestTimer = useCallback((value: boolean) => {
    console.log(`Setting showRestTimer to ${value}`);
    setShowRestTimer(value);
  }, []);
  
  const safeSetTimerType = useCallback((value: 'set' | 'exercise') => {
    console.log(`Setting timerType to ${value}`);
    setTimerType(value);
  }, []);

  const updateStopwatchTime = useCallback((time: number) => {
    console.log(`Updating stopwatch time to ${time}`);
    setStopwatchTime(time);
  }, []);

  const startNewWorkout = useCallback(() => {
    const now = Date.now();
    console.log(`Starting new workout at ${now}`);
    setWorkoutStartTime(now);
    setStopwatchTime(0); // Reset stopwatch time for a new workout
    setIsWorkoutStarted(true);
  }, []);

  return {
    // State
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
    isRestoringState,
    savedExercises,
    
    // Setters
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer: safeSetShowRestTimer,
    setTimerType: safeSetTimerType,
    setIsRestoringState,
    setSavedExercises,
    setWorkoutStartTime,
    setStopwatchTime,
    updateStopwatchTime,
    startNewWorkout
  };
};
