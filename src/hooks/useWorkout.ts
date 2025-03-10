
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
  } = useWorkoutState(exercises);

  const {
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  } = useWorkoutActions({
    exercises: exercises.length > 0 ? exercises : savedExercises,
    state: {
      isWorkoutStarted,
      currentExerciseIndex,
      currentSet,
      showRestTimer,
      timerType
    },
    startNewWorkout,
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType,
    resetWorkoutState
  });

  const effectiveExercises = exercises.length > 0 ? exercises : savedExercises;
  const currentExercise = isWorkoutStarted && effectiveExercises.length > 0 
    ? effectiveExercises[currentExerciseIndex] 
    : undefined;

  return {
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    currentExercise,
    workoutStartTime,
    stopwatchTime,
    isRestoringState,
    savedExercises,
    updateStopwatchTime,
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  };
};
