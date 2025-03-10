
import React from 'react';
import Header from '@/components/Header';
import Stopwatch from '@/components/Stopwatch';
import WorkoutSetup from '@/components/WorkoutSetup';
import ActiveWorkout from '@/components/ActiveWorkout';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useWorkout } from '@/hooks/useWorkout';

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
    startWorkout,
    handleRestTimerComplete,
    resetWorkout,
    completeSet
  } = useWorkout(exercises);

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex flex-col">
      <Header />
      
      <div className="container mx-auto flex-1 flex flex-col max-w-md">
        <Stopwatch isWorkoutStarted={isWorkoutStarted} />
        
        {!isWorkoutStarted ? (
          <WorkoutSetup 
            exercises={exercises}
            onAddExercise={addExercise}
            onDeleteExercise={deleteExercise}
            onStartWorkout={startWorkout}
            isSignedIn={isSignedIn}
            loading={loading}
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
