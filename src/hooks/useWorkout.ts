
import { Exercise } from '@/components/ExerciseForm';
import { useState, useRef } from 'react';
import { useWorkoutState } from './workout/useWorkoutState';
import { useWorkoutActions } from './workout/useWorkoutActions';
import { useWorkoutPersistence } from './workout/useWorkoutPersistence';

export const useWorkout = (exercises: Exercise[]) => {
  const [stopwatchTime, setStopwatchTime] = useState(0);
  
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

  const workoutState = {
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType
  };

  // Create actions but don't use them directly yet
  const {
    startWorkout: startWorkoutBase,
    handleRestTimerComplete: handleRestTimerCompleteBase,
    resetWorkout: resetWorkoutBase,
    completeSet: completeSetBase
  } = useWorkoutActions({
    exercises,
    state: workoutState,
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType
  });

  // Integrate persistence
  const {
    isLoading,
    sessionId,
    resetWithPersistence,
    syncWorkoutState
  } = useWorkoutPersistence({
    exercises,
    workoutState,
    stopwatchTime,
    resetWorkout: resetWorkoutBase,
    setCurrentExerciseIndex,
    setCurrentSet,
    setIsWorkoutStarted
  });

  // Wrap actions with persistence
  const startWorkout = () => {
    startWorkoutBase();
  };

  const handleRestTimerComplete = () => {
    handleRestTimerCompleteBase();
    syncWorkoutState();
  };

  const resetWorkout = () => {
    resetWithPersistence();
  };

  const completeSet = () => {
    completeSetBase();
    syncWorkoutState();
  };

  const updateStopwatchTime = (time: number) => {
    setStopwatchTime(time);
  };

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
    isLoading,
    stopwatchTime,
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet,
    updateStopwatchTime
  };
};
