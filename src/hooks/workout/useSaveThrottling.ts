
import { useCallback, useRef } from 'react';

interface UseSaveThrottlingProps {
  saveCallback: () => void;
  isInitialized: boolean;
  isRestoringState: boolean;
}

export const useSaveThrottling = ({
  saveCallback,
  isInitialized,
  isRestoringState
}: UseSaveThrottlingProps) => {
  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledSave = useCallback(() => {
    if (!isInitialized || isRestoringState) return;
    
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    if (timeSinceLastSave < 2000) {
      saveTimeoutRef.current = setTimeout(() => {
        saveCallback();
        saveTimeoutRef.current = null;
      }, 2000 - timeSinceLastSave);
      return;
    }
    
    saveCallback();
    lastSaveTimeRef.current = now;
  }, [isInitialized, isRestoringState, saveCallback]);

  // Force save ensures state is saved immediately, bypassing throttling
  const forceSave = useCallback(() => {
    if (!isInitialized) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    saveCallback();
    lastSaveTimeRef.current = Date.now();
  }, [isInitialized, saveCallback]);

  return {
    throttledSave,
    forceSave
  };
};
