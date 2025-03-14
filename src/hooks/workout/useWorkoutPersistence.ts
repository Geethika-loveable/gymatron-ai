
import { useRef } from 'react';
import { LocalWorkoutState } from './types';
import { useLocalWorkoutPersistence } from './useLocalWorkoutPersistence';
import { useSaveThrottling } from './useSaveThrottling';
import { useStateSaving } from './useStateSaving';

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

  // Create a specific state saving function
  const { saveState } = useStateSaving({
    stateRef,
    exercises,
    saveWorkoutState
  });

  // Use the throttling hook
  const { throttledSave, forceSave } = useSaveThrottling({
    saveCallback: saveState,
    isInitialized,
    isRestoringState
  });

  return {
    throttledSave,
    saveState,
    forceSave,
    loadWorkoutState,
    clearWorkoutState,
    isInitialized
  };
};
