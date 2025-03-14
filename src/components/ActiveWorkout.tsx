
import React from 'react';
import { Exercise } from './ExerciseForm';
import ExerciseList from './ExerciseList';
import RestTimer from './RestTimer';
import { Button } from "@/components/ui/button";

interface ActiveWorkoutProps {
  exercises: Exercise[];
  showRestTimer: boolean;
  timerType: 'set' | 'exercise';
  currentExercise?: Exercise;
  currentSet: number;
  onRestTimerComplete: () => void;
  onCompleteSet: () => void;
  onEndWorkout: () => void;
  onOpenAuthModal: () => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  exercises,
  showRestTimer,
  timerType,
  currentExercise,
  currentSet,
  onRestTimerComplete,
  onCompleteSet,
  onEndWorkout,
  onOpenAuthModal
}) => {
  // Generate a unique key for the timer based on its type and current exercise/set
  const timerKey = `${timerType}-${currentExercise?.id || 'none'}-set-${currentSet}`;
  
  return (
    <>
      <div className="sticky top-[120px] z-30 mb-6 w-full">
        {showRestTimer ? (
          <RestTimer 
            duration={timerType === 'set' ? 30 : 60} 
            onComplete={onRestTimerComplete} 
            label={timerType === 'set' ? 'Rest Between Sets' : 'Rest Between Exercises'} 
            timerKey={timerKey}
          />
        ) : (
          <div className="glass-panel p-6 w-full animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary mb-1">
                {currentExercise?.name}
              </h2>
              <p className="text-2xl font-bold text-gym-800">
                {currentExercise?.reps} Reps
              </p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Complete your reps and wait for the rest timer
              </p>
              
              <Button 
                onClick={onCompleteSet}
              >
                Complete Set
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full">
        <ExerciseList 
          exercises={exercises} 
          onDeleteExercise={() => {}} // Disable deletion during workout
          currentExerciseId={currentExercise?.id}
          activeSet={currentSet}
          isSignedIn={true} // This doesn't matter during workout
          onOpenAuthModal={onOpenAuthModal}
        />
      </div>
      
      <div className="mt-auto pb-6 w-full">
        <Button 
          variant="outline"
          onClick={onEndWorkout} 
          className="w-full"
        >
          End Workout
        </Button>
      </div>
    </>
  );
};

export default React.memo(ActiveWorkout);
