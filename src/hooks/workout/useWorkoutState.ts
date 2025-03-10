
import { useState, useCallback } from 'react';
import { Exercise } from '@/components/ExerciseForm';

export interface WorkoutState {
  isWorkoutStarted: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  showRestTimer: boolean;
  timerType: 'set' | 'exercise'; 
  isWorkoutCompleted: boolean;
  workoutStartTime: number | null;
  stopwatchTime: number;
  isRestoringState: boolean;
  savedExercises: Exercise[];
}

export const useWorkoutState = (initialExercises: Exercise[] = []) => {
  const [state, setState] = useState<WorkoutState>({
    isWorkoutStarted: false,
    currentExerciseIndex: 0,
    currentSet: 1,
    showRestTimer: false,
    timerType: 'set',
    isWorkoutCompleted: false,
    workoutStartTime: null,
    stopwatchTime: 0,
    isRestoringState: false,
    savedExercises: [],
  });

  // Create individual setters for each state property
  const setIsWorkoutStarted = useCallback((value: boolean) => {
    setState(prevState => ({ ...prevState, isWorkoutStarted: value }));
  }, []);

  const setCurrentExerciseIndex = useCallback((value: number) => {
    setState(prevState => ({ ...prevState, currentExerciseIndex: value }));
  }, []);

  const setCurrentSet = useCallback((value: number) => {
    setState(prevState => ({ ...prevState, currentSet: value }));
  }, []);

  const setShowRestTimer = useCallback((value: boolean) => {
    setState(prevState => ({ ...prevState, showRestTimer: value }));
  }, []);

  const setTimerType = useCallback((value: 'set' | 'exercise') => {
    setState(prevState => ({ ...prevState, timerType: value }));
  }, []);

  const updateStopwatchTime = useCallback((time: number) => {
    setState(prevState => ({ ...prevState, stopwatchTime: time }));
  }, []);

  const startNewWorkout = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isWorkoutStarted: true,
      workoutStartTime: Date.now(),
      savedExercises: initialExercises.length > 0 ? initialExercises : prevState.savedExercises
    }));
  }, [initialExercises]);

  const resetWorkoutState = useCallback(() => {
    setState({
      isWorkoutStarted: false,
      currentExerciseIndex: 0,
      currentSet: 1,
      showRestTimer: false,
      timerType: 'set',
      isWorkoutCompleted: false,
      workoutStartTime: null,
      stopwatchTime: 0,
      isRestoringState: false,
      savedExercises: [],
    });
  }, []);

  return {
    // Expose all state properties
    isWorkoutStarted: state.isWorkoutStarted,
    currentExerciseIndex: state.currentExerciseIndex,
    currentSet: state.currentSet,
    showRestTimer: state.showRestTimer,
    timerType: state.timerType,
    isWorkoutCompleted: state.isWorkoutCompleted,
    workoutStartTime: state.workoutStartTime,
    stopwatchTime: state.stopwatchTime,
    isRestoringState: state.isRestoringState,
    savedExercises: state.savedExercises,
    
    // Expose all setter functions
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType,
    updateStopwatchTime,
    startNewWorkout,
    resetWorkoutState,
    
    // For convenience, also expose the raw state and setState
    state,
    setState,
  };
};
