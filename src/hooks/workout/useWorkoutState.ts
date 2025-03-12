import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { useLocalWorkoutPersistence } from './useLocalWorkoutPersistence';

export interface WorkoutState {
  isWorkoutStarted: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  showRestTimer: boolean;
  timerType: 'set' | 'exercise';
}

export interface WorkoutStateWithTime extends WorkoutState {
  workoutStartTime: number;
  stopwatchTime: number;
}

export const useWorkoutState = (exercises: Exercise[]) => {
  const stateRef = useRef({
    isWorkoutStarted: false,
    currentExerciseIndex: 0,
    currentSet: 0,
    showRestTimer: false,
    timerType: 'set' as const,
    workoutStartTime: 0,
    stopwatchTime: 0,
  });
  
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerType, setTimerType] = useState<'set' | 'exercise'>('set');
  const [workoutStartTime, setWorkoutStartTime] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRestoringState, setIsRestoringState] = useState(true);
  const [savedExercises, setSavedExercises] = useState<Exercise[]>([]);
  
  const { 
    saveWorkoutState, 
    loadWorkoutState, 
    clearWorkoutState,
    isInitialized 
  } = useLocalWorkoutPersistence();

  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    stateRef.current = {
      isWorkoutStarted,
      currentExerciseIndex,
      currentSet,
      showRestTimer,
      timerType,
      workoutStartTime,
      stopwatchTime,
    };
    
    console.log("Workout state updated:", {
      isWorkoutStarted,
      currentExerciseIndex, 
      currentSet,
      showRestTimer,
      timerType
    });
    
  }, [
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
  ]);

  const safeSetShowRestTimer = useCallback((value: boolean) => {
    console.log(`Setting showRestTimer to ${value}`);
    setShowRestTimer(value);
  }, []);
  
  const safeSetTimerType = useCallback((value: 'set' | 'exercise') => {
    console.log(`Setting timerType to ${value}`);
    setTimerType(value);
  }, []);

  const throttledSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    if (timeSinceLastSave < 2000) {
      saveTimeoutRef.current = setTimeout(() => {
        saveState();
        saveTimeoutRef.current = null;
      }, 2000 - timeSinceLastSave);
      return;
    }
    
    saveState();
  }, []);

  const saveState = useCallback(() => {
    if (!isInitialized || isRestoringState || !stateRef.current.isWorkoutStarted) return;
    
    const stateToSave = {
      ...stateRef.current,
      exercises: exercises.length > 0 ? exercises : savedExercises,
      lastSavedAt: Date.now()
    };
    
    saveWorkoutState(stateToSave);
    lastSaveTimeRef.current = Date.now();
  }, [isInitialized, isRestoringState, exercises, savedExercises, saveWorkoutState]);

  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    if (isWorkoutStarted) {
      throttledSave();
    }
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted, 
    currentExerciseIndex, 
    currentSet, 
    showRestTimer,
    throttledSave
  ]);

  useEffect(() => {
    if (!isWorkoutStarted || !isInitialized || isRestoringState) return;
    
    const saveInterval = setInterval(() => {
      saveState();
    }, 10000);
    
    return () => clearInterval(saveInterval);
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted,
    saveState
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const savedState = loadWorkoutState();
      
      if (savedState && savedState.isWorkoutStarted) {
        console.log('Restoring workout state:', savedState);
        
        setWorkoutStartTime(savedState.workoutStartTime);
        setStopwatchTime(savedState.stopwatchTime);
        setCurrentExerciseIndex(savedState.currentExerciseIndex);
        setCurrentSet(savedState.currentSet);
        safeSetTimerType(savedState.timerType);
        
        setTimeout(() => {
          safeSetShowRestTimer(savedState.showRestTimer);
          setIsWorkoutStarted(savedState.isWorkoutStarted);
        }, 100);
        
        if (savedState.exercises && savedState.exercises.length > 0) {
          setSavedExercises(savedState.exercises);
        }
      }
    } catch (error) {
      console.error('Error restoring workout state:', error);
    } finally {
      setTimeout(() => {
        setIsRestoringState(false);
      }, 200);
    }
  }, [isInitialized, loadWorkoutState, safeSetShowRestTimer, safeSetTimerType]);

  const updateStopwatchTime = useCallback((time: number) => {
    setStopwatchTime(time);
  }, []);

  const startNewWorkout = useCallback(() => {
    setWorkoutStartTime(Date.now());
    setStopwatchTime(0);
    setIsWorkoutStarted(true);
  }, []);

  const resetWorkoutState = useCallback(() => {
    safeSetShowRestTimer(false);
    
    setTimeout(() => {
      setIsWorkoutStarted(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(0);
      safeSetTimerType('set');
      setWorkoutStartTime(0);
      setStopwatchTime(0);
      setSavedExercises([]);
      clearWorkoutState();
    }, 50);
  }, [clearWorkoutState, safeSetShowRestTimer, safeSetTimerType]);

  return {
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
    isRestoringState,
    savedExercises,
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer: safeSetShowRestTimer,
    setTimerType: safeSetTimerType,
    updateStopwatchTime,
    startNewWorkout,
    resetWorkoutState
  };
};
