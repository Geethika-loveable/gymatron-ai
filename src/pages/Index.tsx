
import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Stopwatch from '@/components/Stopwatch';
import WorkoutSetup from '@/components/WorkoutSetup';
import ActiveWorkout from '@/components/ActiveWorkout';
import WelcomePopup from '@/components/WelcomePopup';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useWorkout } from '@/hooks/useWorkout';
import { toast } from "@/hooks/use-toast";
import AuthModal from '@/components/AuthModal';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const { 
    exercises, 
    isSignedIn, 
    loading, 
    addExercise, 
    deleteExercise,
    setExercises
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
    savedExercises,
    updateStopwatchTime,
    startWorkout,
    handleRestTimerComplete,
    endWorkout,
    completeSet
  } = useWorkout(exercises);

  // Check if this is first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleAddExercise = useCallback((...args: Parameters<typeof addExercise>) => {
    addExercise(...args);
  }, [addExercise]);
  
  const handleDeleteExercise = useCallback((...args: Parameters<typeof deleteExercise>) => {
    deleteExercise(...args);
  }, [deleteExercise]);
  
  const handleStartWorkout = useCallback(() => {
    startWorkout();
  }, [startWorkout]);
  
  const handleRestComplete = useCallback(() => {
    handleRestTimerComplete();
  }, [handleRestTimerComplete]);
  
  const handleCompleteSet = useCallback(() => {
    completeSet();
  }, [completeSet]);
  
  const handleEndWorkout = useCallback(() => {
    endWorkout();
  }, [endWorkout]);
  
  const handleTimeUpdate = useCallback((time: number) => {
    updateStopwatchTime(time);
  }, [updateStopwatchTime]);

  const handleOpenAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);
  
  // Restore saved exercises if needed
  useEffect(() => {
    if (isWorkoutStarted && savedExercises && savedExercises.length > 0 && exercises.length === 0) {
      console.log('Restoring saved exercises:', savedExercises);
      setExercises(savedExercises);
    }
  }, [isWorkoutStarted, exercises.length, savedExercises, setExercises]);

  // Show toast if we're restoring a workout
  useEffect(() => {
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
          onTimeUpdate={handleTimeUpdate}
          isRestoringState={isRestoringState}
        />
        
        {!isWorkoutStarted ? (
          <WorkoutSetup 
            exercises={exercises}
            onAddExercise={handleAddExercise}
            onDeleteExercise={handleDeleteExercise}
            onStartWorkout={handleStartWorkout}
            isSignedIn={isSignedIn}
            loading={loading || isRestoringState}
            onOpenAuthModal={handleOpenAuthModal}
          />
        ) : (
          <ActiveWorkout 
            exercises={exercises.length > 0 ? exercises : savedExercises}
            showRestTimer={showRestTimer}
            timerType={timerType}
            currentExercise={currentExercise}
            currentSet={currentSet}
            onRestTimerComplete={handleRestComplete}
            onCompleteSet={handleCompleteSet}
            onEndWorkout={handleEndWorkout}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}
      </div>
            
      {/* Welcome Popup */}
      <WelcomePopup 
        isOpen={showWelcome} 
        onClose={handleCloseWelcome}
      />
      
      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseAuthModal} 
      />  
    </div>
  );
};

export default Index;
