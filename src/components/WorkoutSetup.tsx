
import React from 'react';
import { Exercise } from './ExerciseForm';
import ExerciseForm from './ExerciseForm';
import ExerciseList from './ExerciseList';
import { Button } from "@/components/ui/button";
import { PlayIcon } from 'lucide-react';

interface WorkoutSetupProps {
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onDeleteExercise: (id: string) => void;
  onStartWorkout: () => void;
  isSignedIn: boolean;
  loading: boolean;
}

const WorkoutSetup: React.FC<WorkoutSetupProps> = ({
  exercises,
  onAddExercise,
  onDeleteExercise,
  onStartWorkout,
  isSignedIn,
  loading
}) => {
  return (
    <>
      <ExerciseForm onAddExercise={onAddExercise} />
      
      <ExerciseList 
        exercises={exercises} 
        onDeleteExercise={onDeleteExercise}
        isSignedIn={isSignedIn}
        loading={loading}
      />
      
      {exercises.length > 0 && (
        <div className="mt-auto pb-6">
          <Button 
            onClick={onStartWorkout} 
            className="w-full h-14 text-lg"
          >
            <PlayIcon className="mr-2" size={20} />
            Start Now
          </Button>
        </div>
      )}
    </>
  );
};

export default WorkoutSetup;
