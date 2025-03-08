
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';
import AuthModal from '@/components/AuthModal';

const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="py-4 px-4 w-full">
      <div className="container mx-auto flex items-center justify-center relative">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleIconClick}
            className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-primary-foreground border border-border"
          >
            <img 
              src="/lovable-uploads/27fb39a1-3ad1-43f1-9ce5-0b2d7ad619b7.png" 
              alt="Gyma AI" 
              className="w-full h-full object-cover"
            />
          </button>
          <h1 className="text-2xl font-semibold text-gym-800">
            Gyma <span className="text-primary">AI</span>
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
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
