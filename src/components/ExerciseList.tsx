
import React from 'react';
import { Exercise } from './ExerciseForm';
import ExerciseItem from './ExerciseItem';

interface ExerciseListProps {
  exercises: Exercise[];
  onDeleteExercise: (id: string) => void;
  currentExerciseId?: string;
  activeSet?: number;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  onDeleteExercise, 
  currentExerciseId,
  activeSet
}) => {
  if (exercises.length === 0) {
    return (
      <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-slide-up text-center text-muted-foreground">
        No exercises added yet
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-slide-up">
      <h2 className="text-lg font-semibold mb-4 text-gym-800">
        Your Exercises
      </h2>
      
      <div className="space-y-3">
        {exercises.map(exercise => (
          <ExerciseItem 
            key={exercise.id} 
            exercise={exercise} 
            onDelete={onDeleteExercise}
            currentExercise={exercise.id === currentExerciseId}
            activeSet={exercise.id === currentExerciseId ? activeSet : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
