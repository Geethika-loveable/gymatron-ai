
import { useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

/**
 * Hook to access analytics functionality throughout the app
 */
export const useAnalytics = () => {
  // Track page view when component mounts
  useEffect(() => {
    analyticsService.trackEvent('page_view', {
      path: window.location.pathname,
      title: document.title
    });
  }, []);
  
  // Track event helper function
  const trackEvent = useCallback((eventName: string, properties = {}) => {
    analyticsService.trackEvent(eventName, properties);
  }, []);
  
  // Initialize analytics session
  const initializeSession = useCallback((isFirstVisit = false) => {
    analyticsService.startSession(isFirstVisit);
  }, []);
  
  return {
    trackEvent,
    initializeSession
  };
};
