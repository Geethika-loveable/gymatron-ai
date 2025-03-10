
import { useState, useEffect } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { useLocalWorkoutPersistence } from './useLocalWorkoutPersistence';

export interface WorkoutState {
  isWorkoutStarted: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  showRestTimer: boolean;
  timerType: 'set' | 'exercise';
}

export interface WorkoutStateWithTime extends WorkoutState {
  workoutStartTime: number;
  stopwatchTime: number;
}

export const useWorkoutState = (exercises: Exercise[]) => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerType, setTimerType] = useState<'set' | 'exercise'>('set');
  const [workoutStartTime, setWorkoutStartTime] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRestoringState, setIsRestoringState] = useState(true);
  const [savedExercises, setSavedExercises] = useState<Exercise[]>([]);
  
  const { 
    saveWorkoutState, 
    loadWorkoutState, 
    clearWorkoutState,
    isInitialized 
  } = useLocalWorkoutPersistence();

  // Save state whenever key workout values change
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    
    if (isWorkoutStarted) {
      const stateToSave = {
        isWorkoutStarted,
        currentExerciseIndex,
        currentSet,
        showRestTimer,
        timerType,
        exercises: exercises.length > 0 ? exercises : savedExercises,
        workoutStartTime,
        stopwatchTime,
        lastSavedAt: Date.now()
      };
      
      saveWorkoutState(stateToSave);
    }
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted, 
    currentExerciseIndex, 
    currentSet, 
    showRestTimer, 
    exercises, 
    savedExercises,
    workoutStartTime,
    stopwatchTime,
    saveWorkoutState
  ]);

  // Periodic save for stopwatch time during workout
  useEffect(() => {
    if (!isWorkoutStarted || !isInitialized || isRestoringState) return;
    
    const saveInterval = setInterval(() => {
      const stateToSave = {
        isWorkoutStarted,
        currentExerciseIndex,
        currentSet,
        showRestTimer,
        timerType,
        exercises: exercises.length > 0 ? exercises : savedExercises,
        workoutStartTime,
        stopwatchTime,
        lastSavedAt: Date.now()
      };
      
      saveWorkoutState(stateToSave);
    }, 10000); // Save every 10 seconds
    
    return () => clearInterval(saveInterval);
  }, [
    isInitialized,
    isRestoringState,
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    exercises,
    savedExercises,
    workoutStartTime,
    stopwatchTime,
    saveWorkoutState
  ]);

  // Try to restore state on initial load
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const savedState = loadWorkoutState();
      
      if (savedState && savedState.isWorkoutStarted) {
        console.log('Restoring workout state:', savedState);
        
        // Restore the workout state
        setIsWorkoutStarted(savedState.isWorkoutStarted);
        setCurrentExerciseIndex(savedState.currentExerciseIndex);
        setCurrentSet(savedState.currentSet);
        setShowRestTimer(savedState.showRestTimer);
        setTimerType(savedState.timerType);
        setWorkoutStartTime(savedState.workoutStartTime);
        setStopwatchTime(savedState.stopwatchTime);
        
        // Save the exercises from local storage
        if (savedState.exercises && savedState.exercises.length > 0) {
          setSavedExercises(savedState.exercises);
        }
      }
    } catch (error) {
      console.error('Error restoring workout state:', error);
    } finally {
      setIsRestoringState(false);
    }
  }, [isInitialized, loadWorkoutState]);

  const updateStopwatchTime = (time: number) => {
    setStopwatchTime(time);
  };

  const startNewWorkout = () => {
    setWorkoutStartTime(Date.now());
    setStopwatchTime(0);
    setIsWorkoutStarted(true);
  };

  const resetWorkoutState = () => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setShowRestTimer(false);
    setTimerType('set');
    setWorkoutStartTime(0);
    setStopwatchTime(0);
    setSavedExercises([]);
    clearWorkoutState();
  };

  return {
    // State
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    workoutStartTime,
    stopwatchTime,
    isRestoringState,
    savedExercises,
    // State setters
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType,
    updateStopwatchTime,
    startNewWorkout,
    resetWorkoutState
  };
};
