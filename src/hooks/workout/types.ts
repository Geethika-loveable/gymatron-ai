
import { Exercise } from '@/components/ExerciseForm';

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

export interface LocalWorkoutState extends WorkoutStateWithTime {
  exercises: Exercise[];
  lastSavedAt: number;
}

export type WorkoutStateSetter = {
  setIsWorkoutStarted: (value: boolean) => void;
  setCurrentExerciseIndex: (value: number) => void;
  setCurrentSet: (value: number) => void;
  setShowRestTimer: (value: boolean) => void;
  setTimerType: (value: 'set' | 'exercise') => void;
  updateStopwatchTime: (time: number) => void;
  setWorkoutStartTime: (value: number) => void;
};
