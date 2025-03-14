
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
    loadWorkoutState,
    clearWorkoutState,
    isInitialized
  } = useWorkoutPersistence(stateRef, isRestoringState, exercises);

  // Update ref to current state for persistence
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

  // Save state when workout is active and state changes
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    if (isWorkoutStarted) {
      throttledSave();
    } else if (stopwatchTime > 0) {
      // Save state even when workout is not active but we have a stopwatch time
      // This ensures we preserve the stopwatch time when workout ends
      throttledSave();
    }
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted, 
    currentExerciseIndex, 
    currentSet, 
    showRestTimer,
    stopwatchTime, 
    throttledSave
  ]);

  // Set up periodic save during workout
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    const saveInterval = setInterval(() => {
      // Always save state periodically if workout is active or if we have a stopwatch time
      if (isWorkoutStarted || stopwatchTime > 0) {
        saveState();
      }
    }, 10000);
    
    return () => clearInterval(saveInterval);
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted,
    stopwatchTime,
    saveState
  ]);

  // Load saved state on init
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const savedState = loadWorkoutState();
      
      if (savedState) {
        console.log('Restoring workout state:', savedState);
        
        // Sequential state updates with small delays to prevent race conditions
        const loadSavedState = async () => {
          if (savedState.exercises && savedState.exercises.length > 0) {
            setSavedExercises(savedState.exercises);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          setCurrentExerciseIndex(savedState.currentExerciseIndex);
          setCurrentSet(savedState.currentSet);
          setTimerType(savedState.timerType);
          
          // Set the correct stopwatch time
          if (savedState.stopwatchTime) {
            console.log(`Restoring stopwatch time: ${savedState.stopwatchTime}ms`);
            setStopwatchTime(savedState.stopwatchTime);
          }
          
          if (savedState.workoutStartTime) {
            setWorkoutStartTime(savedState.workoutStartTime);
          }
          
          // Only restore workout state if workout was active
          if (savedState.isWorkoutStarted) {
            setCurrentExerciseIndex(savedState.currentExerciseIndex);
            setCurrentSet(savedState.currentSet);
            setTimerType(savedState.timerType);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            setShowRestTimer(savedState.showRestTimer);
            setIsWorkoutStarted(savedState.isWorkoutStarted);
          }
        };
        
        loadSavedState();
      }
    } catch (error) {
      console.error('Error restoring workout state:', error);
    } finally {
      setTimeout(() => {
        setIsRestoringState(false);
      }, 200);
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

  const resetWorkoutState = useCallback(() => {
    setShowRestTimer(false);
    
    setTimeout(() => {
      setIsWorkoutStarted(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(0);
      setTimerType('set');
      setWorkoutStartTime(0);
      setStopwatchTime(0);
      setSavedExercises([]);
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
