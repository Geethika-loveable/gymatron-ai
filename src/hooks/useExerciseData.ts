
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Exercise } from '@/components/ExerciseForm';
import { toast } from "@/components/ui/use-toast";
import { useAuthState } from './useAuthState';
import { fetchUserExercises, saveExercise, deleteExercise as deleteExerciseFromDb } from '@/services/exerciseService';

export const useExerciseData = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuthState();

  // Load exercises when authentication state changes
  useEffect(() => {
    if (isSignedIn) {
      loadUserExercises();
    } else {
      setExercises([]);
    }
  }, [isSignedIn]);

  // Load user exercises from Supabase
  const loadUserExercises = async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    try {
      const loadedExercises = await fetchUserExercises();
      setExercises(loadedExercises);
    } catch (error) {
      console.error("Error in loadUserExercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exercise: Exercise) => {
    // Generate a proper UUID for the exercise
    const exerciseWithUUID = {
      ...exercise,
      id: uuidv4()
    };
    
    setExercises(prevExercises => [...prevExercises, exerciseWithUUID]);
    
    if (isSignedIn) {
      await saveExercise(exerciseWithUUID);
    }
    
    toast({
      title: "Exercise added",
      description: `Added ${exercise.name} to your workout`,
    });
  };

  const deleteExercise = async (id: string) => {
    setExercises(prevExercises => prevExercises.filter(exercise => exercise.id !== id));
    
    if (isSignedIn) {
      await deleteExerciseFromDb(id);
    }
  };

  return {
    exercises,
    isSignedIn,
    loading,
    addExercise,
    deleteExercise,
    loadUserExercises,
    setExercises // Expose this to allow setting exercises from saved state
  };
};
