
import { useState } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { toast } from "@/components/ui/use-toast";

export const useWorkout = (exercises: Exercise[]) => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerType, setTimerType] = useState<'set' | 'exercise'>('set');

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
    toast({
      title: "Workout started!",
      description: `Starting with ${exercises[0].name}`,
    });
  };

  const handleRestTimerComplete = () => {
    setShowRestTimer(false);
    
    if (timerType === 'set') {
      // Move to next set
      const nextSet = currentSet + 1;
      if (nextSet < exercises[currentExerciseIndex].sets) {
        setCurrentSet(nextSet);
      } else {
        // All sets completed for this exercise
        const nextExerciseIndex = currentExerciseIndex + 1;
        
        if (nextExerciseIndex < exercises.length) {
          // Move to next exercise
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSet(0);
          // Start exercise rest timer
          setTimerType('exercise');
          setShowRestTimer(true);
        } else {
          // Workout complete
          setIsWorkoutStarted(false);
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
    setTimerType('set');
    setShowRestTimer(true);
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
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  };
};
