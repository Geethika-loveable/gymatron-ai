
import { useCallback } from 'react';
import { LocalWorkoutState } from './types';
import { Exercise } from '@/components/ExerciseForm';

interface UseStateSavingProps {
  stateRef: React.MutableRefObject<LocalWorkoutState>;
  exercises: Exercise[];
  saveWorkoutState: (state: LocalWorkoutState) => void;
}

export const useStateSaving = ({
  stateRef,
  exercises,
  saveWorkoutState
}: UseStateSavingProps) => {
  const saveState = useCallback(() => {
    const stateToSave = {
      ...stateRef.current,
      exercises: exercises.length > 0 ? exercises : stateRef.current.exercises,
      lastSavedAt: Date.now()
    };
    
    console.log('Saving state with stopwatch time:', stateToSave.stopwatchTime);
    saveWorkoutState(stateToSave);
  }, [exercises, saveWorkoutState, stateRef]);

  return { saveState };
};
