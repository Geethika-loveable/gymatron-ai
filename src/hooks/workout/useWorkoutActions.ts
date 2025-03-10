
import { toast } from "@/components/ui/use-toast";
import { Exercise } from '@/components/ExerciseForm';
import { WorkoutState } from './useWorkoutState';

interface WorkoutActionsProps {
  exercises: Exercise[];
  state: WorkoutState;
  startNewWorkout: () => void;
  setIsWorkoutStarted: (value: boolean) => void;
  setCurrentExerciseIndex: (value: number) => void;
  setCurrentSet: (value: number) => void;
  setShowRestTimer: (value: boolean) => void;
  setTimerType: (value: 'set' | 'exercise') => void;
  resetWorkoutState: () => void;
}

export const useWorkoutActions = ({
  exercises,
  state,
  startNewWorkout,
  setIsWorkoutStarted,
  setCurrentExerciseIndex, 
  setCurrentSet,
  setShowRestTimer,
  setTimerType,
  resetWorkoutState
}: WorkoutActionsProps) => {
  const startWorkout = () => {
    if (exercises.length === 0) {
      toast({
        title: "No exercises",
        description: "Add at least one exercise before starting",
        variant: "destructive",
      });
      return;
    }
    
    startNewWorkout(); // This now handles setting workout start time
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    
    toast({
      title: "Workout started!",
      description: `Starting with ${exercises[0].name}`,
    });
  };

  const handleRestTimerComplete = () => {
    setShowRestTimer(false);
    
    if (state.timerType === 'set') {
      // Move to next set
      const nextSet = state.currentSet + 1;
      if (nextSet < exercises[state.currentExerciseIndex].sets) {
        setCurrentSet(nextSet);
      } else {
        // All sets completed for this exercise
        const nextExerciseIndex = state.currentExerciseIndex + 1;
        
        if (nextExerciseIndex < exercises.length) {
          // Move to next exercise
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSet(0);
          // Start exercise rest timer
          setTimerType('exercise');
          setShowRestTimer(true);
        } else {
          // Workout complete
          resetWorkoutState(); // Now handles clearing local storage
          
          toast({
            title: "Workout completed",
            description: "Great job! You've completed your workout.",
          });
        }
      }
    }
  };

  const completeSet = () => {
    setTimerType('set');
    setShowRestTimer(true);
  };

  return {
    startWorkout,
    handleRestTimerComplete,
    resetWorkout: resetWorkoutState,
    completeSet
  };
};
