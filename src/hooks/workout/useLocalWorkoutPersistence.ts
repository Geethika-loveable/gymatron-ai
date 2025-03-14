
import { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/components/ExerciseForm';
import { WorkoutState } from './types';

// Define the structure of our locally stored workout state
export interface LocalWorkoutState extends WorkoutState {
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
      
      console.log('Saving state to localStorage with stopwatch time:', stateToSave.stopwatchTime);
      localStorage.setItem(STORAGE_KEYS.WORKOUT_STATE, JSON.stringify(stateToSave));
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
      console.log('Loaded workout state from localStorage with stopwatch time:', parsedState.stopwatchTime);
      
      // Validate the parsed state - basic structure check
      if (!parsedState || 
          typeof parsedState.isWorkoutStarted !== 'boolean' ||
          !Array.isArray(parsedState.exercises) ||
          typeof parsedState.stopwatchTime !== 'number') {
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
      // This is just a safeguard for additional persistence
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
