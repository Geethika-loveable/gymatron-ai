
import { useRef, useCallback, useEffect } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { LocalWorkoutState, WorkoutStateWithTime } from './types';
import { useWorkoutStateSetters } from './useWorkoutStateSetters';
import { useWorkoutPersistence } from './useWorkoutPersistence';
import { useWorkoutStateRestoration } from './useWorkoutStateRestoration';
import { useWorkoutStatePersistence } from './useWorkoutStatePersistence';

export type { WorkoutState, WorkoutStateWithTime } from './types';

export const useWorkoutState = (exercises: Exercise[]) => {
  const stateRef = useRef<LocalWorkoutState>({
    isWorkoutStarted: false,
    currentExerciseIndex: 0,
    currentSet: 0,
    showRestTimer: false,
    timerType: 'set',
    workoutStartTime: 0,
    stopwatchTime: 0,
    exercises: [],
    lastSavedAt: 0
  });
  
  const {
    // States
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
    setShowRestTimer,
    setTimerType,
    setIsRestoringState,
    setSavedExercises,
    setWorkoutStartTime,
    setStopwatchTime,
    updateStopwatchTime,
    startNewWorkout
  } = useWorkoutStateSetters();
  
  const {
    throttledSave,
    saveState,
    forceSave,
    loadWorkoutState,
    clearWorkoutState,
    isInitialized
  } = useWorkoutPersistence(stateRef, isRestoringState, exercises);

  // Use the restoration hook
  const { restoreWorkoutState } = useWorkoutStateRestoration({
    isInitialized,
    isRestoringState,
    loadWorkoutState,
    setIsRestoringState,
    setStopwatchTime,
    setSavedExercises,
    setCurrentExerciseIndex,
    setCurrentSet,
    setTimerType,
    setWorkoutStartTime,
    setShowRestTimer,
    setIsWorkoutStarted
  });

  // Use the persistence hook
  useWorkoutStatePersistence({
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
    exercises,
    savedExercises,
    isInitialized,
    isRestoringState,
    throttledSave,
    saveState,
    forceSave,
    stateRef
  });

  // Call the restore function on initialization
  useEffect(() => {
    restoreWorkoutState();
  }, [restoreWorkoutState]);

  // Handle workout state reset
  const resetWorkoutState = useCallback(() => {
    console.log('Resetting workout state completely');
    
    // Order matters here - first disable UI elements
    setShowRestTimer(false);
    
    // Then reset state values with a small delay
    setTimeout(() => {
      setIsWorkoutStarted(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(0);
      setTimerType('set');
      setWorkoutStartTime(0);
      setStopwatchTime(0);
      setSavedExercises([]);
      
      // Clear saved state
      clearWorkoutState();
    }, 50);
  }, [
    clearWorkoutState, 
    setCurrentExerciseIndex, 
    setCurrentSet, 
    setIsWorkoutStarted, 
    setSavedExercises, 
    setShowRestTimer, 
    setStopwatchTime, 
    setTimerType, 
    setWorkoutStartTime
  ]);

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
    setShowRestTimer,
    setTimerType,
    updateStopwatchTime,
    startNewWorkout,
    resetWorkoutState
  };
};
