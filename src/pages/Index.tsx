import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Stopwatch from '@/components/Stopwatch';
import ExerciseForm, { Exercise } from '@/components/ExerciseForm';
import ExerciseList from '@/components/ExerciseList';
import RestTimer from '@/components/RestTimer';
import { Button } from "@/components/ui/button";
import { PlayIcon } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerType, setTimerType] = useState<'set' | 'exercise'>('set');
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsSignedIn(!!data.session);
    };

    checkUserSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsSignedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const addExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
    toast({
      title: "Exercise added",
      description: `Added ${exercise.name} to your workout`,
    });
  };

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
  };

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
    } else {
      // Exercise rest complete, no need to do anything special
      // The UI is already set to show the next exercise
    }
  };

  // Reset workout
  const resetWorkout = () => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(0);
    setShowRestTimer(false);
  };

  const currentExercise = isWorkoutStarted && exercises.length > 0 
    ? exercises[currentExerciseIndex] 
    : undefined;

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex flex-col">
      <Header />
      
      <div className="container mx-auto flex-1 flex flex-col max-w-md">
        <Stopwatch isWorkoutStarted={isWorkoutStarted} />
        
        {!isWorkoutStarted ? (
          <>
            <ExerciseForm onAddExercise={addExercise} />
            
            <ExerciseList 
              exercises={exercises} 
              onDeleteExercise={deleteExercise}
              isSignedIn={isSignedIn}
            />
            
            {exercises.length > 0 && (
              <div className="mt-auto pb-6">
                <Button 
                  onClick={startWorkout} 
                  className="w-full h-14 text-lg"
                >
                  <PlayIcon className="mr-2" size={20} />
                  Start Now
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {showRestTimer ? (
              <RestTimer 
                duration={timerType === 'set' ? 30 : 60} 
                onComplete={handleRestTimerComplete} 
                label={timerType === 'set' ? 'Rest Between Sets' : 'Rest Between Exercises'} 
              />
            ) : (
              <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-fade-in flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-primary mb-1">
                    {currentExercise?.name}
                  </h2>
                  <p className="text-2xl font-bold text-gym-800">
                    {currentExercise?.reps} Reps
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete your reps and wait for the rest timer
                  </p>
                  
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      setTimerType('set');
                      setShowRestTimer(true);
                    }}
                  >
                    Complete Set
                  </Button>
                </div>
              </div>
            )}
            
            <ExerciseList 
              exercises={exercises} 
              onDeleteExercise={() => {}} // Disable deletion during workout
              currentExerciseId={currentExercise?.id}
              activeSet={currentSet}
              isSignedIn={isSignedIn}
            />
            
            <div className="mt-auto pb-6">
              <Button 
                variant="outline"
                onClick={resetWorkout} 
                className="w-full"
              >
                End Workout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
