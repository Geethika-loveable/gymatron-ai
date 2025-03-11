
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
import { useAnalytics } from '@/hooks/useAnalytics';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { trackEvent } = useAnalytics();
  
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
    trackEvent('exercise_added', { name: args[0].name, sets: args[0].sets, reps: args[0].reps });
    addExercise(...args);
  }, [addExercise, trackEvent]);
  
  const handleDeleteExercise = useCallback((...args: Parameters<typeof deleteExercise>) => {
    trackEvent('exercise_deleted', { exercise_id: args[0] });
    deleteExercise(...args);
  }, [deleteExercise, trackEvent]);
  
  const handleStartWorkout = useCallback(() => {
    trackEvent('workout_started', { 
      exercise_count: exercises.length,
      exercises: exercises.map(e => e.name)
    });
    startWorkout();
  }, [startWorkout, exercises, trackEvent]);
  
  const handleRestComplete = useCallback(() => {
    trackEvent('rest_completed', { 
      timer_type: timerType,
      current_exercise: currentExercise ? currentExercise.name : null,
      current_set: currentSet
    });
    handleRestTimerComplete();
  }, [handleRestTimerComplete, timerType, currentExercise, currentSet, trackEvent]);
  
  const handleCompleteSet = useCallback(() => {
    trackEvent('set_completed', { 
      exercise_name: currentExercise ? currentExercise.name : null,
      set: currentSet
    });
    completeSet();
  }, [completeSet, currentExercise, currentSet, trackEvent]);
  
  const handleEndWorkout = useCallback(() => {
    trackEvent('workout_ended', { 
      duration: stopwatchTime,
      exercise_count: exercises.length
    });
    endWorkout();
  }, [endWorkout, stopwatchTime, exercises.length, trackEvent]);
  
  const handleTimeUpdate = useCallback((time: number) => {
    updateStopwatchTime(time);
  }, [updateStopwatchTime]);

  const handleOpenAuthModal = useCallback(() => {
    trackEvent('auth_modal_opened');
    setIsAuthModalOpen(true);
  }, [trackEvent]);

  const handleCloseAuthModal = useCallback(() => {
    trackEvent('auth_modal_closed');
    setIsAuthModalOpen(false);
  }, [trackEvent]);
  
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
      trackEvent('workout_restored');
      toast({
        title: "Workout Restored",
        description: "Your previous workout session has been restored",
      });
    }
  }, [isWorkoutStarted, isRestoringState, trackEvent]);

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
