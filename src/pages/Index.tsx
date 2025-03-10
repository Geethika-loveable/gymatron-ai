
import React from 'react';
import Header from '@/components/Header';
import Stopwatch from '@/components/Stopwatch';
import WorkoutSetup from '@/components/WorkoutSetup';
import ActiveWorkout from '@/components/ActiveWorkout';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useWorkout } from '@/hooks/useWorkout';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { 
    exercises, 
    isSignedIn, 
    loading: exercisesLoading, 
    addExercise, 
    deleteExercise 
  } = useExerciseData();
  
  const {
    isWorkoutStarted,
    currentSet,
    showRestTimer,
    timerType,
    currentExercise,
    isLoading: persistenceLoading,
    stopwatchTime,
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet,
    updateStopwatchTime
  } = useWorkout(exercises);

  const loading = exercisesLoading || persistenceLoading;

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex flex-col">
      <Header />
      
      <div className="container mx-auto flex-1 flex flex-col max-w-md">
        {loading ? (
          // Loading state
          <>
            <Skeleton className="h-[152px] w-full mb-6 rounded-lg" />
            <Skeleton className="h-[300px] w-full mb-6 rounded-lg" />
          </>
        ) : (
          <>
            <Stopwatch 
              isWorkoutStarted={isWorkoutStarted} 
              onTimeUpdate={updateStopwatchTime}
              initialTime={stopwatchTime}
            />
            
            {!isWorkoutStarted ? (
              <WorkoutSetup 
                exercises={exercises}
                onAddExercise={addExercise}
                onDeleteExercise={deleteExercise}
                onStartWorkout={startWorkout}
                isSignedIn={isSignedIn}
                loading={exercisesLoading}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
