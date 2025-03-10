
import React from 'react';
import { Exercise } from './ExerciseForm';
import ExerciseItem from './ExerciseItem';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExerciseListProps {
  exercises: Exercise[];
  onDeleteExercise: (id: string) => void;
  currentExerciseId?: string;
  activeSet?: number;
  isSignedIn?: boolean;
  loading?: boolean;
  onOpenAuthModal: () => void; // New prop for opening the global auth modal
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  onDeleteExercise, 
  currentExerciseId,
  activeSet,
  isSignedIn = false,
  loading = false,
  onOpenAuthModal
}) => {
  const { toast } = useToast();

  const renderContent = () => {
    // Show loading indicator only when user is signed in and data is loading
    if (isSignedIn && loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Loading your exercises...</p>
        </div>
      );
    }

    // If there are exercises, display them
    if (exercises.length > 0) {
      return (
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
      );
    }

    // If signed in but no exercises
    if (isSignedIn) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Your exercises will show up here
        </div>
      );
    }

    // Not signed in and no exercises
    return (
      <div className="text-center py-8 text-muted-foreground">
        No exercises added yet
      </div>
    );
  };

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
            onClick={onOpenAuthModal} // Use the prop to open the global modal
          >
            Sign in to Save
          </Button>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
};

export default ExerciseList;
