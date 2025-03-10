
import React from 'react';
import Header from '@/components/Header';
import Stopwatch from '@/components/Stopwatch';
import WorkoutSetup from '@/components/WorkoutSetup';
import ActiveWorkout from '@/components/ActiveWorkout';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useWorkout } from '@/hooks/useWorkout';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const { 
    exercises, 
    isSignedIn, 
    loading, 
    addExercise, 
    deleteExercise 
  } = useExerciseData();
  
  const {
    isWorkoutStarted,
    currentSet,
    showRestTimer,
    timerType,
    currentExercise,
    workoutStartTime,
    stopwatchTime,
    isRestoringState,
    updateStopwatchTime,
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  } = useWorkout(exercises);

  // Show toast if we're restoring a workout
  React.useEffect(() => {
    if (isWorkoutStarted && !isRestoringState) {
      toast({
        title: "Workout Restored",
        description: "Your previous workout session has been restored",
      });
    }
  }, [isWorkoutStarted, isRestoringState]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex flex-col">
      <Header />
      
      <div className="container mx-auto flex-1 flex flex-col max-w-md">
        <Stopwatch 
          isWorkoutStarted={isWorkoutStarted} 
          initialTime={stopwatchTime}
          onTimeUpdate={updateStopwatchTime}
          isRestoringState={isRestoringState}
        />
        
        {!isWorkoutStarted ? (
          <WorkoutSetup 
            exercises={exercises}
            onAddExercise={addExercise}
            onDeleteExercise={deleteExercise}
            onStartWorkout={startWorkout}
            isSignedIn={isSignedIn}
            loading={loading || isRestoringState}
          />
        ) : (
          <ActiveWorkout 
            exercises={exercises}
            showRestTimer={showRestTimer}
            timerType={timerType}
            currentExercise={currentExercise}
            currentSet={currentSet}
            onRestTimerComplete={handleRestTimerComplete}
            onCompleteSet={completeSet}
            onEndWorkout={resetWorkout}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
