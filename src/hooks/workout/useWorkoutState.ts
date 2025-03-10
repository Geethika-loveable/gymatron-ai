
import { useState } from 'react';
import { Exercise } from '@/components/ExerciseForm';

export interface WorkoutState {
  isWorkoutStarted: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  showRestTimer: boolean;
  timerType: 'set' | 'exercise'; // Update type to accept both 'set' and 'exercise'
  isWorkoutCompleted: boolean;
  workoutStartTime: number | null;
  stopwatchTime: number;
  isRestoringState: boolean;
  savedExercises: Exercise[];
}

export const useWorkoutState = () => {
  const [state, setState] = useState<WorkoutState>({
    isWorkoutStarted: false,
    currentExerciseIndex: 0,
    currentSet: 1,
    showRestTimer: false,
    timerType: 'set', // Default is 'set'
    isWorkoutCompleted: false,
    workoutStartTime: null,
    stopwatchTime: 0,
    isRestoringState: false,
    savedExercises: [],
  });

  return {
    state,
    setState,
  };
};
