
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
    exercises,
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
    workoutStartTime,
    stopwatchTime,
    isRestoringState,
    updateStopwatchTime,
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  };
};
