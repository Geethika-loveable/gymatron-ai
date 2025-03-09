
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
      try {
        const { data } = await supabase.auth.getSession();
        const isUserSignedIn = !!data.session;
        setIsSignedIn(isUserSignedIn);
        
        if (isUserSignedIn) {
          setLoading(true);
          await loadUserExercises();
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkUserSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const isUserSignedIn = !!session;
        setIsSignedIn(isUserSignedIn);
        
        if (event === 'SIGNED_IN') {
          setLoading(true);
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
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        setLoading(false);
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('user_exercises')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Loaded exercises:", data);
        const loadedExercises = data.map(item => ({
          id: item.id,
          name: item.name,
          sets: item.sets,
          reps: item.reps
        }));
        
        setExercises(loadedExercises);
      }
    } catch (error: any) {
      console.error("Error loading exercises:", error);
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
      console.log("Saving exercise to database:", exercise);
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('user_exercises')
        .insert({
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          user_id: userId
        });
      
      if (error) throw error;
      
      console.log("Exercise saved successfully");
      
    } catch (error: any) {
      console.error("Error saving exercise:", error);
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
      console.error("Error deleting exercise:", error);
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
    
    setExercises(prevExercises => [...prevExercises, exerciseWithUUID]);
    
    if (isSignedIn) {
      await saveExerciseToDatabase(exerciseWithUUID);
    }
    
    toast({
      title: "Exercise added",
      description: `Added ${exercise.name} to your workout`,
    });
  };

  const deleteExercise = async (id: string) => {
    setExercises(prevExercises => prevExercises.filter(exercise => exercise.id !== id));
    
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
