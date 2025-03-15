
import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Stopwatch from '@/components/Stopwatch';
import WorkoutSetup from '@/components/WorkoutSetup';
import ActiveWorkout from '@/components/ActiveWorkout';
import WelcomePopup from '@/components/WelcomePopup';
import LoadingScreen from '@/components/LoadingScreen';
import WorkoutCompleteNotification from '@/components/WorkoutCompleteNotification';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useWorkout } from '@/hooks/useWorkout';
import { toast } from "@/hooks/use-toast";
import AuthModal from '@/components/AuthModal';
import { useAnalytics } from '@/hooks/useAnalytics';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
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
    completeWorkout,
    completeSet
  } = useWorkout(exercises);

  // Combined loading state for the loading screen
  const isLoading = loading || isRestoringState;

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
  
  // Modified to use completeWorkout instead of endWorkout
  const handleEndWorkout = useCallback(() => {
    trackEvent('workout_ended', { 
      duration: stopwatchTime,
      exercise_count: exercises.length
    });
    completeWorkout(); // Use completeWorkout to properly finish the workout
    setShowWorkoutComplete(true); // Show the completion notification
  }, [completeWorkout, stopwatchTime, exercises.length, trackEvent]);
  
  const handlePauseWorkout = useCallback(() => {
    trackEvent('workout_paused', { 
      duration_so_far: stopwatchTime,
      current_exercise: currentExercise ? currentExercise.name : null
    });
    endWorkout(); // Use endWorkout for pausing
  }, [endWorkout, stopwatchTime, currentExercise, trackEvent]);
  
  const handleTimeUpdate = useCallback((time: number) => {
    if (Math.abs(stopwatchTime - time) > 50) {
      console.log(`Index updating stopwatch time: ${time}`);
      updateStopwatchTime(time);
    }
  }, [updateStopwatchTime, stopwatchTime]);

  const handleOpenAuthModal = useCallback(() => {
    trackEvent('auth_modal_opened');
    setIsAuthModalOpen(true);
  }, [trackEvent]);

  const handleCloseAuthModal = useCallback(() => {
    trackEvent('auth_modal_closed');
    setIsAuthModalOpen(false);
  }, [trackEvent]);
  
  const handleCloseWorkoutComplete = useCallback(() => {
    trackEvent('workout_complete_notification_closed');
    setShowWorkoutComplete(false);
  }, [trackEvent]);

  // Listen for workout completion from the hook
  useEffect(() => {
    // Intentionally leave this empty, since we manually trigger the notification
  }, [isWorkoutStarted]);

  // Make sure the completion notification works when the workout is programmatically completed 
  // from the useWorkoutActions hook when all exercises and sets are done
  useEffect(() => {
    const handleWorkoutCompletion = () => {
      if (!isWorkoutStarted && stopwatchTime > 0 && !isRestoringState) {
        setShowWorkoutComplete(true);
      }
    };

    // We'll check if the workout just ended and should show completion
    const checkForCompletion = () => {
      // Delay the check slightly to ensure state is settled
      setTimeout(handleWorkoutCompletion, 300);
    };

    checkForCompletion();
  }, [isWorkoutStarted, isRestoringState, stopwatchTime]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoadingScreen isLoading={isLoading} />
      
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header onOpenAuthModal={handleOpenAuthModal} />
      </div>
      
      <div className="container mx-auto flex-1 flex flex-col pt-[64px]">
        <div className="fixed top-[64px] left-0 right-0 z-40 bg-background/95 backdrop-blur-sm pt-4">
          <div className="container mx-auto px-4 max-w-md">
            <Stopwatch 
              isWorkoutStarted={isWorkoutStarted} 
              initialTime={stopwatchTime}
              onTimeUpdate={handleTimeUpdate}
              isRestoringState={isRestoringState}
            />
          </div>
        </div>
        
        <div className="px-4 flex-1 pt-[140px] max-w-md mx-auto w-full">
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
              onEndWorkout={handleEndWorkout} // This now calls completeWorkout internally
              onOpenAuthModal={handleOpenAuthModal}
            />
          )}
        </div>
      </div>
            
      <WelcomePopup 
        isOpen={showWelcome} 
        onClose={handleCloseWelcome}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseAuthModal} 
      />
      
      <WorkoutCompleteNotification
        isVisible={showWorkoutComplete}
        duration={stopwatchTime}
        onClose={handleCloseWorkoutComplete}
      />
    </div>
  );
};

export default Index;
