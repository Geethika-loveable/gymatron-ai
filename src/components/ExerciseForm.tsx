import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

interface ExerciseFormProps {
  onAddExercise: (exercise: Exercise) => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ onAddExercise }) => {
  const [name, setName] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Exercise name required",
        description: "Please enter an exercise name",
        variant: "destructive",
      });
      return;
    }
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: name.trim(),
      sets,
      reps
    };
    
    onAddExercise(newExercise);
    setName('');
    // Keep sets and reps at their current values for faster entry of similar exercises
  };
  
  const handleSetChange = (increment: boolean) => {
    setSets(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(10, newValue));
    });
  };
  
  const handleRepChange = (increment: boolean) => {
    setReps(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(50, newValue));
    });
  };

  return (
    <div className="glass-panel p-6 mx-auto max-w-md w-full mb-6 animate-slide-up">
      <h2 className="text-lg font-semibold mb-4 text-gym-800">Add Exercise</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="exercise-name" className="block text-sm font-medium text-gym-700 mb-1">
            Exercise Name
          </label>
          <Input
            id="exercise-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bench Press"
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gym-700 mb-1">
              Sets
            </label>
            <div className="flex items-center">
              <Button 
                type="button" 
                onClick={() => handleSetChange(false)}
                variant="outline" 
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
              >
                <Minus size={16} />
              </Button>
              
              <div className="flex-1 text-center font-medium">
                {sets}
              </div>
              
              <Button 
                type="button" 
                onClick={() => handleSetChange(true)}
                variant="outline" 
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gym-700 mb-1">
              Reps
            </label>
            <div className="flex items-center">
              <Button 
                type="button" 
                onClick={() => handleRepChange(false)}
                variant="outline" 
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
              >
                <Minus size={16} />
              </Button>
              
              <div className="flex-1 text-center font-medium">
                {reps}
              </div>
              
              <Button 
                type="button" 
                onClick={() => handleRepChange(true)}
                variant="outline" 
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
        >
          Add Exercise
        </Button>
      </form>
    </div>
  );
};

export default ExerciseForm;
