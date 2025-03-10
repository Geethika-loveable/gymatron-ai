
import { useEffect, useRef, useState } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from '@/components/ui/use-toast';
import { WorkoutState } from './useWorkoutState';

interface WorkoutSession {
  id: string;
  user_id: string;
  is_active: boolean;
  current_exercise_index: number;
  current_set: number;
  started_at: string;
  stopwatch_time: number;
  exercises: Exercise[];
  last_updated_at: string;
}

interface UseWorkoutPersistenceProps {
  exercises: Exercise[];
  workoutState: WorkoutState;
  stopwatchTime: number;
  resetWorkout: () => void;
  setCurrentExerciseIndex: (index: number) => void;
  setCurrentSet: (set: number) => void;
  setIsWorkoutStarted: (started: boolean) => void;
  setStopwatchTime?: (time: number) => void;
}

export const useWorkoutPersistence = ({
  exercises,
  workoutState,
  stopwatchTime,
  resetWorkout,
  setCurrentExerciseIndex,
  setCurrentSet,
  setIsWorkoutStarted,
  setStopwatchTime
}: UseWorkoutPersistenceProps) => {
  const { isSignedIn } = useAuthState();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const lastSyncedRef = useRef<number>(Date.now());
  const syncIntervalRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restoredSession, setRestoredSession] = useState<WorkoutSession | null>(null);

  // Check for active session on mount
  useEffect(() => {
    if (isSignedIn) {
      checkForActiveSession();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [isSignedIn]);

  // Create new session when workout starts
  useEffect(() => {
    if (isSignedIn && workoutState.isWorkoutStarted && !sessionId) {
      createSession();
    }
  }, [isSignedIn, workoutState.isWorkoutStarted, sessionId]);

  // Set up periodic sync when workout is active
  useEffect(() => {
    if (isSignedIn && workoutState.isWorkoutStarted && sessionId) {
      // Sync every 5 seconds
      syncIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        // Only sync if 5 seconds have passed since last sync
        if (now - lastSyncedRef.current >= 5000) {
          syncWorkoutState();
        }
      }, 5000);
    } else if (syncIntervalRef.current) {
      window.clearInterval(syncIntervalRef.current);
    }

    return () => {
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [isSignedIn, workoutState.isWorkoutStarted, sessionId]);

  // Sync when completing sets or changing exercises
  useEffect(() => {
    if (isSignedIn && sessionId && workoutState.isWorkoutStarted) {
      // Sync immediately when set or exercise changes
      syncWorkoutState();
    }
  }, [workoutState.currentExerciseIndex, workoutState.currentSet]);

  // Helper to check for active sessions
  const checkForActiveSession = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for active sessions:', error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        // Found active session
        setSessionId(data.id);
        setRestoredSession(data as WorkoutSession);
        
        // Calculate elapsed time since last update
        const lastUpdatedAt = new Date(data.last_updated_at).getTime();
        const now = Date.now();
        const additionalTime = now - lastUpdatedAt;
        
        // Total time is stored time plus elapsed time since last update
        const totalTime = data.stopwatch_time + additionalTime;
        
        // Only restore state if setStopwatchTime is provided
        if (setStopwatchTime) {
          setStopwatchTime(totalTime);
        }
        
        // Restore workout state
        setIsWorkoutStarted(true);
        setCurrentExerciseIndex(data.current_exercise_index);
        setCurrentSet(data.current_set);
        
        toast({
          title: "Workout Restored",
          description: "Your previous workout session has been restored.",
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking for active sessions:', error);
      setIsLoading(false);
    }
  };

  // Create a new session
  const createSession = async () => {
    if (!isSignedIn) return;
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      // Convert Exercise[] to a plain object format that works with JSON
      const exercisesJson = JSON.parse(JSON.stringify(exercises));

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          current_exercise_index: workoutState.currentExerciseIndex,
          current_set: workoutState.currentSet,
          stopwatch_time: stopwatchTime,
          exercises: exercisesJson
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        return;
      }
      
      setSessionId(data.id);
      lastSyncedRef.current = Date.now();
      
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Sync workout state with database
  const syncWorkoutState = async () => {
    if (!isSignedIn || !sessionId) return;
    
    try {
      // Convert Exercise[] to a plain object format that works with JSON
      const exercisesJson = JSON.parse(JSON.stringify(exercises));
      
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          current_exercise_index: workoutState.currentExerciseIndex,
          current_set: workoutState.currentSet,
          stopwatch_time: stopwatchTime,
          last_updated_at: new Date().toISOString(),
          exercises: exercisesJson
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error syncing workout state:', error);
        return;
      }
      
      lastSyncedRef.current = Date.now();
      
    } catch (error) {
      console.error('Error syncing workout state:', error);
    }
  };

  // Mark session as inactive when workout ends
  const endSession = async () => {
    if (!isSignedIn || !sessionId) return;
    
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          is_active: false,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error ending session:', error);
        return;
      }
      
      setSessionId(null);
      
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Extending the resetWorkout functionality
  const resetWithPersistence = () => {
    endSession();
    resetWorkout();
  };

  return {
    isLoading,
    sessionId,
    resetWithPersistence,
    syncWorkoutState,
    restoredSession
  };
};
