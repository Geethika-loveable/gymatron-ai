
import React from 'react';
import { Exercise } from './ExerciseForm';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface ExerciseItemProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
  currentExercise?: boolean;
  activeSet?: number;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  onDelete, 
  currentExercise = false,
  activeSet
}) => {
  return (
    <div className={`
      border rounded-xl p-4 transition-all duration-300 animate-scale-in
      ${currentExercise 
        ? 'bg-primary/10 border-primary shadow-md' 
        : 'bg-white border-border hover:border-primary/30 hover:bg-primary/5'}
    `}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg text-gym-800">{exercise.name}</h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(exercise.id)}
          className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      
      <div className="flex gap-6 text-sm text-gym-600">
        <div>
          <span className="font-semibold text-primary">{exercise.sets}</span> Sets
        </div>
        <div>
          <span className="font-semibold text-primary">{exercise.reps}</span> Reps
        </div>
      </div>
      
      {currentExercise && activeSet !== undefined && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex gap-1">
            {Array.from({ length: exercise.sets }).map((_, idx) => (
              <div 
                key={idx} 
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-300
                  ${idx < activeSet ? 'bg-primary/80' : 'bg-gray-200'}
                  ${idx === activeSet ? 'bg-primary animate-pulse-light' : ''}
                `}
              />
            ))}
          </div>
          <div className="text-xs text-center mt-1 text-gym-600">
            Set {activeSet + 1} of {exercise.sets}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseItem;
