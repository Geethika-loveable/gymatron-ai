
import { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { WorkoutState } from './useWorkoutState';

// Define the structure of our locally stored workout state
interface LocalWorkoutState extends WorkoutState {
  exercises: Exercise[];
  workoutStartTime: number; // timestamp in ms
  stopwatchTime: number; // elapsed time in ms
  lastSavedAt: number; // timestamp for sync purposes
}

// Storage keys
const STORAGE_KEYS = {
  WORKOUT_STATE: 'workout_state_v1',
};

export const useLocalWorkoutPersistence = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Save workout state to localStorage
  const saveWorkoutState = useCallback((state: LocalWorkoutState) => {
    try {
      // Update lastSavedAt timestamp
      const stateToSave = {
        ...state,
        lastSavedAt: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.WORKOUT_STATE, JSON.stringify(stateToSave));
      console.log('Workout state saved to localStorage:', stateToSave);
    } catch (error) {
      console.error('Error saving workout state:', error);
    }
  }, []);

  // Load workout state from localStorage
  const loadWorkoutState = useCallback((): LocalWorkoutState | null => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.WORKOUT_STATE);
      
      if (!savedState) {
        return null;
      }
      
      const parsedState = JSON.parse(savedState) as LocalWorkoutState;
      console.log('Loaded workout state from localStorage:', parsedState);
      
      // Validate the parsed state - basic structure check
      if (!parsedState || 
          typeof parsedState.isWorkoutStarted !== 'boolean' ||
          !Array.isArray(parsedState.exercises)) {
        console.error('Invalid stored workout state, clearing');
        localStorage.removeItem(STORAGE_KEYS.WORKOUT_STATE);
        return null;
      }
      
      return parsedState;
    } catch (error) {
      console.error('Error loading workout state:', error);
      // Clear potentially corrupted data
      localStorage.removeItem(STORAGE_KEYS.WORKOUT_STATE);
      return null;
    }
  }, []);

  // Clear workout state from localStorage
  const clearWorkoutState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_STATE);
    console.log('Workout state cleared from localStorage');
  }, []);

  // Initialize by checking for existing state
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Set up listeners for page lifecycle events
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This is just a safeguard - we'll primarily rely on
      // explicit saves during workout state changes
      console.log('Window beforeunload event triggered');
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    saveWorkoutState,
    loadWorkoutState,
    clearWorkoutState,
    isInitialized,
  };
};
