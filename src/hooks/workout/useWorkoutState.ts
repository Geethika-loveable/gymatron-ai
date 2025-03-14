
import { useEffect, useCallback, useRef } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { LocalWorkoutState, WorkoutStateWithTime } from './types';
import { useWorkoutStateSetters } from './useWorkoutStateSetters';
import { useWorkoutPersistence } from './useWorkoutPersistence';

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
    savedExercises
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

  // Load saved state on init
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const savedState = loadWorkoutState();
      
      if (savedState) {
        console.log('Restoring workout state with stopwatch time:', savedState.stopwatchTime);
        setIsRestoringState(true);
        
        // Load state in correct order to prevent conflicts
        const loadSavedState = async () => {
          // First set the stopwatch time
          if (typeof savedState.stopwatchTime === 'number') {
            setStopwatchTime(savedState.stopwatchTime);
            console.log(`Set stopwatch time to: ${savedState.stopwatchTime}ms`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Then load exercises if needed
          if (savedState.exercises && savedState.exercises.length > 0) {
            setSavedExercises(savedState.exercises);
            console.log('Loaded saved exercises:', savedState.exercises.length);
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Set current position values
          setCurrentExerciseIndex(savedState.currentExerciseIndex);
          setCurrentSet(savedState.currentSet);
          setTimerType(savedState.timerType);
          
          if (savedState.workoutStartTime) {
            setWorkoutStartTime(savedState.workoutStartTime);
          }
          
          // Finally set the workout active state if it was active
          await new Promise(resolve => setTimeout(resolve, 50));
          setShowRestTimer(savedState.showRestTimer);
          
          // This should be last as it triggers the most side effects
          if (savedState.isWorkoutStarted) {
            setIsWorkoutStarted(savedState.isWorkoutStarted);
          }
          
          // Mark restoration as complete after a small delay
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsRestoringState(false);
          console.log('State restoration complete');
        };
        
        loadSavedState();
      } else {
        console.log('No saved state found');
        setIsRestoringState(false);
      }
    } catch (error) {
      console.error('Error restoring workout state:', error);
      setIsRestoringState(false);
    }
  }, [
    isInitialized, 
    loadWorkoutState, 
    setCurrentExerciseIndex, 
    setCurrentSet, 
    setIsRestoringState, 
    setIsWorkoutStarted, 
    setSavedExercises, 
    setShowRestTimer, 
    setStopwatchTime,
    setWorkoutStartTime,
    setTimerType
  ]);

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
