
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Account = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        navigate('/');
        return;
      }
      
      setUser(data.user);
      
      // Fetch user profile
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-md flex-1">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mr-2"
          >
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Link>
          </Button>
        </div>
        
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profile?.name || 'No name set'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-6 bg-background border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            &copy; All rights Reserved 2025.
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Gyma AI is a product of 
            </span>
            <a 
              href="https://azynctra.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="/uploads/azynctra.png"
                alt="Azynctra" 
                className="h-6" 
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Account;
