
import { useEffect, useCallback } from 'react';
import { Exercise } from '@/components/ExerciseForm';

interface UseWorkoutStateRestorationProps {
  isInitialized: boolean;
  isRestoringState: boolean;
  loadWorkoutState: () => any;
  setIsRestoringState: (value: boolean) => void;
  setStopwatchTime: (time: number) => void;
  setSavedExercises: (exercises: Exercise[]) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setCurrentSet: (set: number) => void;
  setTimerType: (type: 'set' | 'exercise') => void;
  setWorkoutStartTime: (time: number) => void;
  setShowRestTimer: (show: boolean) => void;
  setIsWorkoutStarted: (started: boolean) => void;
}

export const useWorkoutStateRestoration = ({
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
}: UseWorkoutStateRestorationProps) => {
  
  // Load saved state on init
  const restoreWorkoutState = useCallback(() => {
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

  return {
    restoreWorkoutState
  };
};
