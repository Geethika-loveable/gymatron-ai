
import { useState, useEffect } from 'react';
import { Exercise } from '@/components/ExerciseForm';

export interface WorkoutState {
  isWorkoutStarted: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  showRestTimer: boolean;
  timerType: 'set' | 'exercise';
}

export const useWorkoutState = () => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerType, setTimerType] = useState<'set' | 'exercise'>('set');

  return {
    // State
    isWorkoutStarted,
    currentExerciseIndex,
    currentSet,
    showRestTimer,
    timerType,
    // State setters
    setIsWorkoutStarted,
    setCurrentExerciseIndex,
    setCurrentSet,
    setShowRestTimer,
    setTimerType
  };
};
