
import { toast } from "@/components/ui/use-toast";
import { Exercise } from '@/components/ExerciseForm';
import { WorkoutState } from './types';
import { TimerManager } from '@/utils/TimerManager';

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

  // This function handles transitions between sets and exercises
  const handleRestTimerComplete = () => {
    console.log("Rest timer complete handler called", {
      currentType: state.timerType,
      currentExercise: state.currentExerciseIndex,
      currentSet: state.currentSet
    });
    
    // Stop any active timers
    const timerKey = `${state.timerType}-${exercises[state.currentExerciseIndex]?.id || 'none'}-set-${state.currentSet}`;
    TimerManager.stopTimer(timerKey);
    
    // First hide the timer with a small delay to ensure proper unmounting
    setShowRestTimer(false);
    
    // Small delay to ensure state is updated correctly before further changes
    setTimeout(() => {
      if (state.timerType === 'set') {
        handleSetTimerComplete();
      } else if (state.timerType === 'exercise') {
        // Exercise rest is complete, no need for additional state changes
        // as the timer is already hidden
        console.log("Exercise rest complete, ready for the next exercise");
      }
    }, 50);
  };
  
  // Extracted to a separate function to improve readability
  const handleSetTimerComplete = () => {
    const currentExercise = exercises[state.currentExerciseIndex];
    if (!currentExercise) {
      console.error("Current exercise not found");
      return;
    }
    
    // Check if there are more sets for this exercise
    const nextSet = state.currentSet + 1;
    
    if (nextSet < currentExercise.sets) {
      // Move to next set
      console.log(`Moving to next set: ${nextSet}`);
      setCurrentSet(nextSet);
    } else {
      // All sets for this exercise are complete
      const nextExerciseIndex = state.currentExerciseIndex + 1;
      
      if (nextExerciseIndex < exercises.length) {
        // Move to next exercise with a small delay to prevent state conflicts
        console.log(`Moving to next exercise: ${nextExerciseIndex}`);
        
        // Update both exercise index and set in sequence with delays
        setCurrentExerciseIndex(nextExerciseIndex);
        setCurrentSet(0);
        
        // Add a small delay before showing the exercise rest timer
        setTimeout(() => {
          console.log("Starting exercise rest timer");
          setTimerType('exercise');
          setShowRestTimer(true);
        }, 100);
      } else {
        // Workout complete
        console.log("Workout complete!");
        endWorkout();
        
        toast({
          title: "Workout completed",
          description: "Great job! You've completed your workout.",
        });
      }
    }
  };

  // Method to end workout without resetting the stopwatch
  const endWorkout = () => {
    console.log("Ending workout, stopping all timers");
    
    // Stop all potential timers
    const setTimerKey = `set-${exercises[state.currentExerciseIndex]?.id || 'none'}-set-${state.currentSet}`;
    const exerciseTimerKey = `exercise-${exercises[state.currentExerciseIndex]?.id || 'none'}-set-${state.currentSet}`;
    
    TimerManager.stopTimer(setTimerKey);
    TimerManager.stopTimer(exerciseTimerKey);
    
    // Update state in sequence with small delays to prevent conflicts
    setShowRestTimer(false);
    
    setTimeout(() => {
      setIsWorkoutStarted(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(0);
      setTimerType('set');
    }, 50);
    
    // Clear the localStorage state
    clearWorkoutState();
  };

  // Import the clearWorkoutState function directly to avoid circular imports
  const clearWorkoutState = () => {
    localStorage.removeItem('workout_state_v1');
    console.log('Workout state cleared from localStorage');
  };

  const completeSet = () => {
    console.log("Set completed, starting rest timer");
    setTimerType('set');
    setShowRestTimer(true);
  };

  return {
    startWorkout,
    handleRestTimerComplete,
    resetWorkout: resetWorkoutState,
    completeSet,
    endWorkout
  };
};
