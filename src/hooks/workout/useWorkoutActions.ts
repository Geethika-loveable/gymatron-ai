
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
          endWorkout(); // Changed to use endWorkout instead of resetWorkoutState
          
          toast({
            title: "Workout completed",
            description: "Great job! You've completed your workout.",
          });
        }
      }
    }
  };

  // New method to end workout without resetting the stopwatch
  const endWorkout = () => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setShowRestTimer(false);
    setTimerType('set');
    // Note: We're not resetting workoutStartTime or stopwatchTime here
    
    // Clear the localStorage state
    clearWorkoutState();
  };

  // Import the clearWorkoutState function directly to avoid circular imports
  const clearWorkoutState = () => {
    localStorage.removeItem('workout_state_v1');
    console.log('Workout state cleared from localStorage');
  };

  const completeSet = () => {
    setTimerType('set');
    setShowRestTimer(true);
  };

  return {
    startWorkout,
    handleRestTimerComplete,
    resetWorkout: resetWorkoutState, // This will be replaced in useWorkout
    completeSet,
    endWorkout // Export the new method
  };
};
