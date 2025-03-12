
import { useCallback, useRef } from 'react';
import { LocalWorkoutState } from './types';
import { useLocalWorkoutPersistence } from './useLocalWorkoutPersistence';

export const useWorkoutPersistence = (
  stateRef: React.MutableRefObject<LocalWorkoutState>,
  isRestoringState: boolean,
  exercises: any[]
) => {
  const { 
    saveWorkoutState, 
    loadWorkoutState, 
    clearWorkoutState,
    isInitialized 
  } = useLocalWorkoutPersistence();

  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const saveState = useCallback(() => {
    if (!isInitialized || isRestoringState || !stateRef.current.isWorkoutStarted) return;
    
    const stateToSave = {
      ...stateRef.current,
      exercises: exercises.length > 0 ? exercises : stateRef.current.exercises,
      lastSavedAt: Date.now()
    };
    
    saveWorkoutState(stateToSave);
    lastSaveTimeRef.current = Date.now();
  }, [isInitialized, isRestoringState, exercises, saveWorkoutState, stateRef]);

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
  }, [saveState]);

  return {
    throttledSave,
    saveState,
    loadWorkoutState,
    clearWorkoutState,
    isInitialized
  };
};
