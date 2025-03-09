
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/components/ExerciseForm';
import { toast } from "@/components/ui/use-toast";

/**
 * Fetches exercises for the current user from Supabase
 * @returns An array of exercises
 */
export const fetchUserExercises = async (): Promise<Exercise[]> => {
  try {
    console.log("Starting to fetch user exercises...");
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      console.log("No user ID found, stopping fetch");
      return [];
    }
    
    console.log("Fetching exercises for user:", userId);
    const { data, error } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching exercises:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log("Loaded exercises:", data);
      return data.map(item => ({
        id: item.id,
        name: item.name,
        sets: item.sets,
        reps: item.reps
      }));
    } else {
      console.log("No exercises found for user");
      return [];
    }
  } catch (error: any) {
    console.error("Error loading exercises:", error);
    toast({
      title: "Error loading exercises",
      description: error.message,
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Saves a new exercise to Supabase
 * @param exercise The exercise to save
 * @returns Promise<void>
 */
export const saveExercise = async (exercise: Exercise): Promise<void> => {
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

/**
 * Deletes an exercise from Supabase
 * @param id The ID of the exercise to delete
 * @returns Promise<void>
 */
export const deleteExercise = async (id: string): Promise<void> => {
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
