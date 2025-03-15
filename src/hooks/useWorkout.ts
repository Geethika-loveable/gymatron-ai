
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
    endWorkout,
    completeWorkout,
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

  // Define a proper resetWorkout function that resets everything including the stopwatch
  const resetWorkout = () => {
    resetWorkoutState(); // This will reset all state including stopwatch time
  };

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
    resetWorkout,       // For complete reset including stopwatch
    endWorkout,         // For pausing workout
    completeWorkout,    // For when all exercises are completed
    completeSet
  };
};
