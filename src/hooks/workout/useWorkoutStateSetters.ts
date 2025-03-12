
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
    setStopwatchTime(time);
  }, []);

  const startNewWorkout = useCallback(() => {
    setWorkoutStartTime(Date.now());
    setStopwatchTime(0);
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
