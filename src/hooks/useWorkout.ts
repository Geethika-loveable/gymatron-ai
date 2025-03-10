
import { Exercise } from '@/components/ExerciseForm';
import { useWorkoutState } from './workout/useWorkoutState';
import { useWorkoutActions } from './workout/useWorkoutActions';

export const useWorkout = (exercises: Exercise[]) => {
  const {
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType
  } = useWorkoutState();

  const {
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  } = useWorkoutActions({
    exercises,
    state: {
      isWorkoutStarted,
      currentExerciseIndex,
      currentSet,
      showRestTimer,
      timerType
    },
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType
  });

  const currentExercise = isWorkoutStarted && exercises.length > 0 
    ? exercises[currentExerciseIndex] 
    : undefined;

  return {
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    currentExercise,
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  };
};
