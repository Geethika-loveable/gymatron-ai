
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track authentication state
 * @returns Current authentication state
 */
export const useAuthState = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  useEffect(() => {
    // Check initial session
    const checkUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsSignedIn(!!data.session);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSignedIn(false);
      }
    };

    checkUserSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsSignedIn(!!session);
      }
    );

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { isSignedIn };
};
