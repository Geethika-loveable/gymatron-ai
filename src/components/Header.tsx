
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

// Remove the import of AuthModal as it's now managed globally from Index.tsx
// import AuthModal from '@/components/AuthModal';

interface HeaderProps {
  onOpenAuthModal: () => void;  // Add this prop to open the global auth modal
}

const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in on component mount
  React.useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in",
            description: "You've successfully signed in",
          });
        }
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been signed out",
          });
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  const handleIconClick = () => {
    if (user) {
      navigate('/account');
    } else {
      // Use the prop to open the global auth modal
      onOpenAuthModal();
    }
  };

  return (
    <header className="py-2 px-4 w-full bg-background/95 backdrop-blur-sm z-50 border-b border-border/10">
      <div className="container mx-auto flex items-center justify-center relative">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleIconClick}
            className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-primary-foreground border border-border"
          >
            <img 
              src="/uploads/icon.png" 
              alt="Gyma App" 
              className="w-full h-full object-cover"
            />
          </button>
          <h1 className="text-2xl font-semibold text-gym-800 border-border" onClick={handleIconClick}>
            Gyma <span className="text-primary">App</span>
          </h1>
        </div>
        
        {user && (
          <div className="absolute right-0">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      
      {/* Remove the local AuthModal component */}
    </header>
  );
};

export default Header;
