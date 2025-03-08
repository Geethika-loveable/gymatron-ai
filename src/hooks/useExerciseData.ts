
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/components/ExerciseForm';
import { toast } from "@/components/ui/use-toast";

export const useExerciseData = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is signed in and load their exercises
  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      const isUserSignedIn = !!data.session;
      setIsSignedIn(isUserSignedIn);
      
      if (isUserSignedIn) {
        await loadUserExercises();
      }
    };

    checkUserSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const isUserSignedIn = !!session;
        setIsSignedIn(isUserSignedIn);
        
        if (event === 'SIGNED_IN') {
          await loadUserExercises();
        } else if (event === 'SIGNED_OUT') {
          setExercises([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load user exercises from Supabase
  const loadUserExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_exercises')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const loadedExercises = data.map(item => ({
          id: item.id,
          name: item.name,
          sets: item.sets,
          reps: item.reps
        }));
        
        setExercises(loadedExercises);
      }
    } catch (error: any) {
      toast({
        title: "Error loading exercises",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save exercise to Supabase
  const saveExerciseToDatabase = async (exercise: Exercise) => {
    if (!isSignedIn) return;
    
    try {
      const { error } = await supabase
        .from('user_exercises')
        .insert({
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Error saving exercise",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete exercise from Supabase
  const deleteExerciseFromDatabase = async (id: string) => {
    if (!isSignedIn) return;
    
    try {
      const { error } = await supabase
        .from('user_exercises')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Error deleting exercise",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addExercise = async (exercise: Exercise) => {
    // Generate a proper UUID for the exercise
    const exerciseWithUUID = {
      ...exercise,
      id: uuidv4()
    };
    
    setExercises([...exercises, exerciseWithUUID]);
    
    if (isSignedIn) {
      await saveExerciseToDatabase(exerciseWithUUID);
    }
    
    toast({
      title: "Exercise added",
      description: `Added ${exercise.name} to your workout`,
    });
  };

  const deleteExercise = async (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
    
    if (isSignedIn) {
      await deleteExerciseFromDatabase(id);
    }
  };

  return {
    exercises,
    isSignedIn,
    loading,
    addExercise,
    deleteExercise
  };
};
