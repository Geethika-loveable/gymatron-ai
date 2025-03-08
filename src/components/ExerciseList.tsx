
import React, { useState } from 'react';
import { Exercise } from './ExerciseForm';
import ExerciseItem from './ExerciseItem';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';

interface ExerciseListProps {
  exercises: Exercise[];
  onDeleteExercise: (id: string) => void;
  currentExerciseId?: string;
  activeSet?: number;
  isSignedIn?: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  onDeleteExercise, 
  currentExerciseId,
  activeSet,
  isSignedIn = false
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (exercises.length === 0) {
    return (
      <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-slide-up text-center text-muted-foreground">
        No exercises added yet
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gym-800">
          Your Exercises
        </h2>
        
        {!isSignedIn && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-green-500 hover:bg-green-600 text-white border-0"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Sign in to Save
          </Button>
        )}
      </div>
      
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default ExerciseList;
