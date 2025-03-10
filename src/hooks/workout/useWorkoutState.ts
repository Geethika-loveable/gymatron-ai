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
  
  // Throttle save operations
  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    saveWorkoutState, 
    loadWorkoutState, 
    clearWorkoutState,
    isInitialized 
  } = useLocalWorkoutPersistence();

  // Update stateRef when state changes
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
  }, [
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
  ]);

  // Throttled save function
  const throttledSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // If it's been less than 2 seconds since the last save, schedule a save
    if (timeSinceLastSave < 2000) {
      saveTimeoutRef.current = setTimeout(() => {
        saveState();
        saveTimeoutRef.current = null;
      }, 2000 - timeSinceLastSave);
      return;
    }
    
    // Otherwise save immediately
    saveState();
  }, []);
  
  // Actual save function
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

  // Save state when key workout values change
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

  // Periodic save for stopwatch time during workout
  useEffect(() => {
    if (!isWorkoutStarted || !isInitialized || isRestoringState) return;
    
    const saveInterval = setInterval(() => {
      saveState();
    }, 10000); // Save every 10 seconds
    
    return () => clearInterval(saveInterval);
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted,
    saveState
  ]);

  // Try to restore state on initial load
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const savedState = loadWorkoutState();
      
      if (savedState && savedState.isWorkoutStarted) {
        console.log('Restoring workout state:', savedState);
        
        // Restore the workout state
        setIsWorkoutStarted(savedState.isWorkoutStarted);
        setCurrentExerciseIndex(savedState.currentExerciseIndex);
        setCurrentSet(savedState.currentSet);
        setShowRestTimer(savedState.showRestTimer);
        setTimerType(savedState.timerType);
        setWorkoutStartTime(savedState.workoutStartTime);
        setStopwatchTime(savedState.stopwatchTime);
        
        // Save the exercises from local storage
        if (savedState.exercises && savedState.exercises.length > 0) {
          setSavedExercises(savedState.exercises);
        }
      }
    } catch (error) {
      console.error('Error restoring workout state:', error);
    } finally {
      setIsRestoringState(false);
    }
  }, [isInitialized, loadWorkoutState]);

  const updateStopwatchTime = useCallback((time: number) => {
    setStopwatchTime(time);
  }, []);

  const startNewWorkout = useCallback(() => {
    setWorkoutStartTime(Date.now());
    setStopwatchTime(0);
    setIsWorkoutStarted(true);
  }, []);

  const resetWorkoutState = useCallback(() => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setShowRestTimer(false);
    setTimerType('set');
    setWorkoutStartTime(0);
    setStopwatchTime(0);
    setSavedExercises([]);
    clearWorkoutState();
  }, [clearWorkoutState]);

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
    // State setters
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType,
    updateStopwatchTime,
    startNewWorkout,
    resetWorkoutState
  };
};
