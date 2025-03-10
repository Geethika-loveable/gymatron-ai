
import { toast } from "@/components/ui/use-toast";
import { Exercise } from '@/components/ExerciseForm';
import { WorkoutState } from './useWorkoutState';

interface WorkoutActionsProps {
  exercises: Exercise[];
  state: WorkoutState;
  setIsWorkoutStarted: (value: boolean) => void;
  setCurrentExerciseIndex: (value: number) => void;
  setCurrentSet: (value: number) => void;
  setShowRestTimer: (value: boolean) => void;
  setTimerType: (value: 'set' | 'exercise') => void;
  onWorkoutEnd?: () => void;
}

export const useWorkoutActions = ({
  exercises,
  state,
  setIsWorkoutStarted,
  setCurrentExerciseIndex, 
  setCurrentSet,
  setShowRestTimer,
  setTimerType,
  onWorkoutEnd
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
    
    setIsWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setShowRestTimer(false);
    toast({
      title: "Workout started!",
      description: `Starting with ${exercises[0].name}`,
    });
  };

  const handleRestTimerComplete = () => {
    // Process what happens after rest period completes
    console.log("Rest timer complete, processing next actions");
    
    // First hide the timer completely
    setShowRestTimer(false);
    
    if (state.timerType === 'set') {
      // Move to next set
      const nextSet = state.currentSet + 1;
      
      // Check if we have more sets in this exercise
      if (nextSet < exercises[state.currentExerciseIndex].sets) {
        // Move to next set of the current exercise
        setCurrentSet(nextSet);
      } else {
        // All sets completed for this exercise
        const nextExerciseIndex = state.currentExerciseIndex + 1;
        
        if (nextExerciseIndex < exercises.length) {
          // Move to the first set of the next exercise
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSet(0);
          
          // Start exercise rest timer
          setTimerType('exercise');
          
          // Add a small delay to ensure state updates have propagated
          // before showing the rest timer
          setTimeout(() => {
            setShowRestTimer(true);
          }, 100);
        } else {
          // Workout complete
          setIsWorkoutStarted(false);
          if (onWorkoutEnd) {
            onWorkoutEnd();
          }
          toast({
            title: "Workout completed",
            description: "Great job! You've completed your workout.",
          });
        }
      }
    }
  };

  const resetWorkout = () => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setShowRestTimer(false);
  };

  const completeSet = () => {
    // Update the timer type first
    console.log("Set completed, showing rest timer");
    setTimerType('set');
    
    // Add a slight delay to ensure state is updated
    // before showing the rest timer
    setTimeout(() => {
      setShowRestTimer(true);
    }, 100);
  };

  return {
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  };
};
