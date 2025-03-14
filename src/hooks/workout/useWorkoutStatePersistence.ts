
import { useEffect, useRef } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { LocalWorkoutState } from './types';

interface UseWorkoutStatePersistenceProps {
  isWorkoutStarted: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  showRestTimer: boolean;
  timerType: 'set' | 'exercise';
  workoutStartTime: number;
  stopwatchTime: number;
  exercises: Exercise[];
  savedExercises: Exercise[];
  isInitialized: boolean;
  isRestoringState: boolean;
  throttledSave: () => void;
  saveState: () => void;
  forceSave: () => void;
  stateRef: React.MutableRefObject<LocalWorkoutState>;
}

export const useWorkoutStatePersistence = ({
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
}: UseWorkoutStatePersistenceProps) => {
  
  // Always update our ref to current state for persistence
  useEffect(() => {
    stateRef.current = {
      isWorkoutStarted,
      currentExerciseIndex,
      currentSet,
      showRestTimer,
      timerType,
      workoutStartTime,
      stopwatchTime,
      exercises: exercises.length > 0 ? exercises : savedExercises,
      lastSavedAt: Date.now()
    };
    
    console.log("Workout state updated:", {
      isWorkoutStarted,
      currentExerciseIndex, 
      currentSet,
      showRestTimer,
      timerType,
      stopwatchTime
    });
    
  }, [
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
    exercises,
    savedExercises,
    stateRef
  ]);

  // Save state when workout state changes
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    // Always save state to ensure stopwatch time is preserved
    throttledSave();
  }, [
    isInitialized,
    isRestoringState, 
    currentExerciseIndex, 
    currentSet, 
    showRestTimer,
    timerType,
    throttledSave
  ]);

  // Special effect to save stopwatch time updates less frequently
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    // Use throttled save for stopwatch updates
    throttledSave();
  }, [isInitialized, isRestoringState, stopwatchTime, throttledSave]);

  // Set up periodic save during workout
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    const saveInterval = setInterval(() => {
      // Always save state periodically to ensure data isn't lost
      saveState();
    }, 10000);
    
    return () => clearInterval(saveInterval);
  }, [
    isInitialized,
    isRestoringState,
    saveState
  ]);

  // Special handler for workout state changes, force save
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    // Force save when workout state changes
    forceSave();
  }, [isInitialized, isRestoringState, isWorkoutStarted, forceSave]);
};
